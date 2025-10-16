package com.example.rootine_api.service;

import com.example.rootine_api.model.Routine;

import java.nio.file.AccessDeniedException;
import java.util.List;

public interface RoutineService {
    List<Routine> getAllRoutines();
    Routine getRoutineById(Integer id);
    List<Routine> getRoutinesByUserId(Integer userId);
    Routine addRoutine(Routine routine);
    Routine updateRoutine(Integer id, Routine routine);
    void deleteRoutine(Integer id);
}