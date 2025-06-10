const express = require("express");
const cors = require("cors");
const app = express();
const db = require("./database");

app.use(cors());
app.use(express.json());

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

app.delete("/notifications/:id", (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM notifications WHERE id = ?", [id], function (err) {
        if (err) {
            console.error(err);
            res.status(500).send({ "message": "Failed to delete notification" });
        } else {
            res.send({ "message": "Notification deleted" });
        }
    });
});

app.put("/notifications/:id", (req, res) => {
    const { id } = req.params;
    const { title, description, date, time, repeatability } = req.body;

    db.run(`
        UPDATE notifications
        SET title = ?, description = ?, date = ?, time = ?, repeatability = ?
        WHERE id = ?
    `, [title, description, date, time, repeatability, id], function (err) {
        if (err) {
            console.error(err);
            res.status(500).send({ "message": "Failed to update notification" });
        } else {
            res.send({ "message": "Notification updated" });
        }
    });
});
