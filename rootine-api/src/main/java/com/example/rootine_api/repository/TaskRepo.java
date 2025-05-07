package com.example.rootine_api.repository;

import com.example.rootine_api.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepo extends JpaRepository<Task, Integer> {
    List<Task> findByRoutineRoutineId(Integer routineId);
}
