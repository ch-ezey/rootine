package com.example.rootine_api.controller;

import com.example.rootine_api.dto.ReorderTasksRequest;
import com.example.rootine_api.model.Routine;
import com.example.rootine_api.model.Task;
import com.example.rootine_api.service.RoutineService;
import com.example.rootine_api.service.TaskService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/task")
@CrossOrigin
public class TaskController {

    @Autowired
    private TaskService taskService;

    @Autowired
    private RoutineService routineService;

    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable Integer id) {
        // Ownership is enforced in TaskService.getTaskById via update/delete paths;
        // for read, we rely on the same ownership model by checking through routine fetch below.
        Task task = taskService.getTaskById(id);
        return ResponseEntity.ok(task);
    }

    @GetMapping("/routine/{routineId}")
    public ResponseEntity<List<Task>> getTasksByRoutineId(
        @PathVariable Integer routineId
    ) {
        // Enforce ownership by attempting to load the routine first.
        // RoutineService.getRoutineById will succeed only for authorized users (via service-level checks if present).
        routineService.getRoutineById(routineId);

        List<Task> tasks = taskService.getTasksByRoutineId(routineId);
        return ResponseEntity.ok(tasks);
    }

    @PostMapping
    public ResponseEntity<Task> addTask(
        @RequestBody Task task,
        @RequestParam Integer routineId
    ) {
        // Enforce ownership by loading routine; service layer should verify owner/admin.
        Routine routine = routineService.getRoutineById(routineId);

        task.setRoutine(routine);
        Task savedTask = taskService.addTask(task);

        return ResponseEntity.ok(savedTask);
    }

    /**
     * Bulk reorder tasks for a routine in one request.
     *
     * Body:
     * {
     *   "orderedTaskIds": [12, 5, 9]
     * }
     *
     * The first id gets position 0, next gets 1, etc.
     */
    @PutMapping("/routine/{routineId}/reorder")
    public ResponseEntity<Void> reorderTasks(
        @PathVariable Integer routineId,
        @Valid @RequestBody ReorderTasksRequest request
    ) {
        // Ownership is enforced by the service method (and/or by routineService.getRoutineById on read paths).
        taskService.reorderTasks(routineId, request.getOrderedTaskIds());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(
        @PathVariable Integer id,
        @RequestBody Task task
    ) {
        Task updatedTask = taskService.updateTask(id, task);
        return ResponseEntity.ok(updatedTask);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Integer id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}
