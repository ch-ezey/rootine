package com.example.rootine_api.dto;

import com.example.rootine_api.enums.Priority;
import com.example.rootine_api.enums.TaskType;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.time.LocalTime;

/**
 * Partial update: null fields are left unchanged. Use the reorder endpoint to change positions.
 * Since null means "unchanged", clearing the optional time fields uses explicit flags.
 */
public record TaskUpdateRequest(
    @Size(max = 150) @Pattern(regexp = ".*\\S.*", message = "must not be blank") String title,
    @Size(max = 1000) String description,
    TaskType taskType,
    LocalTime startTime,
    @Positive Integer duration,
    Priority priority,
    Boolean isCompleted,
    Boolean clearStartTime,
    Boolean clearDuration
) {}
