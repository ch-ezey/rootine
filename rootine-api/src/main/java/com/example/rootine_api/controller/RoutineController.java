package com.example.rootine_api.controller;

import com.example.rootine_api.dto.RoutineDetailResponse;
import com.example.rootine_api.dto.RoutineRequest;
import com.example.rootine_api.dto.RoutineSummaryResponse;
import com.example.rootine_api.dto.RoutineUpdateRequest;
import com.example.rootine_api.service.RoutineService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/** Routines of the authenticated user. Other users' routines respond 404. */
@RestController
@RequestMapping("/routine")
public class RoutineController {

    private final RoutineService routineService;

    public RoutineController(RoutineService routineService) {
        this.routineService = routineService;
    }

    /** List view: routines without their tasks. */
    @GetMapping
    public ResponseEntity<List<RoutineSummaryResponse>> getMyRoutines() {
        return ResponseEntity.ok(routineService.getMyRoutines());
    }

    /** Detail view: routine with its tasks in order. */
    @GetMapping("/{id}")
    public ResponseEntity<RoutineDetailResponse> getRoutine(@PathVariable Integer id) {
        return ResponseEntity.ok(routineService.getRoutine(id));
    }

    /** Create a routine, optionally with nested tasks. */
    @PostMapping
    public ResponseEntity<RoutineDetailResponse> addRoutine(@Valid @RequestBody RoutineRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(routineService.addRoutine(request));
    }

    /** Make this the user's only active routine. */
    @PostMapping("/{id}/activate")
    public ResponseEntity<RoutineSummaryResponse> activateRoutine(@PathVariable Integer id) {
        return ResponseEntity.ok(routineService.activateRoutine(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoutineSummaryResponse> updateRoutine(
        @PathVariable Integer id,
        @Valid @RequestBody RoutineUpdateRequest request
    ) {
        return ResponseEntity.ok(routineService.updateRoutine(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoutine(@PathVariable Integer id) {
        routineService.deleteRoutine(id);
        return ResponseEntity.noContent().build();
    }
}
