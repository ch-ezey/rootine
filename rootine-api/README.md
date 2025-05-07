# 🧠 Smart Routine App API

The **Smart Routine App API** is the backend for a dynamic routine and task management system. It allows users to create, customize, and manage routines, tasks, events, and templates—all tailored to their daily lifestyle and preferences.

---

## 🚀 Features

- User registration and login
- Create/edit/delete routines and tasks
- Three supported task types: `routine`, `one-time`, `event`
- Associate events with routines
- Define task dependencies and add notes
- Save and reuse routine templates
- Device token storage for notifications
- JSON-based routine settings

---

## 🧱 Database Schema Overview

> The backend uses **MySQL** with the following key tables:

| Table             | Description                                 |
|------------------|---------------------------------------------|
| `user`           | Stores user credentials and metadata        |
| `routine`        | User-defined routines with themes & detail  |
| `task`           | Tasks (routine, one-time, event)            |
| `task_note`      | Notes related to individual tasks           |
| `task_dependency`| Dependencies between tasks                  |
| `event`          | User-created time-based events              |
| `routine_event`  | Maps events to specific routines            |
| `routine_setting`| Custom JSON settings for routines           |
| `template`       | Reusable blueprints for routine creation    |
| `device_token`   | Device tokens for push notifications        |

---

## 🛠 Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/smart-routine-api.git
   cd smart-routine-api
   ```

2. **Set up the database**
   ```bash
   mysql -u root -p < schema.sql
   ```

3. **Configure environment variables**
   Create a `.env` file:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=yourpassword
   DB_NAME=rootine
   JWT_SECRET=supersecretkey
   ```

4. **Install dependencies**
   ```bash
   pip install -r requirements.txt  # if using Python
   # or
   npm install  # if using Node.js
   ```

5. **Start the server**
   ```bash
   python app.py  # Flask/FastAPI
   # or
   npm start  # Express.js
   ```

---

## 📦 Template System

Templates help users quickly spin up common routines with predefined tasks. A template contains:

- Title & description
- JSON configuration defining:
    - Detail level
    - List of tasks with metadata

Example `config_json` from the `template` table:
```json
{
  "detail_level": "medium",
  "tasks": [
    {
      "title": "Morning stretch",
      "type": "routine",
      "start_time": "07:00:00",
      "duration": 10,
      "priority": "medium"
    },
    {
      "title": "Eat breakfast",
      "type": "routine",
      "start_time": "07:15:00",
      "duration": 20
    }
  ]
}
```

When a user uses a template:
- A new routine is created
- Tasks are populated based on the JSON config
- The routine is assigned to the user

---

## 📚 Example API Endpoints

| Method | Endpoint                    | Description                             |
|--------|-----------------------------|-----------------------------------------|
| POST   | `/auth/register`            | Register a new user                     |
| POST   | `/auth/login`               | Authenticate user & return token        |
| GET    | `/routines/:user_id`        | Retrieve all routines for a user        |
| POST   | `/routine`                  | Create a new routine                    |
| POST   | `/task`                     | Add a task to a routine                 |
| GET    | `/templates`                | List available templates                |
| POST   | `/template/:id/use`         | Use a template to generate a routine    |

---

## 🧠 Task Types

Each task belongs to one of the following types:

- `routine`: Part of a recurring daily/weekly pattern
- `one-time`: A task that only happens once
- `event`: A scheduled, calendar-based occurrence (may also appear in `event` table)

---

## 🔧 Routine Settings

Each routine can have a customizable JSON-based config stored in the `routine_setting` table:

Example:
```json
{
  "show_progress": true,
  "notifications": {
    "enabled": true,
    "reminder_minutes_before": 10
  }
}
```

---

## 📲 Device Tokens

To enable push notifications or reminders, the `device_token` table stores:

- User ID
- Token string
- Device type (e.g., iOS, Android)
- Last used timestamp

---

## 📌 Roadmap

- Recurring logic & automatic rescheduling
- Daily summary notifications
- Task history and analytics
- Drag-and-drop frontend routine builder
- AI-generated routine suggestions

---

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for more details.
