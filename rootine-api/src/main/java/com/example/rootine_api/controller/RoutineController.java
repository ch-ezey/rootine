package com.example.rootine_api.controller;

import com.example.rootine_api.model.Routine;
import com.example.rootine_api.model.Task;
import com.example.rootine_api.model.User;
import com.example.rootine_api.service.RoutineService;
import com.example.rootine_api.service.UserService;
import java.security.Principal;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/routine")
@CrossOrigin
public class RoutineController {

    @Autowired
    private RoutineService routineService;

    @Autowired
    private UserService userService;

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

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Routine>> getRoutinesByUserId(
        @PathVariable Integer userId
    ) {
        List<Routine> routines = routineService.getRoutinesByUserId(userId);
        return ResponseEntity.ok(routines);
    }

    @PostMapping
    public ResponseEntity<Routine> addRoutine(
        @RequestBody Routine routine,
        Principal principal
    ) {
        User user = userService.getUserByEmail(principal.getName());

        // Ensure the routine is owned by the authenticated user
        routine.setUser(user);

        // IMPORTANT (nested create):
        // If the client sends tasks inline under the routine, those Task entities must have their
        // `routine` back-reference set, otherwise JPA won't have a consistent association to persist.
        if (routine.getTasks() != null) {
            for (Task task : routine.getTasks()) {
                if (task != null) {
                    task.setRoutine(routine);
                }
            }
        }

        Routine savedRoutine = routineService.addRoutine(routine);

        return ResponseEntity.ok(savedRoutine);
    }

    @PostMapping("/{id}/activate")
    public ResponseEntity<Routine> activateRoutine(@PathVariable Integer id) {
        Routine updated = routineService.activateRoutine(id);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Routine> updateRoutine(
        @PathVariable Integer id,
        @RequestBody Routine routineUpdates
    ) {
        Routine updatedRoutine = routineService.updateRoutine(
            id,
            routineUpdates
        );
        return ResponseEntity.ok(updatedRoutine);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoutine(@PathVariable Integer id) {
        routineService.deleteRoutine(id);
        return ResponseEntity.noContent().build();
    }
}
