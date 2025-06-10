import React, { useState, useEffect } from "react";

const NotificationList = ({ onNavigateBack }) => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        fetch("http://localhost:3001/notifications/all")
            .then((response) => { return response.json(); })
            .then((data) => { return setNotifications(data); });
    }, []);

    const handleDelete = (id) => {
        console.log("Delete notification with id:", id);
    };

    const handleEdit = (id) => {
        console.log("Edit notification with id:", id);
    };

    return (
        <div className = "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 font-sans">
            <div className = "max-w-4xl mx-auto">
                <div className = "bg-white p-8 rounded-xl shadow-2xl border border-gray-200">
                    <div className = "flex justify-between items-center mb-8">
                        <h1 className = "text-3xl font-extrabold text-gray-900">Your Notifications</h1>
                        <button onClick = {onNavigateBack} className = "px-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 text-sm">Back to Setter</button>
                    </div>

                    {notifications.length === 0 ? (
                        <p className = "text-gray-500 text-center py-8">No notifications yet</p>
                    ) : (
                        <div className = "space-y-6">
                            {notifications.map((notification) => { return (
                                <div key = {notification.id} className = "p-6 border border-gray-200 rounded-lg hover:shadow-md transition duration-200">
                                    <div className = "flex justify-between">
                                        <div className = "flex-1 min-w-0">
                                            <div className = "flex justify-between items-start">
                                                <h2 className = "text-xl font-bold text-gray-800 mb-2">{notification.title}</h2>
                                                <span className = "ml-4 inline-block px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800 whitespace-nowrap">{notification.repeatability.charAt(0).toUpperCase() + notification.repeatability.slice(1)}</span>
                                            </div>
                                            {notification.description && (
                                                <div className = "max-h-32 overflow-y-auto pr-2 mt-2">
                                                    <p className = "text-gray-600 whitespace-normal break-words">{notification.description}</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className = "ml-4 flex flex-col space-y-2">
                                            <button onClick = {() => { return handleEdit(notification.id); }} className = "px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 text-sm">Edit</button>
                                            <button onClick = {() => { return handleDelete(notification.id); }} className = "px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-200 text-sm" >Delete</button>
                                        </div>
                                    </div>
                                    <div className = "mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm text-gray-500">
                                        <span>Date: {notification.date}</span>
                                        <span>Time: {notification.time}</span>
                                    </div>
                                </div>
                            ); })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationList;
