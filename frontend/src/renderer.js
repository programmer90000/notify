import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const App = () => {
    return (
        <div className = "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 font-sans">
            <NotificationSetter />
        </div>
    );
};

function NotificationSetter() {
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
        <div className = "w-full max-w-md bg-white p-8 rounded-xl shadow-2xl space-y-6 border border-gray-200">
            <h2 className = "text-3xl font-extrabold text-gray-900 text-center mb-6">Set Your Notification</h2>

            <form onSubmit = {handleSubmit} className = "space-y-5">
                <div>
                    <label htmlFor = "title" className = "block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input type = "text" id = "title" className = "mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-base transition duration-150 ease-in-out" placeholder = "e.g., Meeting Reminder" value = {title} onChange = {(e) => { return setTitle(e.target.value); }} required />
                </div>

                <div>
                    <label htmlFor = "description" className = "block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                    <textarea id = "description" rows = "3" className = "mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-base resize-y transition duration-150 ease-in-out" placeholder = "e.g., Don't forget to prepare slides for the presentation." value = {description} onChange = {(e) => { return setDescription(e.target.value); }} ></textarea>
                </div>

                <div className = "grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor = "date" className = "block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input type = "date" id = "date" className = "mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-base transition duration-150 ease-in-out" value = {date} onChange = {(e) => { return setDate(e.target.value); }} required />
                    </div>
                    <div>
                        <label htmlFor = "time" className = "block text-sm font-medium text-gray-700 mb-1">Time</label>
                        <input type = "time" id = "time" className = "mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-base transition duration-150 ease-in-out" value = {time} onChange = {(e) => { return setTime(e.target.value); }} required />
                    </div>
                </div>

                <div>
                    <label htmlFor = "repeatability" className = "block text-sm font-medium text-gray-700 mb-1">Repeat</label>
                    <select id = "repeatability" className = "mt-1 block w-full px-4 py-2 border border-gray-300 bg-white rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-base transition duration-150 ease-in-out" value = {repeatability} onChange = {(e) => { return setRepeatability(e.target.value); }}>
                        {repeatabilityOptions.map((option) => { return (
                            <option key = {option.value} value = {option.value}>{option.label}</option>
                        ); })}
                    </select>
                </div>

                <button type = "submit" className = "w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 ease-in-out transform hover:scale-105">Set Notification</button>
            </form>
        </div>
    );
}

const root = createRoot(document.getElementById("root"));
root.render(<App />);
