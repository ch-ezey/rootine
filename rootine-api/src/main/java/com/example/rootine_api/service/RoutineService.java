package com.example.rootine_api.service;

import com.example.rootine_api.model.Routine;

import java.util.List;

public interface RoutineService {
    List<Routine> getAllRoutines();
    Routine getRoutineById(Integer id);
    void addRoutine(Routine routine);
    Routine updateRoutine(Integer id, Routine routine);
    void deleteRoutine(Integer id);
}