package com.example.rootine_api.dto;

import com.example.rootine_api.enums.Priority;
import com.example.rootine_api.enums.TaskType;
import com.example.rootine_api.model.Task;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record TaskResponse(
    Integer taskId,
    Integer routineId,
    String title,
    String description,
    TaskType taskType,
    LocalTime startTime,
    Integer duration,
    Priority priority,
    Boolean isCompleted,
    Integer position,
    LocalDateTime createdAt
) {
    public static TaskResponse from(Task task) {
        return new TaskResponse(
            task.getTaskId(),
            // Reading the id of a lazy proxy doesn't trigger a query
            task.getRoutine().getRoutineId(),
            task.getTitle(),
            task.getDescription(),
            task.getTaskType(),
            task.getStartTime(),
            task.getDuration(),
            task.getPriority(),
            task.getIsCompleted(),
            task.getPosition(),
            task.getCreatedAt()
        );
    }
}
