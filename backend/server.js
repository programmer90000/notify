const express = require("express");
const app = express();
const db = require("./database");

app.post("/notifications", (req, res) => {
    const { title, description, date, time, repeatability } = req.body;
    db.run(`
    INSERT INTO notifications (title, description, date, time, repeatability)
    VALUES (?, ?, ?, ?, ?);
  `, [title, description, date, time, repeatability], (err) => {
        if (err) {
            console.error(err);
            res.status(500).send({ "message": "Error saving notification" });
        } else {
            res.send({ "message": "Notification saved successfully" });
        }
    });
});

app.listen(3001, () => {
    console.log("Server listening on port 3001");
});

app.get("/notifications/all", (req, res) => {
    db.all("SELECT * FROM notifications", (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).send({ "message": "Error retrieving notifications" });
        } else {
            res.send(rows);
        }
    });
});
