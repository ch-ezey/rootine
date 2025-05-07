package com.example.rootine_api.service;

import com.example.rootine_api.model.Routine;
import com.example.rootine_api.repository.RoutineRepo;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoutineServiceImpl implements RoutineService{

    @Autowired
    private RoutineRepo routineRepo;

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
    public void addRoutine(Routine routine) {
        routineRepo.save(routine);
    }

    @Override
    public Routine updateRoutine(Integer id, Routine routine) {
        if (!routineRepo.existsById(id)) {
            throw new EntityNotFoundException("Routine not found with id: " + id);
        }
        routine.setRoutineId(id);
        return routineRepo.save(routine);
    }

    @Override
    public void deleteRoutine(Integer id) {
        if (!routineRepo.existsById(id)) {
            throw new EntityNotFoundException("Routine not found with id: " + id);
        }
        routineRepo.deleteById(id);
    }
}
