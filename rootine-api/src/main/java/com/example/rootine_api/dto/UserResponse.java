package com.example.rootine_api.dto;

import com.example.rootine_api.model.User;
import java.time.LocalDateTime;

public record UserResponse(
    Integer id,
    String name,
    String email,
    LocalDateTime createdAt,
    LocalDateTime lastLogin
) {
    public static UserResponse from(User user) {
        return new UserResponse(
            user.getUserId(),
            user.getName(),
            user.getEmail(),
            user.getCreatedAt(),
            user.getLastLogin()
        );
    }
}
