# Individual File Docs

## Contents
- [electron-main.js](#electron-mainjs)

---

## electron-main.js

### Table of Contents
1. [Overview](#electron-main-overview)
3. [Functions](#electron-main-functions)
4. [Events](#electron-main-events)
5. [Notification Handling](#notification-handling)
6. [Notification Flow](#notification-flow)
7. [Special Cases](#special-cases)

### <a id="electron-main-overview">Overview</a>

`electron-main.js` is the main process of the Electron application that:
- Manages the application lifecycle
- Handles inter-process communication (IPC)
- Controls the backend Node.js process
- Implements the notification scheduling system
- Configures application-wide settings

### <a id="electron-main-functions"></a>Functions

- startBackend(callback)

Starts the backend process and waits for it to listen on port 3001 before creating the app window.

- createWindow()

Creates the app window and loads the frontend (development or production version).

- getNextNotificationDate(currentDate, repeatability)

Calculates the next notification date based on repeatability (daily, weekly, monthly).

- scheduleNotification({ title, body, timestamp, repeatability, originalNotification })

Schedules a notification to show at the specified time and handles repeating logic.

- showNotificationAndScheduleNext()

Displays the notification and schedules the next one based upon the set repeatability.

- log(message)

Logs a message to the console and writes it to the log file (implemented via console.log override).

- error(message)

Logs an error message to the console and writes it to the log file (implemented via console.error override).

### <a id="electron-main-events"></a>Events

- app.whenReady()

Called when the app is ready to start (initializes backend and creates window).

- app.on("window-all-closed")

Called when all windows are closed (quits the app on non-macOS platforms).

- app.on("before-quit")

Called before the app quits (terminates the backend process).

- backendProcess.stdout.on("data")

Handles backend process stdout (logs messages and detects when backend is ready).

- backendProcess.stderr.on("data")

Handles backend process stderr (logs error messages).

- backendProcess.on("close")

Called when the backend process exits.

- backendProcess.on("error")

Called when the backend process encounters an error.

- ipcMain.on("schedule-notification")

Handles notification scheduling requests from the renderer process.

### <a id="notification-handling"></a>Notification Handling

The notification system features:

- Support for one-time, daily, weekly, and monthly notifications

- Database integration to track notification status

- Automatic rescheduling of repeating notifications

- Handling of completed notifications

- Support for long-delay notifications (beyond setTimeout's maximum delay)

- Integration with the system notification center

### <a id="notification-flow"></a>Notification Flow:

- Notification is received via IPC from renderer

- Scheduled using setTimeout (with handling for long delays)

- When triggered, checks database for completion status

- Shows notification if not completed

- For repeating notifications, calculates next occurrence and schedules it

- Updates database with new repeating notifications

### <a id="special-cases"></a>Special cases handled:

- Monthly notifications that shouldn't repeat multiple times

- Notifications marked as completed

- Very long-delay notifications (beyond 24.8 days)

---