const { app, BrowserWindow, ipcMain, Notification } = require("electron");

let mainWindow;
let scheduledNotifications = [];

function getNextMonthlyDate(currentDate) {
    const year = currentDate.getUTCFullYear();
    const month = currentDate.getUTCMonth();
    const day = currentDate.getUTCDate();

    const lastDayCurrentMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const lastDayNextMonth = new Date(Date.UTC(year, month + 2, 0)).getUTCDate();

    let nextDay;

    if (lastDayNextMonth < lastDayCurrentMonth && day === lastDayCurrentMonth) {
        // Only if next month is shorter AND current date is last day of current month
        nextDay = lastDayNextMonth;
    } else {
        nextDay = Math.min(day, lastDayNextMonth);
    }

    return new Date(Date.UTC(year, month + 1, nextDay));
}

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
        console.log(`
January 31st: ${getNextMonthlyDate(new Date(Date.UTC(2023, 0, 31)))}
February 28th: ${getNextMonthlyDate(new Date(Date.UTC(2023, 1, 28)))}
March 15th: ${getNextMonthlyDate(new Date(Date.UTC(2023, 2, 15)))}
            `);
            
        break;
    default:
        nextDate = null;
    }
    return nextDate;
}

function scheduleNotification({ title, body, timestamp, repeatability, originalNotification }) {
    const delay = timestamp - Date.now();

    function showNotificationAndScheduleNext() {

        new Notification({ title, body }).show();

        if (!repeatability) { return; }

        const currentDate = new Date(timestamp);
        const nextDate = getNextNotificationDate(currentDate, repeatability);

        if (!nextDate) { return; }

        const nextNotificationDate = nextDate.toISOString().split("T")[0];
        const nextNotificationTime = nextDate.toTimeString().split(" ")[0];

        const newNotification = {
            title,
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
    }

    if (delay <= 0) {
        showNotificationAndScheduleNext();
        return;
    }

    setTimeout(showNotificationAndScheduleNext, delay);
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

    if (notification.completed === 1 || notification.completed === true) {
        return;
    }

    const timestamp = new Date(`${notification.date}T${notification.time}`).getTime();

    scheduleNotification({ "title": notification.title, "body": notification.description || "", timestamp, "repeatability": notification.repeatability, "originalNotification": notification });

    scheduledNotifications.push(notification);
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
