package com.example.rootine_api.repository;

import com.example.rootine_api.model.Task;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

/** Lookups are scoped to the owning user via the task's routine. */
@Repository
public interface TaskRepo extends JpaRepository<Task, Integer> {
    List<Task> findByRoutineRoutineIdOrderByPositionAscTaskIdAsc(Integer routineId);

    Optional<Task> findByTaskIdAndRoutineUserUserId(Integer taskId, Integer userId);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE Task t SET t.isCompleted = false WHERE t.routine.routineId = :routineId AND t.isCompleted = true")
    int resetCompletion(Integer routineId);

    @Query("SELECT COALESCE(MAX(t.position), -1) FROM Task t WHERE t.routine.routineId = :routineId")
    int findMaxPosition(Integer routineId);
}
