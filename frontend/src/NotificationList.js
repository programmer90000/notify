import React, { useState, useEffect } from "react";

const NotificationList = ({ onNavigateBack }) => {
    const [notifications, setNotifications] = useState([]);
    const [editTarget, setEditTarget] = useState(null);


    const loadNotifications = () => {
        fetch("http://localhost:3001/notifications/all")
            .then((res) => { return res.json(); })
            .then(setNotifications);
    };

    const handleDelete = (id) => {
        fetch(`http://localhost:3001/notifications/${id}`, {
            "method": "DELETE",
        })
            .then((res) => { return res.json(); })
            .then(() => { return loadNotifications(); })
            .catch((err) => { return console.error("Delete error:", err); });
    };

    const handleEdit = (notification) => {
        setEditTarget(notification);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();

        fetch(`http://localhost:3001/notifications/${editTarget.id}`, {
            "method": "PUT",
            "headers": { "Content-Type": "application/json" },
            "body": JSON.stringify(editTarget),
        })
            .then((res) => { return res.json(); })
            .then(() => {
                setEditTarget(null);
                loadNotifications();
            })
            .catch((err) => { return console.error("Edit error:", err); });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditTarget((prev) => { return { ...prev, [name]: value }; });
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    return (
        <div className = "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 font-sans">
            <div className = "max-w-4xl mx-auto">
                <div className = "bg-white p-8 rounded-xl shadow-2xl border border-gray-200">
                    <div className = "flex justify-between items-center mb-8">
                        <h1 className = "text-3xl font-extrabold text-gray-900">Your Notifications</h1>
                        <button onClick = {onNavigateBack} className = "px-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50">Back to Setter</button>
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
                                                <span className = "ml-4 inline-block px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800 whitespace-nowrap">
                                                    {notification.repeatability.charAt(0).toUpperCase() + notification.repeatability.slice(1)}
                                                </span>
                                            </div>
                                            {notification.description && (
                                                <div className = "max-h-32 overflow-y-auto pr-2 mt-2">
                                                    <p className = "text-gray-600 whitespace-normal break-words">{notification.description}</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className = "ml-4 flex flex-col space-y-2">
                                            <button onClick = {() => { return handleEdit(notification); }} className = "px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">Edit</button>
                                            <button onClick = {() => { return handleDelete(notification.id); }} className = "px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm">Delete</button>
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

            {editTarget && (
                <div className = "fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <form onSubmit = {handleEditSubmit} className = "bg-white p-6 rounded-lg shadow-xl w-full max-w-lg space-y-4">
                        <h2 className = "text-xl font-bold text-gray-800">Edit Notification</h2>
                        <input type = "text" name = "title" value = {editTarget.title} onChange = {handleInputChange} className = "w-full border px-3 py-2 rounded" placeholder = "Title" required />
                        <textarea name = "description" value = {editTarget.description} onChange = {handleInputChange} className = "w-full border px-3 py-2 rounded" placeholder = "Description" />
                        <input type = "date" name = "date" value = {editTarget.date} onChange = {handleInputChange} className = "w-full border px-3 py-2 rounded" required />
                        <input type = "time" name = "time" value = {editTarget.time} onChange = {handleInputChange} className = "w-full border px-3 py-2 rounded" required />
                        <select name = "repeatability" value = {editTarget.repeatability} onChange = {handleInputChange} className = "w-full border px-3 py-2 rounded">
                            <option value = "none">None</option>
                            <option value = "daily">Daily</option>
                            <option value = "weekly">Weekly</option>
                            <option value = "monthly">Monthly</option>
                        </select>
                        <div className = "flex justify-end space-x-2">
                            <button type = "button" onClick = {() => { return setEditTarget(null); }} className = "px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
                            <button type = "submit" className = "px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Save</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default NotificationList;
