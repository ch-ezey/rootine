package com.example.rootine_api.controller;

import com.example.rootine_api.dto.ReorderTasksRequest;
import com.example.rootine_api.dto.TaskRequest;
import com.example.rootine_api.dto.TaskResponse;
import com.example.rootine_api.dto.TaskUpdateRequest;
import com.example.rootine_api.service.TaskService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/** Tasks in the authenticated user's routines. Other users' tasks respond 404. */
@RestController
@RequestMapping("/task")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getTask(@PathVariable Integer id) {
        return ResponseEntity.ok(taskService.getTask(id));
    }

    @GetMapping("/routine/{routineId}")
    public ResponseEntity<List<TaskResponse>> getTasksByRoutineId(@PathVariable Integer routineId) {
        return ResponseEntity.ok(taskService.getTasksByRoutineId(routineId));
    }

    @PostMapping
    public ResponseEntity<TaskResponse> addTask(
        @RequestParam Integer routineId,
        @Valid @RequestBody TaskRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.addTask(routineId, request));
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
        taskService.reorderTasks(routineId, request.getOrderedTaskIds());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> updateTask(
        @PathVariable Integer id,
        @Valid @RequestBody TaskUpdateRequest request
    ) {
        return ResponseEntity.ok(taskService.updateTask(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Integer id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}
