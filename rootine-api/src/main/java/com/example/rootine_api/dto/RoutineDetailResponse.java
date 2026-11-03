package com.example.rootine_api.dto;

import com.example.rootine_api.enums.DetailLevel;
import com.example.rootine_api.model.Routine;
import java.time.LocalDateTime;
import java.util.List;

/** Routine with its tasks in display order. */
public record RoutineDetailResponse(
    Integer routineId,
    String name,
    String description,
    DetailLevel detailLevel,
    Boolean isActive,
    LocalDateTime createdAt,
    List<TaskResponse> tasks
) {
    public static RoutineDetailResponse from(Routine routine) {
        return new RoutineDetailResponse(
            routine.getRoutineId(),
            routine.getName(),
            routine.getDescription(),
            routine.getDetailLevel(),
            routine.getIsActive(),
            routine.getCreatedAt(),
            routine.getTasks().stream().map(TaskResponse::from).toList()
        );
    }
}
