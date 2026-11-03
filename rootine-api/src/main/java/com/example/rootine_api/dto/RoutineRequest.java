package com.example.rootine_api.dto;

import com.example.rootine_api.enums.DetailLevel;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

/** Create a routine, optionally with its tasks in one request (e.g. a saved AI draft). */
public record RoutineRequest(
    @NotBlank @Size(max = 255) String name,
    @Size(max = 1000) String description,
    DetailLevel detailLevel,
    @Valid @Size(max = 100) List<TaskRequest> tasks
) {}
