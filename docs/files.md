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

