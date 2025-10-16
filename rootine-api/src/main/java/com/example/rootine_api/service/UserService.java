package com.example.rootine_api.service;

import com.example.rootine_api.model.User;

import java.util.List;
import java.util.UUID;

public interface UserService {
    List<User> getAllUser();
    User getUserById(Integer id);
    User getUserByEmail(String email);
    User getUserByUUID(UUID uuid);

    void addUser(User user);
    User updateUser(Integer id, User user);
    void deleteUser(Integer id);

    User registerUser(User registerRequest);

    void updateLastLogin(Integer id);
    void updateLastLogin(String email);

    User getCurrentUser();
}