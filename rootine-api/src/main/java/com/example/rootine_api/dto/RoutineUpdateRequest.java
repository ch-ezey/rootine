package com.example.rootine_api.dto;

import com.example.rootine_api.enums.DetailLevel;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Partial update: null fields are left unchanged.
 * Activation is handled by POST /routine/{id}/activate so the one-active rule stays atomic.
 */
public record RoutineUpdateRequest(
    @Size(max = 255) @Pattern(regexp = ".*\\S.*", message = "must not be blank") String name,
    @Size(max = 1000) String description,
    DetailLevel detailLevel
) {}
