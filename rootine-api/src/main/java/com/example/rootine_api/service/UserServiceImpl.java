package com.example.rootine_api.service;

import com.example.rootine_api.exception.UserAlreadyExistsException;
import com.example.rootine_api.exception.UserNotFoundException;
import com.example.rootine_api.model.User;
import com.example.rootine_api.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class UserServiceImpl implements UserService {

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
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));
    }

    @Override
    public User getUserByEmail(String email) {
        User user = userRepo.findByEmail(email);
        if (user == null) {
            throw new UserNotFoundException("User not found with email: " + email);
        }
        return user;
    }

    @Override
    public User getUserByUUID(UUID uuid) {
        return userRepo.findByUuid(uuid)
                .orElseThrow(() -> new UserNotFoundException("User not found with UUID: " + uuid));
    }

    @Override
    public void addUser(User user) {
        if (userRepo.findByEmail(user.getEmail()) != null) {
            throw new UserAlreadyExistsException("User with email " + user.getEmail() + " already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setUuid(UUID.randomUUID());
        userRepo.save(user);
    }

    @Override
    public User updateUser(Integer id, User user) {
        if (!userRepo.existsById(id)) {
            throw new UserNotFoundException("User not found with id: " + id);
        }
        user.setUserId(id);
        return userRepo.save(user);
    }

    @Override
    public void deleteUser(Integer id) {
        if (!userRepo.existsById(id)) {
            throw new UserNotFoundException("User not found with id: " + id);
        }
        userRepo.deleteById(id);
    }

    @Override
    public User registerUser(User registerRequest) {
        if (userRepo.findByEmail(registerRequest.getEmail()) != null) {
            throw new UserAlreadyExistsException("User already exists with email: " + registerRequest.getEmail());
        }

        registerRequest.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        registerRequest.setUuid(UUID.randomUUID());

        return userRepo.save(registerRequest);
    }
}
