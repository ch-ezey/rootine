DROP DATABASE IF EXISTS rootine;
CREATE DATABASE rootine;
USE rootine;

-- USER
CREATE TABLE user (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    uuid BINARY(16) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);

-- ROUTINE
CREATE TABLE routine (
    routine_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    detail_level ENUM('low', 'medium', 'high') DEFAULT 'medium',
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_routine_user ON routine(user_id);

-- TASK
CREATE TABLE task (
  task_id INT AUTO_INCREMENT PRIMARY KEY,
  routine_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  type ENUM('routine', 'one_time', 'event', 'habit') NOT NULL DEFAULT 'routine',
  start_time TIME NULL,
  duration INT NULL,
  priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  position INT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (routine_id) REFERENCES routine(routine_id) ON DELETE CASCADE,
  INDEX idx_task_routine_position (routine_id, position)
);
