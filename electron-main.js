const { app, BrowserWindow, ipcMain, Notification } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const db = require("./backend/database.js");

// Set up logging to a file
const logFile = path.join(app.getPath("userData"), "main.log");
const logStream = fs.createWriteStream(logFile, { "flags": "a" });
console.log = (...args) => { return logStream.write(`${args.join(" ")}\n`); };
console.error = (...args) => { return logStream.write(`[ERR] ${args.join(" ")}\n`); };

let mainWindow;
let backendProcess;
let scheduledNotifications = [];

function getNextNotificationDate(currentDate, repeatability) {
    let nextDate;
    switch (repeatability) {
    case "daily":
        nextDate = new Date(currentDate.getTime() + 86400000); // +1 day
        break;
    case "weekly":
        nextDate = new Date(currentDate.getTime() + 604800000); // +7 days
        break;
    case "monthly":
        nextDate = new Date(currentDate);
        nextDate.setMonth(nextDate.getMonth() + 1); // + 1 month
        break;
    default:
        nextDate = null;
    }
    return nextDate;
}

function scheduleNotification({ title, body, timestamp, repeatability, originalNotification }) {
    const delay = timestamp - Date.now();

    function showNotificationAndScheduleNext() {
        // Check if the notification already exists in the database and is marked as completed
        db.get(
            "SELECT * FROM notifications WHERE title = ? AND date = ? AND time = ?",
            [title, originalNotification.date, originalNotification.time],
            (err, row) => {
                if (err) {
                    console.error("Database error:", err);
                    return;
                }

                if (!row) {
                    console.log("Notification not found in database, skipping...");
                    return;
                }

                if (row.completed === 1) {
                    console.log("Notification is marked as completed, skipping display...");
                    // Continue with repeating logic even if completed
                    if (!repeatability) { return; }
                    
                    const currentDate = new Date(timestamp);
                    const nextDate = getNextNotificationDate(currentDate, repeatability);
                    
                    if (!nextDate) { return; }
                    
                    const nextNotificationDate = nextDate.toISOString().split("T")[0];
                    const nextNotificationTime = nextDate.toTimeString().split(" ")[0];

                    const newNotification = {
                        "title": title.endsWith(" - Completed") ? title.replace(" - Completed", "") : title,
                        "description": body,
                        "date": nextNotificationDate,
                        "time": nextNotificationTime,
                        repeatability,
                        "completed": 0,
                    };
                    
                    fetch("http://localhost:3001/notifications", {
                        "method": "POST",
                        "headers": { "Content-Type": "application/json" },
                        "body": JSON.stringify(newNotification),
                    })
                        .then((response) => {
                            if (!response.ok) { throw new Error(response.statusText); }
                            return response.json();
                        })
                        .then((data) => {
                            console.log(`Repeated notification saved: ${JSON.stringify(data)}`);
                            const nextTimestamp = new Date(`${newNotification.date}T${newNotification.time}`).getTime();
                            // Generate a new notification object for repeating notifications
                            scheduleNotification({
                                "title": newNotification.title,
                                "body": newNotification.description || "",
                                "timestamp": nextTimestamp,
                                "repeatability": newNotification.repeatability,
                                "originalNotification": newNotification,
                            });
                        })
                        .catch((error) => {
                            console.error("Failed to save repeated notification:", error);
                        });
                    
                    return;
                }

                console.log("Showing notification:", title);
                new Notification({ title, body }).show();

                db.run("UPDATE notifications SET displayed = 1 WHERE id = ?", [row.id], (err) => {
                    if (err) { console.error("Failed to update displayed status:", err); }
                });

                // Handle repeatability logic
                if (!repeatability) { return; }

                const currentDate = new Date(timestamp);
                const nextDate = getNextNotificationDate(currentDate, repeatability);

                if (!nextDate) { return; }

                const nextNotificationDate = nextDate.toISOString().split("T")[0];
                const nextNotificationTime = nextDate.toTimeString().split(" ")[0];

                // Stop monthly notifications repeating multiple times
                const shouldStopAfterThis = repeatability === "monthly" && originalNotification && originalNotification.alreadyRepeated;

                if (shouldStopAfterThis) {
                    return;
                }

                const newNotification = {
                    "title": title.endsWith(" - Completed") ? title.replace(" - Completed", "") : title,
                    "description": body,
                    "date": nextNotificationDate,
                    "time": nextNotificationTime,
                    repeatability,
                    "completed": 0,
                };

                fetch("http://localhost:3001/notifications", {
                    "method": "POST",
                    "headers": { "Content-Type": "application/json" },
                    "body": JSON.stringify(newNotification),
                })
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error(response.statusText);
                        }
                        return response.json();
                    })
                    .then((data) => {
                        console.log(`Notification saved successfully: ${JSON.stringify(data)}`);
                        const nextTimestamp = new Date(`${newNotification.date}T${newNotification.time}`).getTime();
                        scheduleNotification({
                            "title": newNotification.title,
                            "body": newNotification.description || "",
                            "timestamp": nextTimestamp,
                            "repeatability": newNotification.repeatability,
                            "originalNotification": newNotification,
                        });
                    })
                    .catch((error) => {
                        console.error("Failed to save notification:", error);
                    });
            },
        );
    }

    if (delay <= 0) {
        showNotificationAndScheduleNext();
        return;
    }

    const MAX_DELAY = 2147483647;
    if (delay <= MAX_DELAY) {
        setTimeout(showNotificationAndScheduleNext, delay);
    } else {
        setTimeout(() => {
            const remainingDelay = timestamp - Date.now();
            if (remainingDelay > 0) {
                scheduleNotification({ title, body, timestamp, repeatability, originalNotification });
            } else {
                showNotificationAndScheduleNext();
            }
        }, MAX_DELAY);
    }
}

