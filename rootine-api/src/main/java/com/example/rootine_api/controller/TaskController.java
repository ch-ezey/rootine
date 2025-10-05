package com.example.rootine_api.controller;

import com.example.rootine_api.model.Routine;
import com.example.rootine_api.model.Task;
import com.example.rootine_api.service.RoutineService;
import com.example.rootine_api.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/task")
@CrossOrigin
public class TaskController {

    @Autowired
    private TaskService taskService;

    @Autowired
    private RoutineService routineService;

    @GetMapping("/tasks")
    public ResponseEntity<List<Task>> getAllTasks() {
        List<Task> tasks = taskService.getAllTasks();
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable Integer id) {
        Task task = taskService.getTaskById(id);
        return ResponseEntity.ok(task);
    }

    @GetMapping("/routine/{routineId}")
    public ResponseEntity<List<Task>> getTasksByRoutineId(@PathVariable Integer routineId) {
        List<Task> tasks = taskService.getTasksByRoutineId(routineId);
        return ResponseEntity.ok(tasks);
    }

    @PostMapping
    public ResponseEntity<Task> addTask(@RequestBody Task task, @RequestParam Integer routineId) {
        Routine routine = routineService.getRoutineById(routineId);

        task.setRoutine(routine);
        Task savedTask = taskService.addTask(task);

        return ResponseEntity.ok(savedTask);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Integer id, @RequestBody Task task) {
        Task updatedTask = taskService.updateTask(id, task);
        return ResponseEntity.ok(updatedTask);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Integer id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}