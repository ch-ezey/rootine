package com.example.rootine_api.controller;

import com.example.rootine_api.model.Routine;
import com.example.rootine_api.service.RoutineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/routine")
@CrossOrigin
public class RoutineController {

    @Autowired
    private RoutineService routineService;

    @GetMapping("/routines")
    public ResponseEntity<List<Routine>> getAllRoutines() {
        List<Routine> routines = routineService.getAllRoutines();
        return ResponseEntity.ok(routines);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Routine> getRoutineById(@PathVariable Integer id) {
        Routine routine = routineService.getRoutineById(id);
        return ResponseEntity.ok(routine);
    }

    @PostMapping
    public ResponseEntity<Void> addRoutine(@RequestBody Routine routine) {
        routineService.addRoutine(routine);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Routine> updateRoutine(@PathVariable Integer id, @RequestBody Routine routine) {
        Routine updatedRoutine = routineService.updateRoutine(id, routine);
        return ResponseEntity.ok(updatedRoutine);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoutine(@PathVariable Integer id) {
        routineService.deleteRoutine(id);
        return ResponseEntity.noContent().build();
    }
}