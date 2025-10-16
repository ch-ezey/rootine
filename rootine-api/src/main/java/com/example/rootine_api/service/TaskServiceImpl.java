package com.example.rootine_api.service;

import com.example.rootine_api.model.Task;
import com.example.rootine_api.model.User;
import com.example.rootine_api.repository.TaskRepo;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskServiceImpl implements TaskService {

    @Autowired
    private TaskRepo taskRepo;

    @Autowired
    private UserService userService;

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
    public Task updateTask(Integer id, Task taskUpdates) {
        User currentUser = userService.getCurrentUser();

        Task existingTask = getTaskById(id);

        boolean isOwner = existingTask.getRoutine().getUser().getUserId().equals(currentUser.getUserId());
        boolean isAdmin = currentUser.getAuthorities()
                .stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

        // Authorization check
        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("You are not authorized to modify this task.");
        }

        // Update only fields that are allowed to change
        if (taskUpdates.getTitle() != null) {
            existingTask.setTitle(taskUpdates.getTitle());
        }
        if (taskUpdates.getTaskType() != null) {
            existingTask.setTaskType(taskUpdates.getTaskType());
        }
        if (taskUpdates.getStartTime() != null) {
            existingTask.setStartTime(taskUpdates.getStartTime());
        }
        if (taskUpdates.getDuration() != null) {
            existingTask.setDuration(taskUpdates.getDuration());
        }
        if (taskUpdates.getPriority() != null) {
            existingTask.setPriority(taskUpdates.getPriority());
        }
        if (taskUpdates.getIsCompleted() != null) {
            existingTask.setIsCompleted(taskUpdates.getIsCompleted());
        }

        return taskRepo.save(existingTask);
    }

    @Override
    public void deleteTask(Integer id) {
        if (!taskRepo.existsById(id)) {
            throw new EntityNotFoundException("Task not found with id: " + id);
        }
        taskRepo.deleteById(id);
    }
}