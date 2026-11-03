package com.example.rootine_api.repository;

import com.example.rootine_api.model.Routine;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

/**
 * Lookups are scoped to the owning user, so a routine that belongs to someone else
 * is indistinguishable from one that doesn't exist (both come back empty).
 */
@Repository
public interface RoutineRepo extends JpaRepository<Routine, Integer> {
    List<Routine> findByUserUserIdOrderByRoutineIdAsc(Integer userId);

    Optional<Routine> findByRoutineIdAndUserUserId(Integer routineId, Integer userId);

    boolean existsByRoutineIdAndUserUserId(Integer routineId, Integer userId);

    /** Routine and its tasks in a single query. */
    @Query(
        """
        SELECT r FROM Routine r
        LEFT JOIN FETCH r.tasks
        WHERE r.routineId = :routineId
          AND r.user.userId = :userId
        """
    )
    Optional<Routine> findWithTasks(Integer routineId, Integer userId);

    @Modifying
    @Query(
        """
        UPDATE Routine r
        SET r.isActive = false
        WHERE r.user.userId = :userId
          AND r.routineId <> :exceptRoutineId
          AND r.isActive = true
        """
    )
    int deactivateOthersForUser(Integer userId, Integer exceptRoutineId);
}
