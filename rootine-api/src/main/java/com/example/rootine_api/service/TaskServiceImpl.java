package com.example.rootine_api.service;

import com.example.rootine_api.model.Task;
import com.example.rootine_api.repository.TaskRepo;
import com.example.rootine_api.security.AuthService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

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
        Task task = taskRepo
            .findById(id)
            .orElseThrow(() ->
                new EntityNotFoundException("Task not found with id: " + id)
            );

        // Enforce ownership on reads too (prevents cross-tenant access)
        if (task.getRoutine() == null || task.getRoutine().getUser() == null) {
            throw new AccessDeniedException(
                "Task is missing routine/user association."
            );
        }
        authService.verifyOwnershipOrAdmin(
            task.getRoutine().getUser().getUserId()
        );

        return task;
    }

    @Override
    public List<Task> getTasksByRoutineId(Integer routineId) {
        // stable ordering: position asc, then taskId asc
        List<Task> tasks =
            taskRepo.findByRoutineRoutineIdOrderByPositionAscTaskIdAsc(
                routineId
            );

        // Enforce ownership on reads too
        if (!tasks.isEmpty()) {
            Task any = tasks.get(0);
            if (
                any.getRoutine() == null || any.getRoutine().getUser() == null
            ) {
                throw new AccessDeniedException(
                    "Tasks are missing routine/user association."
                );
            }
            authService.verifyOwnershipOrAdmin(
                any.getRoutine().getUser().getUserId()
            );
        }

        return tasks;
    }

    // ─── Create ────────────────────────────────────────────────────────

    @Override
    public Task addTask(Task task) {
        // Ownership is enforced in controller by loading the routine; still validate association exists here.
        if (
            task.getRoutine() == null ||
            task.getRoutine().getRoutineId() == null
        ) {
            throw new IllegalArgumentException(
                "Task must belong to a routine."
            );
        }

        // If client doesn't provide a position, place it at the end of the routine.
        if (task.getPosition() == null) {
            Integer routineId = task.getRoutine().getRoutineId();
            int nextPosition = getTasksByRoutineId(routineId).size();
            task.setPosition(nextPosition);
        }

        return taskRepo.save(task);
    }

    // ─── Reorder (Bulk) ───────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void reorderTasks(Integer routineId, List<Integer> orderedTaskIds) {
        if (routineId == null) {
            throw new IllegalArgumentException("routineId is required");
        }
        if (orderedTaskIds == null || orderedTaskIds.isEmpty()) {
            throw new IllegalArgumentException(
                "orderedTaskIds cannot be empty"
            );
        }

        // Ensure there are no duplicates in the request (prevents conflicting positions)
        Set<Integer> unique = new HashSet<>(orderedTaskIds);
        if (unique.size() != orderedTaskIds.size()) {
            throw new IllegalArgumentException(
                "orderedTaskIds contains duplicates"
            );
        }

        // Fetch tasks belonging to the routine, then validate membership.
        // NOTE: This also performs an ownership check.
        List<Task> tasksInRoutine = getTasksByRoutineId(routineId);

        if (tasksInRoutine.isEmpty()) {
            throw new EntityNotFoundException(
                "No tasks found for routine id: " + routineId
            );
        }

        Set<Integer> taskIdsInRoutine = new HashSet<>();
        for (Task t : tasksInRoutine) {
            taskIdsInRoutine.add(t.getTaskId());
        }

        // Request must be a permutation of the routine's task ids
        if (!taskIdsInRoutine.equals(unique)) {
            throw new IllegalArgumentException(
                "orderedTaskIds must include exactly the tasks that belong to the routine"
            );
        }

        // O(n): index tasks by id for fast lookup
        Map<Integer, Task> byId = new HashMap<>();
        for (Task t : tasksInRoutine) {
            byId.put(t.getTaskId(), t);
        }

        // Apply new positions
        for (int i = 0; i < orderedTaskIds.size(); i++) {
            Integer taskId = orderedTaskIds.get(i);
            Task t = byId.get(taskId);
            if (t == null) {
                // Should be impossible because of the set equality check above, but keep it explicit.
                throw new IllegalArgumentException(
                    "Task id " +
                        taskId +
                        " does not belong to routine " +
                        routineId
                );
            }
            t.setPosition(i);
        }

        taskRepo.saveAll(tasksInRoutine);
    }

    // ─── Update ───────────────────────────────────────────────────────────────────

    @Override
    public Task updateTask(Integer id, Task taskUpdates) {
        Task existingTask = getTaskById(id);

        authService.verifyOwnershipOrAdmin(
            existingTask.getRoutine().getUser().getUserId()
        );

        applyTaskUpdates(existingTask, taskUpdates);

        return taskRepo.save(existingTask);
    }

    // ─── Delete ───────────────────────────────────────────────────────────────────

    @Override
    public void deleteTask(Integer id) {
        Task existingTask = getTaskById(id);

        authService.verifyOwnershipOrAdmin(
            existingTask.getRoutine().getUser().getUserId()
        );

        taskRepo.deleteById(id);
    }

    // ─── Utility ───────────────────────────────────────────────────────────────────

    public void applyTaskUpdates(Task existing, Task updates) {
        if (updates.getTitle() != null) existing.setTitle(updates.getTitle());
        if (updates.getTaskType() != null) existing.setTaskType(
            updates.getTaskType()
        );
        if (updates.getStartTime() != null) existing.setStartTime(
            updates.getStartTime()
        );
        if (updates.getDuration() != null) existing.setDuration(
            updates.getDuration()
        );
        if (updates.getPriority() != null) existing.setPriority(
            updates.getPriority()
        );
        if (updates.getIsCompleted() != null) existing.setIsCompleted(
            updates.getIsCompleted()
        );
        if (updates.getPosition() != null) existing.setPosition(
            updates.getPosition()
        );
    }
}
