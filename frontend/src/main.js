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
