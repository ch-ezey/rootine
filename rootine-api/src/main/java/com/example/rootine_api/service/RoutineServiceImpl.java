package com.example.rootine_api.service;

import com.example.rootine_api.model.Routine;
import com.example.rootine_api.repository.RoutineRepo;
import com.example.rootine_api.security.AuthService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class RoutineServiceImpl implements RoutineService {

    private final RoutineRepo routineRepo;
    private final AuthService authService;

    public RoutineServiceImpl(RoutineRepo routineRepo, AuthService authService) {
        this.routineRepo = routineRepo;
        this.authService = authService;
    }

    // ─── Retrieval ───────────────────────────────────────────────────────────────────

    @Override
    public List<Routine> getAllRoutines() {
        return routineRepo.findAll();
    }

    @Override
    public Routine getRoutineById(Integer id) {
        return routineRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Routine not found with id: " + id));
    }

    @Override
    public List<Routine> getRoutinesByUserId(Integer userId) {
        return routineRepo.findByUserUserId(userId);
    }

    // ─── Create ───────────────────────────────────────────────────────────────────

    @Override
    public Routine addRoutine(Routine routine) {
        return routineRepo.save(routine);
    }

    // ─── Update ───────────────────────────────────────────────────────────────────

    @Override
    public Routine updateRoutine(Integer id, Routine updates) {
        Routine existingRoutine = getRoutineById(id);

        authService.verifyOwnershipOrAdmin(existingRoutine.getUser().getUserId());

        applyRoutineUpdates(existingRoutine, updates);

        return routineRepo.save(existingRoutine);
    }

    // ─── Delete ───────────────────────────────────────────────────────────────────

    @Override
    public void deleteRoutine(Integer id) {
        Routine existingRoutine = getRoutineById(id);

        authService.verifyOwnershipOrAdmin(existingRoutine.getUser().getUserId());

        routineRepo.delete(existingRoutine);
    }

    // ─── Utility ───────────────────────────────────────────────────────────────────

    private void applyRoutineUpdates(Routine existing, Routine updates) {
        if (updates.getName() != null) existing.setName(updates.getName());
        if (updates.getDetailLevel() != null) existing.setDetailLevel(updates.getDetailLevel());
        if (updates.getIsActive() != null) existing.setIsActive(updates.getIsActive());
        if (updates.getCreatedAt() != null) existing.setCreatedAt(updates.getCreatedAt());
    }
}
