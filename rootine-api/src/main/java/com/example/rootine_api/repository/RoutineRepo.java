package com.example.rootine_api.repository;

import com.example.rootine_api.model.Routine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoutineRepo extends JpaRepository<Routine, Integer> {
    List<Routine> findByUserUserId(Integer userId);
}
