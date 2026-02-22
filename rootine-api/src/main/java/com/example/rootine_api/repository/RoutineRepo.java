package com.example.rootine_api.repository;

import com.example.rootine_api.model.Routine;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface RoutineRepo extends JpaRepository<Routine, Integer> {
    List<Routine> findByUserUserId(Integer userId);

    /**
     * Bulk-deactivate any active routines for a given user.

     * Used to enforce "only one active routine at a time" when activating a routine.

     * Returns the number of rows updated.
     */
    @Modifying
    @Query(
            """
            UPDATE Routine r
            SET r.active = false
            WHERE r.user.userId = :userId
                AND r.active = true
            """
    )
    int deactivateAllActiveForUser(Integer userId);
    
}
