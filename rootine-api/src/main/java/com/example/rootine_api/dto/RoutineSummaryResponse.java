package com.example.rootine_api.dto;

import com.example.rootine_api.enums.DetailLevel;
import com.example.rootine_api.model.Routine;
import java.time.LocalDateTime;

/** Routine without its tasks, for list views. */
public record RoutineSummaryResponse(
    Integer routineId,
    String name,
    String description,
    DetailLevel detailLevel,
    Boolean isActive,
    LocalDateTime createdAt
) {
    public static RoutineSummaryResponse from(Routine routine) {
        return new RoutineSummaryResponse(
            routine.getRoutineId(),
            routine.getName(),
            routine.getDescription(),
            routine.getDetailLevel(),
            routine.getIsActive(),
            routine.getCreatedAt()
        );
    }
}