ipcMain.on("schedule-notification", (event, notification) => {
    console.log(`
Notification Record:
Title: ${notification.title}
Description: ${notification.description}
Date: ${notification.date}
Time: ${notification.time}
Repeatability: ${notification.repeatability}
Completed: ${notification.completed}
    `);

    const timestamp = new Date(`${notification.date}T${notification.time}`).getTime();

    scheduleNotification({ "title": notification.title, "body": notification.description || "", timestamp, "repeatability": notification.repeatability, "originalNotification": notification });

    if (notification.completed === 1 || notification.completed === true) {
        return;
    }

    db.get("SELECT * FROM notifications WHERE id = ?", [notification.id], (err, row) => {
        if (err) {
            console.error(err);
            return;
        }

        if (!row) {
            console.log("Notification does not exist in database, skipping...");
            return;
        }
    },
    );

    scheduledNotifications.push(notification);
});

const isDev = !app.isPackaged;


function startBackend(callback) {
    const backendPath = isDev ? path.join(__dirname, "backend", "server.js") : path.join(process.resourcesPath, "app.asar.unpacked", "backend", "server.js");
    
    console.log("Starting backend from:", backendPath);
    
    backendProcess = spawn("node", [backendPath], {
        "stdio": ["pipe", "pipe", "pipe"],
    });
    
    backendProcess.stdout.on("data", (data) => {
        const message = data.toString();
        console.log(`Backend: ${message}`);

        // Wait until backend is listening before creating window
        if (message.includes("Server listening on port 3001") && callback) {
            callback();
        }
    });
    
    backendProcess.stderr.on("data", (data) => {
        console.error(`Backend Error: ${data.toString()}`);
    });
    
    backendProcess.on("close", (code) => {
        console.log(`Backend process exited with code ${code}`);
    });
    
    backendProcess.on("error", (error) => {
        console.error("Failed to start backend:", error);
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        "width": 800,
        "height": 600,
        "webPreferences": {
            "contextIsolation": false,
            "nodeIntegration": true,
        },
    });

    if (isDev) {
        mainWindow.loadURL("http://localhost:3000");
    } else {
        mainWindow.loadFile(path.join(__dirname, "frontend/dist/index.html"));
    }

    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}

app.whenReady().then(async () => {
    startBackend(createWindow);
    try {
        const overdueIncompleteRows = await new Promise((resolve, reject) => {
            db.all("SELECT * FROM notifications WHERE completed = 0 AND strftime('%Y-%m-%d %H:%M:%S', date || ' ' || time) < CURRENT_TIMESTAMP", (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                    rows.forEach((row) => {
                        const timestamp = new Date(`${row.date}T${row.time}`).getTime();
                        scheduleNotification({ "title": row.title, "body": row.description || "", "timestamp": timestamp, "repeatability": row.repeatability, "originalNotification": row });
                    });
                }
            });
        });
    } catch (err) {
        console.error(err);
    }
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") { 
        app.quit(); 
    }
});

app.on("before-quit", () => {
    if (backendProcess) {
        backendProcess.kill();
    }
});

app.setLoginItemSettings({
    "openAtLogin": true,
});
