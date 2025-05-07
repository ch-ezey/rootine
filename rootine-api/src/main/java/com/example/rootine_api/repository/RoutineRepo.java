package com.example.rootine_api.repository;

import com.example.rootine_api.model.Routine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoutineRepo extends JpaRepository<Routine, Integer> {
}
