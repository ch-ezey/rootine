package com.example.rootine_api.repository;

import com.example.rootine_api.model.Task;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskRepo extends JpaRepository<Task, Integer> {
    List<Task> findByRoutineRoutineIdOrderByPositionAscTaskIdAsc(
        Integer routineId
    );
}
