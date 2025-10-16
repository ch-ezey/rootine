package com.example.rootine_api.service;

import com.example.rootine_api.model.Routine;
import com.example.rootine_api.model.User;
import com.example.rootine_api.repository.RoutineRepo;
import com.example.rootine_api.repository.UserRepo;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoutineServiceImpl implements RoutineService{

    @Autowired
    private RoutineRepo routineRepo;

    @Autowired
    private UserService userService;

    @Override
    public List<Routine> getAllRoutines() {
        return routineRepo.findAll();
    }

    @Override
    public Routine getRoutineById(Integer id) {
        return routineRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Routine not found with id: " + id)) ;
    }

    @Override
    public List<Routine> getRoutinesByUserId(Integer userId) {
        return routineRepo.findByUserUserId(userId);
    }

    @Override
    public Routine addRoutine(Routine routine) {
        return routineRepo.save(routine);
    }

    @Override
    public Routine updateRoutine(Integer id, Routine routineUpdates) {
        User currentUser = userService.getCurrentUser();

        Routine existingRoutine = getRoutineById(id);

        // Authorization check
        if (!existingRoutine.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new AccessDeniedException("You are not authorized to modify this routine.");
        }

        // Update only fields that are allowed to change
        if (routineUpdates.getTitle() != null) {
            existingRoutine.setTitle(routineUpdates.getTitle());
        }
        if (routineUpdates.getTheme() != null) {
            existingRoutine.setTheme(routineUpdates.getTheme());
        }
        if (routineUpdates.getDetailLevel() != null) {
            existingRoutine.setDetailLevel(routineUpdates.getDetailLevel());
        }
        if (routineUpdates.getIsActive() != null) {
            existingRoutine.setIsActive(routineUpdates.getIsActive());
        }
        if (routineUpdates.getCreatedAt() != null) {
            existingRoutine.setCreatedAt(routineUpdates.getCreatedAt());
        }

        // Save and return updated entity
        return routineRepo.save(existingRoutine);
    }


    @Override
    public void deleteRoutine(Integer id) {
        if (!routineRepo.existsById(id)) {
            throw new EntityNotFoundException("Routine not found with id: " + id);
        }
        routineRepo.deleteById(id);
    }
}
