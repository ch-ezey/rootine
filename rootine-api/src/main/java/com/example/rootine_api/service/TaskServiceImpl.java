package com.example.rootine_api.service;

import com.example.rootine_api.model.Task;
import com.example.rootine_api.repository.TaskRepo;
import com.example.rootine_api.security.AuthService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
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
        return taskRepo
            .findById(id)
            .orElseThrow(() ->
                new EntityNotFoundException("Task not found with id: " + id)
            );
    }

    @Override
    public List<Task> getTasksByRoutineId(Integer routineId) {
        // stable ordering: position asc, then taskId asc
        return taskRepo.findByRoutineRoutineIdOrderByPositionAscTaskIdAsc(
            routineId
        );
    }

    // ─── Create ────────────────────────────────────────────────────────

    @Override
    public Task addTask(Task task) {
        // If client doesn't provide a position, place it at the end of the routine.
        if (task.getPosition() == null) {
            Integer routineId =
                task.getRoutine() != null
                    ? task.getRoutine().getRoutineId()
                    : null;

            if (routineId != null) {
                int nextPosition = getTasksByRoutineId(routineId).size();
                task.setPosition(nextPosition);
            } else {
                task.setPosition(0);
            }
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

        // Fetch tasks belonging to the routine (in any order), then validate membership
        List<Task> tasksInRoutine =
            taskRepo.findByRoutineRoutineIdOrderByPositionAscTaskIdAsc(
                routineId
            );

        if (tasksInRoutine.isEmpty()) {
            throw new EntityNotFoundException(
                "No tasks found for routine id: " + routineId
            );
        }

        // Ownership check: use the routine owner from any task (routine is the same for all tasks here)
        Task anyTask = tasksInRoutine.get(0);
        if (
            anyTask.getRoutine() == null ||
            anyTask.getRoutine().getUser() == null
        ) {
            throw new IllegalStateException(
                "Task is missing routine/user association for authorization"
            );
        }
        authService.verifyOwnershipOrAdmin(
            anyTask.getRoutine().getUser().getUserId()
        );

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

        // Apply new positions
        for (int i = 0; i < orderedTaskIds.size(); i++) {
            Integer taskId = orderedTaskIds.get(i);

            // Find the matching task (routine sets are typically small; keep it simple)
            for (Task t : tasksInRoutine) {
                if (t.getTaskId().equals(taskId)) {
                    t.setPosition(i);
                    break;
                }
            }
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
