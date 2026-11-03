package com.example.rootine_api.service;

import com.example.rootine_api.dto.TaskRequest;
import com.example.rootine_api.dto.TaskResponse;
import com.example.rootine_api.dto.TaskUpdateRequest;
import com.example.rootine_api.model.Routine;
import com.example.rootine_api.model.Task;
import com.example.rootine_api.repository.RoutineRepo;
import com.example.rootine_api.repository.TaskRepo;
import com.example.rootine_api.security.AuthService;
import jakarta.persistence.EntityNotFoundException;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TaskServiceImpl implements TaskService {

    private final TaskRepo taskRepo;
    private final RoutineRepo routineRepo;
    private final AuthService authService;

    public TaskServiceImpl(TaskRepo taskRepo, RoutineRepo routineRepo, AuthService authService) {
        this.taskRepo = taskRepo;
        this.routineRepo = routineRepo;
        this.authService = authService;
    }

    // ─── Retrieval ───────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public TaskResponse getTask(Integer id) {
        return TaskResponse.from(findOwned(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskResponse> getTasksByRoutineId(Integer routineId) {
        requireOwnedRoutine(routineId);
        return taskRepo
            .findByRoutineRoutineIdOrderByPositionAscTaskIdAsc(routineId)
            .stream()
            .map(TaskResponse::from)
            .toList();
    }

    // ─── Create ────────────────────────────────────────────────────────

    @Override
    @Transactional
    public TaskResponse addTask(Integer routineId, TaskRequest request) {
        Routine routine = routineRepo
            .findByRoutineIdAndUserUserId(routineId, authService.getCurrentUserId())
            .orElseThrow(() -> routineNotFound(routineId));

        Task task = newTask(request, routine);
        // Default to the end of the routine
        if (task.getPosition() == null) {
            task.setPosition(taskRepo.findMaxPosition(routineId) + 1);
        }

        return TaskResponse.from(taskRepo.save(task));
    }

    /** Builds an unsaved task from a request; enum fields fall back to the entity defaults. */
    static Task newTask(TaskRequest request, Routine routine) {
        Task task = new Task();
        task.setRoutine(routine);
        task.setTitle(request.title());
        task.setDescription(request.description());
        if (request.taskType() != null) task.setTaskType(request.taskType());
        task.setStartTime(request.startTime());
        task.setDuration(request.duration());
        if (request.priority() != null) task.setPriority(request.priority());
        task.setPosition(request.position());
        return task;
    }

    // ─── Reorder (Bulk) ───────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void reorderTasks(Integer routineId, List<Integer> orderedTaskIds) {
        requireOwnedRoutine(routineId);

        // Ensure there are no duplicates in the request (prevents conflicting positions)
        Set<Integer> unique = new HashSet<>(orderedTaskIds);
        if (unique.size() != orderedTaskIds.size()) {
            throw new IllegalArgumentException("orderedTaskIds contains duplicates");
        }

        Map<Integer, Task> byId = taskRepo
            .findByRoutineRoutineIdOrderByPositionAscTaskIdAsc(routineId)
            .stream()
            .collect(Collectors.toMap(Task::getTaskId, Function.identity()));

        // Request must be a permutation of the routine's task ids
        if (!byId.keySet().equals(unique)) {
            throw new IllegalArgumentException(
                "orderedTaskIds must include exactly the tasks that belong to the routine"
            );
        }

        // Managed entities: changes are flushed on commit
        for (int i = 0; i < orderedTaskIds.size(); i++) {
            byId.get(orderedTaskIds.get(i)).setPosition(i);
        }
    }

    // ─── Update ───────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public TaskResponse updateTask(Integer id, TaskUpdateRequest updates) {
        Task existing = findOwned(id);

        if (updates.title() != null) existing.setTitle(updates.title());
        if (updates.description() != null) existing.setDescription(updates.description());
        if (updates.taskType() != null) existing.setTaskType(updates.taskType());
        if (updates.startTime() != null) existing.setStartTime(updates.startTime());
        if (updates.duration() != null) existing.setDuration(updates.duration());
        if (updates.priority() != null) existing.setPriority(updates.priority());
        if (updates.isCompleted() != null) existing.setIsCompleted(updates.isCompleted());

        return TaskResponse.from(existing);
    }

    // ─── Delete ───────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void deleteTask(Integer id) {
        taskRepo.delete(findOwned(id));
    }

    // ─── Utility ───────────────────────────────────────────────────────────────────

    private Task findOwned(Integer id) {
        return taskRepo
            .findByTaskIdAndRoutineUserUserId(id, authService.getCurrentUserId())
            .orElseThrow(() -> new EntityNotFoundException("Task not found with id: " + id));
    }

    private void requireOwnedRoutine(Integer routineId) {
        if (!routineRepo.existsByRoutineIdAndUserUserId(routineId, authService.getCurrentUserId())) {
            throw routineNotFound(routineId);
        }
    }

    private static EntityNotFoundException routineNotFound(Integer routineId) {
        return new EntityNotFoundException("Routine not found with id: " + routineId);
    }
}
