package com.example.rootine_api.service;

import com.example.rootine_api.model.Task;
import com.example.rootine_api.model.User;
import com.example.rootine_api.repository.RoutineRepo;
import com.example.rootine_api.repository.TaskRepo;
import com.example.rootine_api.security.AuthService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskServiceImpl implements TaskService {

    private final TaskRepo taskRepo;
    private final AuthService authService;

    public TaskServiceImpl(TaskRepo taskRepo, AuthService authService) {
        this.taskRepo = taskRepo;
        this.authService = authService;
    }

    // ─── Retrieval ───────────────────────────────────────────────────────────────

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

    // ─── Create ────────────────────────────────────────────────────────

    @Override
    public Task addTask(Task task) {
        return taskRepo.save(task);
    }

    // ─── Update ───────────────────────────────────────────────────────────────────

    @Override
    public Task updateTask(Integer id, Task taskUpdates) {
        Task existingTask = getTaskById(id);

        authService.verifyOwnershipOrAdmin(existingTask.getRoutine().getUser().getUserId());

        applyTaskUpdates(existingTask, taskUpdates);

        return taskRepo.save(existingTask);
    }

    // ─── Delete ───────────────────────────────────────────────────────────────────

    @Override
    public void deleteTask(Integer id) {
        Task existingTask = getTaskById(id);

        authService.verifyOwnershipOrAdmin(existingTask.getRoutine().getUser().getUserId());

        taskRepo.deleteById(id);
    }

    // ─── Utility ───────────────────────────────────────────────────────────────────

    public void applyTaskUpdates(Task existing, Task updates) {
        if (updates.getTitle() != null) existing.setTitle(updates.getTitle());
        if (updates.getTaskType() != null) existing.setTaskType(updates.getTaskType());
        if (updates.getStartTime() != null) existing.setStartTime(updates.getStartTime());
        if (updates.getDuration() != null) existing.setDuration(updates.getDuration());
        if (updates.getPriority() != null) existing.setPriority(updates.getPriority());
        if (updates.getIsCompleted() != null) existing.setIsCompleted(updates.getIsCompleted());
    }
}