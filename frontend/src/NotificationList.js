import React, { useState, useEffect } from "react";

const NotificationList = () => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        fetch("http://localhost:3001/notifications/all")
            .then((response) => { return response.json(); })
            .then((data) => { return setNotifications(data); });
    }, []);

    return (
        <div>
            <h1>Notification List</h1>
            {notifications.map((notification) => { return (
                <div key = {notification.id} style = {{ "display": "inline-block", "margin": "10px" }}>
                    <h2>{notification.title}</h2>
                    <p>{notification.description}</p>
                    <p>Date: {notification.date}</p>
                    <p>Time: {notification.time}</p>
                    <p>Repeatability: {notification.repeatability}</p>
                </div>
            ); })}
            <button onClick = {() => { return window.location.reload(); }}>Back to Notification Setter</button>
        </div>
    );
};

export default NotificationList;
