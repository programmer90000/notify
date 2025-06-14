const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./notifications.db");

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
