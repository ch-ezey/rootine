DROP DATABASE IF EXISTS rootine;
CREATE DATABASE rootine;
USE rootine;

-- USER TABLE
CREATE TABLE user (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);

-- ROUTINE TABLE
CREATE TABLE routine (
    routine_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    theme VARCHAR(50), -- e.g., fitness, work, general
    detail_level ENUM('low', 'medium', 'high') DEFAULT 'medium',
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
);

-- TASK TABLE
CREATE TABLE task (
    task_id INT AUTO_INCREMENT PRIMARY KEY,
    routine_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    task_type ENUM('routine', 'one-time', 'event') DEFAULT 'one-time',
    start_time TIMESTAMP NULL,
    duration INT, 
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (routine_id) REFERENCES routine(routine_id) ON DELETE CASCADE
);

-- TASK_NOTE TABLE
CREATE TABLE task_note (
    note_id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES task(task_id) ON DELETE CASCADE
);

-- TASK_DEPENDENCY TABLE
CREATE TABLE task_dependency (
    dependency_id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    depends_on_task_id INT NOT NULL,
    FOREIGN KEY (task_id) REFERENCES task(task_id) ON DELETE CASCADE,
    FOREIGN KEY (depends_on_task_id) REFERENCES task(task_id) ON DELETE CASCADE,
    UNIQUE (task_id, depends_on_task_id)
);

-- EVENT TABLE
CREATE TABLE event (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    duration INT, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
);

-- ROUTINE_EVENT TABLE
CREATE TABLE routine_event (
    routine_event_id INT AUTO_INCREMENT PRIMARY KEY,
    routine_id INT NOT NULL,
    event_id INT NOT NULL,
    FOREIGN KEY (routine_id) REFERENCES routine(routine_id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES event(event_id) ON DELETE CASCADE,
    UNIQUE (routine_id, event_id)
);

-- ROUTINE_SETTING TABLE
CREATE TABLE routine_setting (
    setting_id INT AUTO_INCREMENT PRIMARY KEY,
    routine_id INT NOT NULL,
    config_json JSON,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (routine_id) REFERENCES routine(routine_id) ON DELETE CASCADE
);

-- TEMPLATE TABLE
CREATE TABLE template (
    template_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    config_json JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    is_system BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (created_by) REFERENCES user(user_id) ON DELETE SET NULL
);

-- DEVICE_TOKEN TABLE
CREATE TABLE device_token (
    token_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    device_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
    UNIQUE (token)
);