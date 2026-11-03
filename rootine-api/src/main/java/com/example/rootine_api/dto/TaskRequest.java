package com.example.rootine_api.dto;

import com.example.rootine_api.enums.Priority;
import com.example.rootine_api.enums.TaskType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.time.LocalTime;

/** Create a task. Position defaults to the end of the routine. */
public record TaskRequest(
    @NotBlank @Size(max = 150) String title,
    @Size(max = 1000) String description,
    TaskType taskType,
    LocalTime startTime,
    @Positive Integer duration,
    Priority priority,
    @PositiveOrZero Integer position
) {}
