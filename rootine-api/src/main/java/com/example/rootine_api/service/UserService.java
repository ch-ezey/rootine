package com.example.rootine_api.service;

import com.example.rootine_api.dto.RegisterRequest;
import com.example.rootine_api.dto.UserUpdateRequest;
import com.example.rootine_api.model.User;

public interface UserService {
    User registerUser(RegisterRequest request);

    /** Operations on the authenticated user's own account. */
    User getCurrentUser();
    User updateCurrentUser(UserUpdateRequest request);
    void deleteCurrentUser();

    void updateLastLogin(Integer userId);
}
