package com.example.rootine_api.service;

import com.example.rootine_api.model.User;
import com.example.rootine_api.repository.UserRepo;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserServiceImpl implements UserService{

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public List<User> getAllUser() {
        return userRepo.findAll();
    }

    @Override
    public User getUserById(Integer id) {
        return userRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id)) ;
    }

    @Override
    public User getUserByEmail(String email) {
        return userRepo.findByEmail(email);
    }

    @Override
    public void addUser(User user) {
        userRepo.save(user);
    }

    @Override
    public User updateUser(Integer id, User user) {
        if (!userRepo.existsById(id)) {
            throw new EntityNotFoundException("User not found with id: " + id);
        }
        user.setUserId(id);
        return userRepo.save(user);
    }

    @Override
    public void deleteUser(Integer id) {
        if (!userRepo.existsById(id)) {
            throw new EntityNotFoundException("User not found with id: " + id);
        }
        userRepo.deleteById(id);
    }

    @Override
    public User registerUser(User registerRequest) {
        // Check if user already exists
        if (userRepo.findByEmail(registerRequest.getEmail()) != null) {
            throw new RuntimeException("User already exists");
        }

        // Encode password
        registerRequest.setPasswordHash(passwordEncoder.encode(registerRequest.getPasswordHash()));

        // Save user
        return userRepo.save(registerRequest);
    }

    @Override
    public User login(User loginRequest) {
        User user = userRepo.findByEmail(loginRequest.getEmail());
        if (user == null || !passwordEncoder.matches(loginRequest.getPasswordHash(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }
        return user;
    }

    @Override
    public User logout(User user) {
        // Invalidate the user's session or token here
        // This is just a placeholder as the actual implementation depends on your authentication mechanism
        return user;
    }
}
