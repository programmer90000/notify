import React, { useState } from "react";
import NotificationList from "./NotificationList";
import "./styles.css";

const NotificationApp = () => {
    const [currentScreen, setCurrentScreen] = useState("setter");

    const navigateToList = () => {
        setCurrentScreen("list");
    };

    const navigateToSetter = () => {
        setCurrentScreen("setter");
    };

    if (currentScreen === "list") {
        return <NotificationList onNavigateBack = {navigateToSetter} />;
    }

    return (
        <div className = "w-screen h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col font-sans">
            <NotificationSetter onNavigateToList = {navigateToList} />
        </div>
    );
};

function NotificationSetter({ onNavigateToList }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [repeatability, setRepeatability] = useState("none");

    const repeatabilityOptions = [
        { "value": "none", "label": "None" },
        { "value": "daily", "label": "Daily" },
        { "value": "weekly", "label": "Weekly" },
        { "value": "monthly", "label": "Monthly" },
    ];

    const handleSubmit = (event) => {
        event.preventDefault();
      
        const notificationData = { title, description, date, time, repeatability };
      
        fetch("http://localhost:3001/notifications", {
            "method": "POST",
            "headers": { "Content-Type": "application/json" },
            "body": JSON.stringify(notificationData),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
                return response.json();
            })
            .then((data) => {
                console.log(`Notification saved successfully: ${data}`);
                fetch("http://localhost:3001/notifications/all")
                    .then((response) => { return response.json(); })
                    .then((data) => { return console.log(data); })
                    .catch((error) => { return console.error(error); });
            })
            .catch((error) => { return console.error(error); });
      
        setTitle("");
        setDescription("");
        setDate("");
        setTime("");
        setRepeatability("none");
    };

    return (
        <div className = "h-screen w-full bg-white p-8 flex flex-col">
            <div className = "flex justify-between items-center mb-6">
                <h2 className = "text-3xl font-extrabold text-gray-900">Set Your Notification</h2>
                <button onClick = {onNavigateToList} className = "px-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 text-sm">View All</button>
            </div>

            <form onSubmit = {handleSubmit} className = "flex-1 flex flex-col">
                <div className = "space-y-12 flex-1 overflow-y-auto">
                    <div>
                        <label htmlFor = "title" className = "block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input type = "text" id = "title" className = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-base" placeholder = "e.g., Meeting Reminder" value = {title} onChange = {(e) => { return setTitle(e.target.value); }} required />
                    </div>

                    <div className = "h-40">
                        <label htmlFor = "description" className = "block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                        <textarea id = "description" className = "w-full h-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-base" placeholder = "e.g., Don't forget to prepare slides for the presentation." value = {description} onChange = {(e) => { return setDescription(e.target.value); }} />
                    </div>

                    <div className = "grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor = "date" className = "block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input type = "date" id = "date" className = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-base" value = {date} onChange = {(e) => { return setDate(e.target.value); }} required />
                        </div>
                        <div>
                            <label htmlFor = "time" className = "block text-sm font-medium text-gray-700 mb-1">Time</label>
                            <input type = "time" id = "time" className = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-base" value = {time} onChange = {(e) => { return setTime(e.target.value); }} required />
                        </div>
                    </div>

                    <div>
                        <label htmlFor = "repeatability" className = "block text-sm font-medium text-gray-700 mb-1">Repeat</label>
                        <select id = "repeatability" className = "w-full px-4 py-3 border border-gray-300 bg-white rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-base" value = {repeatability} onChange = {(e) => { return setRepeatability(e.target.value); }} >
                            {repeatabilityOptions.map((option) => { return (
                                <option key = {option.value} value = {option.value}>{option.label}</option>
                            ); })}
                        </select>
                    </div>
                </div>

                <div className = "mt-auto pt-6">
                    <button type = "submit" className = "w-full py-4 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" >Set Notification</button>
                </div>
            </form>
        </div>
    );
}

export default NotificationApp;
