-- USERS
INSERT INTO user (uuid, name, email, password_hash) VALUES
('35353065-3834-3030-2d65-3239622d3431', 'Alice Smith', 'alice@example.com', 'hashed_password1'),
('550e8400-e39b-41d4-a716-222114230001', 'Bob Johnson', 'bob@example.com', 'hashed_password2'),
('550e8400-e29b-41d4-a716-446655440002', 'Charlie Zen', 'charlie@example.com', 'hashed_password3');


-- ROUTINES
INSERT INTO routine (user_id, title, theme, detail_level, is_active) VALUES
(1, 'Workday Productivity', 'work', 'high', TRUE),
(1, 'Morning Fitness', 'fitness', 'medium', TRUE),
(2, 'Self-Care Sunday', 'self-care', 'low', FALSE),
(3, 'Coding Bootcamp Prep', 'work', 'high', TRUE);

-- TASKS
-- Workday Productivity (routine_id = 1)
INSERT INTO task (routine_id, title, task_type, start_time, duration, priority) VALUES
(1, 'Wake Up & Stretch', 'routine', '2025-04-10 08:00:00', 15, 'medium'),
(1, 'Morning Shower', 'one_time', '2025-04-10 08:15:00', 15, 'low'),
(1, 'Breakfast', 'one_time', '2025-04-10 08:30:00', 30, 'medium'),
(1, 'Check Emails', 'routine', '2025-04-10 09:00:00', 20, 'high'),
(1, 'Task Planning', 'one_time', '2025-04-10 09:30:00', 15, 'medium'),
(1, 'Team Standup Call', 'routine', '2025-04-10 10:00:00', 30, 'high'),
(1, 'Focus Work Block', 'routine', '2025-04-10 10:30:00', 90, 'high'),
(1, 'Lunch Break', 'one_time', '2025-04-10 12:00:00', 60, 'medium'),
(1, 'Practice Algorithms', 'routine', '2025-04-10 13:00:00', 90, 'high'),
(1, 'Break / Coffee Walk', 'one_time', '2025-04-10 14:30:00', 15, 'low'),
(1, 'Doctor Appointment', 'event', '2025-04-10 15:00:00', 60, 'medium'),
(1, 'Wrap-Up Tasks & Notes', 'one_time', '2025-04-10 16:00:00', 30, 'medium');

-- Morning Fitness (routine_id = 2)
INSERT INTO task (routine_id, title, task_type, start_time, duration, priority) VALUES
(2, 'Wake Up & Stretch', 'routine', '2025-04-10 06:00:00', 15, 'medium'),
(2, 'Cardio Workout', 'routine', '2025-04-10 06:30:00', 45, 'high'),
(2, 'Shower & Recovery', 'one_time', '2025-04-10 07:30:00', 30, 'low'),
(2, 'Healthy Breakfast', 'one_time', '2025-04-10 08:00:00', 30, 'medium'),
(2, 'Strength Training', 'routine', '2025-04-10 08:30:00', 60, 'high'),
(2, 'Cool Down & Stretch', 'routine', '2025-04-10 09:30:00', 15, 'low');

-- Self-Care Sunday (routine_id = 3)
INSERT INTO task (routine_id, title, task_type, start_time, duration, priority) VALUES
(3, 'Sleep In', 'routine', NULL, 90, 'low'),
(3, 'Morning Yoga', 'routine', '2025-04-10 09:30:00', 30, 'low'),
(3, 'Bubble Bath', 'one_time', '2025-04-10 10:30:00', 60, 'medium'),
(3, 'Read a Book', 'routine', '2025-04-10 12:00:00', 60, 'low'),
(3, 'Spa Face Mask', 'one_time', '2025-04-10 14:00:00', 30, 'medium'),
(3, 'Meditation', 'routine', '2025-04-10 15:00:00', 20, 'low'),
(3, 'Journal', 'routine', '2025-04-10 16:00:00', 20, 'low');

-- Coding Bootcamp Prep (routine_id = 4)
INSERT INTO task (routine_id, title, task_type, start_time, duration, priority) VALUES
(4, 'Wake Up & Stretch', 'routine', '2025-04-10 07:00:00', 15, 'medium'),
(4, 'Review Java Basics', 'routine', '2025-04-10 08:00:00', 60, 'high'),
(4, 'Practice Algorithms', 'routine', '2025-04-10 09:00:00', 90, 'high'),
(4, 'Lunch Break', 'one_time', '2025-04-10 12:00:00', 60, 'medium'),
(4, 'Complete Project Task', 'routine', '2025-04-10 13:00:00', 90, 'high'),
(4, 'Break', 'one_time', '2025-04-10 15:00:00', 15, 'low'),
(4, 'Review Progress', 'one_time', '2025-04-10 16:00:00', 30, 'medium');

-- TASK NOTES
INSERT INTO task_note (task_id, note) VALUES
(1, 'Use yoga mat and open window'),
(3, 'High protein recommended'),
(4, 'Prioritize urgent threads'),
(5, 'Review Notion task list'),
(7, 'Revise Java + project roadmap'),
(9, 'Leetcode (focus: DP, Graphs)'),
(11, '📍 CityMed Health Center'),

(14, '15 min treadmill + 30 min HIIT'),
(17, 'Focus on form and reps for strength training'),
(18, 'Cool down stretches are important'),

(20, 'Focus on breath and movement'),
(21, 'Add candles for relaxation'),
(23, 'Apply mask for 15 minutes, then remove'),

(27, 'Prioritize Java OOP concepts'),
(28, 'Focus on dynamic programming and data structures'),
(29, 'Eat away from the desk for better digestion');

-- TASK DEPENDENCIES
INSERT INTO task_dependency (task_id, depends_on_task_id) VALUES
(2, 1),
(3, 2),
(4, 3),
(5, 4),
(6, 5),
(7, 6),
(8, 7),
(9, 8),
(10, 9),
(11, 10),

(14, 13),
(15, 14),
(17, 16),

(20, 19),
(21, 20),
(22, 21),
(23, 22),

(27, 26),
(28, 27),
(30, 29),
(31, 30);

-- EVENTS
INSERT INTO event (user_id, title, start_time, duration) VALUES
(1, 'Doctor Appointment', '2025-04-10 15:00:00', 60);

-- ROUTINE EVENTS
INSERT INTO routine_event (routine_id, event_id) VALUES
(1, 1);

-- ROUTINE SETTINGS
INSERT INTO routine_setting (routine_id, config_json) VALUES
(1, '{"notifications": true, "preferred_start": "08:00", "break_between_tasks": 10}'),
(2, '{"notifications": true, "preferred_start": "06:00", "break_between_tasks": 15}'),
(3, '{"notifications": false, "preferred_start": "10:00", "break_between_tasks": 30}'),
(4, '{"notifications": true, "preferred_start": "07:00", "break_between_tasks": 15}');

-- TEMPLATES
INSERT INTO template (title, description, config_json, created_by, is_system) VALUES
('Default Work Routine', 'A standard workday routine with typical tasks', '{"notifications": true, "preferred_start": "08:00", "break_between_tasks": 10}', 1, TRUE),
('Fitness Routine', 'A balanced morning fitness routine', '{"notifications": true, "preferred_start": "06:00", "break_between_tasks": 15}', 1, TRUE);
