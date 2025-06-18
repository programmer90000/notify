const { app, BrowserWindow, ipcMain, Notification } = require("electron");
const { spawn } = require("child_process");
const path = require("path");

let mainWindow;
let backendProcess;

const isDev = !app.isPackaged;


function startBackend() {
    const backendPath = isDev ? path.join(__dirname, "backend", "server.js") : path.join(process.resourcesPath, "app", "backend", "server.js");
    
    console.log("Starting backend from:", backendPath);
    
    backendProcess = spawn("node", [backendPath], {
        "stdio": ["pipe", "pipe", "pipe"],
    });
    
    backendProcess.stdout.on("data", (data) => {
        console.log(`Backend: ${data.toString()}`);
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

app.whenReady().then(() => {
    // Start backend first, then create window
    startBackend();
    
    // Wait a moment for backend to start, then create window
    setTimeout(createWindow, 2000);
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
