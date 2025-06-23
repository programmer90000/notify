# Individual File Docs

## Contents
- [electron-main.js](#electron-mainjs)
- [backend/database.js](#backenddatabasejs)
- [backend/server.js](#backendserverjs)

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

## backend/database.js

### Table of Contents

1. [Overview](#database-overview)
2. [Database Configuration](#database-configuration)
3. [Schema](#database-schema)
4. [File Structure](#file-structure)
5. [Initialization](#initialization)

### <a id="database-overview">Overview</a>

backend/database.js is responsible for:
- Setting up the SQLite database for the notification application
- Managing the application data directory
- Providing a database connection interface
- Ensuring proper database schema initialization

### <a id="database-configuration">Database Configuration</a>

Key configuration aspects:
- Database file location: ~/.notify-app/notifications.db
- SQLite in verbose mode for better error reporting
- Automatic creation of application data directory if it doesn't exist
- Singleton database connection exported for the entire application

### <a id="database-schema">Schema</a>

The database contains a single table notifications with the following structure:

| Column         | Type     | Description                                           |
|----------------|----------|-------------------------------------------------------|
| `id`           | INTEGER  | Primary key, auto-incrementing                        |
| `title`        | TEXT     | Notification title                                    |
| `description`  | TEXT     | Notification body/content                             |
| `date`         | TEXT     | Scheduled date                                        |
| `time`         | TEXT     | Scheduled time                                        |
| `repeatability`| TEXT     | Repeat pattern ('none', 'daily', 'weekly', 'monthly') |
| `completed`    | INTEGER  | Completion status (0 = incomplete, 1 = complete)      |

### <a id="database-file-structure">File Structure</a>

The module:
- Imports required Node.js modules (path, sqlite3, fs, os)
- Defines the application data directory path (~/.notify-app)
- Creates the directory if it doesn't exist
- Defines the database file path (notifications.db in the app directory)
- Creates a new SQLite database connection
- Initializes the database schema
- Exports the database connection

### <a id="database-initialization">Initialization</a>

The database is initialized with:
- Automatic table creation if not exists
- Proper column definitions for all notification attributes
- Default value for completed status (0/incomplete)
- Persistent storage in the user's home directory

The exported database connection provides the interface for all CRUD operations on notifications throughout the application.

## backend/server.js

### Table of Contents

1. [Overview](#server-overview)
2. [Server Configuration](#server-configuration)
3. [API Endpoints](#api-endpoints)
4. [Database Integration](#database-integration)
5. [Error Handling](#server-error-handling)
6. [Special Cases](#server-special-cases)

### <a id="server-overview">Overview</a>

`backend/server.js` is the main Express server file that:
- Creates and configures the Express application
- Sets up CORS and JSON middleware
- Defines RESTful API endpoints for notification management
- Integrates with the SQLite database
- Handles server startup on port 3001

### <a id="server-configuration">Server Configuration</a>

- Express server running on port 3001
- CORS enabled for all routes
- JSON body parsing middleware
- Database connection imported from database.js
- Console log confirmation when server starts

### <a id="api-endpoints">API Endpoints</a>

| Endpoint | Method | Description | Request Body/Params | Response |
|-------------------------------|----------|--------------------------------------|------------------------------------------------------------------------------------|------------------------------|
| `/notifications`              | `POST`   | Create new notification              | ```json { "title": "...", "description": "...", "date": "...", "time": "...", "repeatability": "..." } ``` | ```json {"message": "..."}``` |
| `/notifications/all`          | `GET`    | Get all notifications                | -                                                                                  | Array of notification objects|
| `/notifications/:id`          | `DELETE` | Delete notification by ID            | `:id` (URL parameter)                                                              | ```json {"message": "..."}``` |
| `/notifications/:id`          | `PUT`    | Update notification by ID            | `:id` + ```json { "title": "...", "description": "...", "date": "...", "time": "...", "repeatability": "..." } ``` | ```json {"message": "..."}``` |
| `/notifications/:id/complete` | `PUT`    | Toggle completion status             | `:id` + ```json { "completed": boolean } ```                                       | ```json {"message": "..."}``` |

### <a id="database-integration">Database Integration</a>

The server:
- Imports the SQLite database connection from database.js
- Executes parameterized queries for all operations
- Handles database errors appropriately
- Maintains data consistency through transactions

### <a id="server-error-handling">Error Handling</a>

Standardized error handling:
- Database errors are logged to console
- 500 status code returned for database errors
- Consistent error message format: {message: "..."}
- Success responses include operation confirmation

### <a id="server-special-cases">Special cases handled</a>

- Database connection issues
- Invalid SQL queries
- Missing parameters
- Invalid notification IDs

## backend/logNotifications.js

### Table of Contents

[Overview](#log-notifications-overview)

[Purpose](#log-notifications-purpose)

[Usage](#log-notifications-usage)

[Behavior](#log-notifications-behavior)

[Exit Codes](#log-notifications-exit-codes)

[Warning ⚠️](#log-notifications-warning)

[Example Output](#log-notifications-example-output)

### <a id="log-notifications-overview">Overview</a>

Temporary debugging utility for inspecting notification records in the database.

### <a id="log-notifications-purpose">Purpose</a>
- Verify proper storage of notifications during development
- Quickly view all notification records in console
- Debug database operations

### <a id="log-notifications-usage">Usage</a>

```bash
node backend/logNotifications.js
```

### <a id="log-notifications-behavior">Behavior</a>

Connects to SQLite database using `./database` module

Executes `SELECT * FROM notifications` query

Outputs results
- Success: Displays formatted table via `console.table()`
- Error: Prints error message to stderr

### <a id="log-notifications-exit-codes">Exit Codes</a>

| Code | Meaning | Description |
|------|-----------------------|-----------------------------------------------------------------------------|
| `0`  | Success  | The query executed successfully and results were displayed |
| `1`  | Database Error | An error occurred while querying the database |
| `2`  | Connection Error | Failed to establish database connection (if added in future versions) |
| `255`| Unexpected Error | Unhandled exception occurred (if error handling is expanded) |

### <a id="log-notifications-warning">Warning ⚠️</a>
Production Note

This file should be removed before release because:
- Exposes all notification data in clear text
- Lacks security controls
- Serves no production purpose

### <a id="log-notifications-example-output">Example Output</a>

| index | id | title | description | date | time | repeatability | completed |
|-------|-----|-------------|-------------|-------------|------------|---------------|-----------|
| 0 | 0 | 'Notification 1' | 'This is notification 1' | '2025-06-23'| '16:30' | 'daily' | 1 |
| 1 | 1 | 'Notification 2' | 'This is notification 2' | '2025-06-24'| '16:30' | 'daily' | 0 |

## frontend/src/NotificationApp.js

## Table of Contents
1. [Overview](#notification-app-overview)
2. [State Management](#notification-app-state-management)
3. [Navigation](#notification-app-navigation)
4. [Notification Submission](#notification-app-submission)
5. [API Communication](#notification-app-api-communication)
6. [Form Components](#form-components)

### <a id="notification-app-overview"></a>Overview
Screen that allows the creation of notifications. The screen requires the notification title, date, time and repeatability to be set. There is also a field to set a description for the notification


### <a id="notification-app-state-management"></a>State Management

| State | Type | Description | Default Value |
|------------------|----------|-------------------------------------------------------|---------------|
| `currentScreen`  | string   | Tracks active view ('setter' or 'list')               | `"setter"`    |
| `title`          | string   | Notification title input                              | `""`          |
| `description`    | string   | Notification description input                        | `""`          |
| `date`           | string   | Scheduled date (YYYY-MM-DD format)                    | `""`          |
| `time`           | string   | Scheduled time (HH:MM format)                         | `""`          |
| `repeatability`  | string   | Repeat pattern ('none', 'daily', 'weekly', 'monthly') | `"none"`      |

### <a id="notification-app-navigation"></a>Navigation
| Method | 	Description |
|-------------------|---------------------------------------|
|navigateToList()   | Switches to notification list view    |
|navigateToSetter() | Returns to notification creation view |

### <a id="notification-app-submission"></a>Notification Submission Flow

1. User fills form and submits
2. Data sent to Electron main process via IPC
3. POST request to backend API (/notifications)
4. Form reset on success
5. Subsequent GET request fetches all notifications

### <a id="notification-app-api-communication"></a>API Communication
```javascript
// Sending notification
ipcRenderer.send("schedule-notification", data);

// Saving to database
fetch("http://localhost:3001/notifications", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data)
});

// Fetching all notifications
fetch("http://localhost:3001/notifications/all")
```

### <a id="form-components"></a>Form Components
| Field     |	Type    |Required| Notes            |
|-----------|-----------|--------|------------------|
|Title      |text input |Yes     |Maximum 100 chars |
|Description|textarea	|No      |Optional details  |
|Date       |date picker|Yes     |Future dates only |
|Time       |time picker|Yes     |24-hour format    |
|Repeat     |dropdown   |Yes     |Defaults to 'none'|