package com.example.rootine_api.service;

import com.example.rootine_api.model.Task;

import java.util.List;

public interface TaskService {
     List<Task> getAllTasks();
     Task getTaskById(Integer id);
     Task addTask(Task task);
     Task updateTask(Integer id, Task task);
     void deleteTask(Integer id);
     List<Task> getTasksByRoutineId(Integer routineId);
}