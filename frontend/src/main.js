const { app, BrowserWindow, ipcMain, Notification } = require("electron");

let mainWindow;
let scheduledNotifications = [];

function scheduleNotification({ title, body, timestamp }) {
    const delay = timestamp - Date.now();
    if (delay <= 0) {
        new Notification({ title, body }).show();
        return;
    }
  
    setTimeout(() => {
        new Notification({ title, body }).show();
    }, delay);
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
    if (notification.completed === 1 || notification.completed === true) { return; }

    const timestamp = new Date(`${notification.date}T${notification.time}`).getTime();

    scheduleNotification({ "title": notification.title, "body": notification.description || "", timestamp });
    scheduledNotifications.push(notification);
  
    if (notification.repeatability === "daily") {
        const currentDate = new Date(`${notification.date}T${notification.time}`);
        const nextDate = new Date(currentDate.getTime() + 86400000);
        const nextNotificationDate = nextDate.toISOString().split("T")[0];
        const nextNotificationTime = nextDate.toLocaleTimeString("en-GB", { "hour": "2-digit", "minute": "2-digit" });

        const newNotification = {
            "title": notification.title,
            "description": notification.description,
            "date": nextNotificationDate,
            "time": nextNotificationTime,
            "repeatability": notification.repeatability,
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
                console.log(`Notification saved successfully: ${data}`);
            })
            .catch((error) => {
                console.error(error);
            });
  
        const newTimestamp = new Date(`${nextNotificationDate}T${nextNotificationTime}`).getTime();
        scheduleNotification({ "title": newNotification.title, "body": newNotification.description || "", "timestamp": newTimestamp });
    }

    if (notification.repeatability === "weekly") {
        const currentDate = new Date(`${notification.date}T${notification.time}`);
        const nextDate = new Date(currentDate.getTime() + 604800000);
        const nextNotificationDate = nextDate.toISOString().split("T")[0];
        const nextNotificationTime = nextDate.toTimeString().split(" ")[0];

        const newNotification = {
            "title": notification.title,
            "description": notification.description,
            "date": nextNotificationDate,
            "time": nextNotificationTime,
            "repeatability": notification.repeatability,
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
                console.log(`Notification saved successfully: ${data}`);
            })
            .catch((error) => {
                console.error(error);
            });
  
        const newTimestamp = new Date(`${nextNotificationDate}T${nextNotificationTime}`).getTime();
        scheduleNotification({ "title": newNotification.title, "body": newNotification.description || "", "timestamp": newTimestamp });
    }

    if (notification.repeatability === "monthly") {
        const currentDate = new Date(`${notification.date}T${notification.time}`);
        let nextMonth = currentDate.getMonth() + 1;
        let nextYear = currentDate.getFullYear();
    
        if (nextMonth === 12) {
            nextMonth = 0;
            nextYear++;
        }
    
        const nextDate = new Date(nextYear, nextMonth, currentDate.getDate(), currentDate.getHours(), currentDate.getMinutes());
        let nextNotificationDate = nextDate.toISOString().split("T")[0];
        let nextNotificationTime = nextDate.toTimeString().split(" ")[0];
    
        if (nextDate.getDate() !== currentDate.getDate()) {
            nextDate.setDate(0);
            nextNotificationDate = nextDate.toISOString().split("T")[0];
            nextNotificationTime = nextDate.toTimeString().split(" ")[0];
        }
    
        const newNotification = {
            "title": notification.title,
            "description": notification.description,
            "date": nextNotificationDate,
            "time": nextNotificationTime,
            "repeatability": notification.repeatability,
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
                console.log(`Notification saved successfully: ${data}`);
            })
            .catch((error) => {
                console.error(error);
            });
    
        const newTimestamp = new Date(`${nextNotificationDate}T${nextNotificationTime}`).getTime();
        scheduleNotification({ "title": newNotification.title, "body": newNotification.description || "", "timestamp": newTimestamp });
    }
});

function createWindow() {
    mainWindow = new BrowserWindow({
        "width": 800,
        "height": 600,
        "webPreferences": {
            "contextIsolation": false,
            "nodeIntegration": true,
        },
    });

    mainWindow.loadURL("http://localhost:3000");

    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") { app.quit(); }
});
