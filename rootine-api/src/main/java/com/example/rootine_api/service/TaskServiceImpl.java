package com.example.rootine_api.service;

import com.example.rootine_api.model.Task;
import com.example.rootine_api.repository.TaskRepo;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskServiceImpl implements TaskService {

    @Autowired
    private TaskRepo taskRepo;

    @Override
    public List<Task> getAllTasks() {
        return taskRepo.findAll();
    }

    @Override
    public Task getTaskById(Integer id) {
        return taskRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Task not found with id: " + id));
    }

    @Override
    public List<Task> getTasksByRoutineId(Integer routineId) {
        return taskRepo.findByRoutineRoutineId(routineId);
    }

    @Override
    public Task addTask(Task task) {
        return taskRepo.save(task);
    }

    @Override
    public Task updateTask(Integer id, Task task) {
        if (!taskRepo.existsById(id)) {
            throw new EntityNotFoundException("Task not found with id: " + id);
        }
        task.setTaskId(id);
        return taskRepo.save(task);
    }

    @Override
    public void deleteTask(Integer id) {
        if (!taskRepo.existsById(id)) {
            throw new EntityNotFoundException("Task not found with id: " + id);
        }
        taskRepo.deleteById(id);
    }
}