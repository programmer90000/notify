// This is a script to read all notifications from the database and log them to the console. This script should be removed before the release of the app, as it is used for debugging and verifying that notifications are being stored correctly.

const db = require("./database");

db.all("SELECT * FROM notifications", (err, rows) => {
    if (err) {
        console.error("Error reading from DB:", err);
        process.exit(1);
    }
    console.table(rows);
    process.exit(0);
});
