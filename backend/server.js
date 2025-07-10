const express = require("express");
const cors = require("cors");
const app = express();
const db = require("./database");

app.use(cors()); // Enable CORS for all routes
app.use(express.json());

// Start the server
app.listen(3001, () => {
    console.log("Server listening on port 3001");
});

// Create new notifications
app.post("/notifications", (req, res) => {
    const { title, description, date, time, repeatability } = req.body;
    db.run(`
    INSERT INTO notifications (title, description, date, time, repeatability, displayed)
    VALUES (?, ?, ?, ?, ?, 0);
  `, [title, description, date, time, repeatability], (err) => {
        if (err) {
            console.error(err);
            res.status(500).send({ "message": "Error saving notification" });
        } else {
            res.send({ "message": "Notification saved successfully" });
        }
    });
});

// Get all notifications
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

// Delete a notification by ID
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

// Update a notification by ID
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

// Mark a notification as completed or not completed
app.put("/notifications/:id/complete", (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;
    db.run(
        "UPDATE notifications SET completed = ? WHERE id = ?",
        [completed ? 1 : 0, id],
        function (err) {
            if (err) {
                console.error(err);
                res.status(500).send({ "message": "Failed to update completion status" });
            } else {
                res.send({ "message": "Completion status updated" });
            }
        },
    );
});
