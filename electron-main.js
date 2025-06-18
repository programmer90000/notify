const { app, BrowserWindow, ipcMain, Notification } = require("electron");
const path = require("path");

let mainWindow;

const isDev = !app.isPackaged;

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

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") { app.quit(); }
});

app.setLoginItemSettings({
    "openAtLogin": true,
});
