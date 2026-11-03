package com.example.rootine_api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserUpdateRequest(@NotBlank @Size(max = 255) String name) {}
