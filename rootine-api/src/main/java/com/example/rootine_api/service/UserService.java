package com.example.rootine_api.service;

import com.example.rootine_api.model.Routine;
import com.example.rootine_api.model.User;

import java.util.List;

public interface UserService {
    List<User> getAllUser();
    User getUserById(Integer id);
    User getUserByEmail(String email);
    void addUser(User user);
    User updateUser(Integer id, User user);
    void deleteUser(Integer id);

    User registerUser(User registerRequest);
    User login(User loginRequest);
    User logout(User user);
}