const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const os = require("os");

const appDataDir = path.join(os.homedir(), ".notify-app");
if (!fs.existsSync(appDataDir)) {
    fs.mkdirSync(appDataDir);
}

const dbPath = path.join(appDataDir, "notifications.db");

const db = new sqlite3.Database(dbPath);

db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      description TEXT,
      date TEXT,
      time TEXT,
      repeatability TEXT,
      completed INTEGER DEFAULT 0 -- 0 for incomplete, 1 for complete
    );
  `);

module.exports = db;
