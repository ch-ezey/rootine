package com.example.rootine_api.service;

import com.example.rootine_api.exception.UserAlreadyExistsException;
import com.example.rootine_api.exception.UserNotFoundException;
import com.example.rootine_api.model.User;
import com.example.rootine_api.repository.UserRepo;
import com.example.rootine_api.security.AuthService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepo userRepo;
    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepo userRepo, AuthService authService, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.authService = authService;
        this.passwordEncoder = passwordEncoder;
    }

    // ─── Retrieval ───────────────────────────────────────────────────────────────

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
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));
    }

    @Override
    public User getUserByUUID(UUID uuid) {
        return userRepo.findByUuid(uuid)
                .orElseThrow(() -> new UserNotFoundException("User not found with UUID: " + uuid));
    }

    // ─── Create / Register ────────────────────────────────────────────────────────

    @Override
    public User registerUser(User registerRequest) {
        userRepo.findByEmail(registerRequest.getEmail())
                .ifPresent(u -> { throw new UserAlreadyExistsException("User already exists with email: " + u.getEmail()); });

        registerRequest.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        registerRequest.setUuid(UUID.randomUUID());
        return userRepo.save(registerRequest);
    }

    @Override
    public void addUser(User user) {
        registerUser(user); // delegate for consistency
    }

    // ─── Update ───────────────────────────────────────────────────────────────────

    @Override
    public User updateUser(Integer id, User userUpdates) {
        User existingUser = getUserById(id);
        authService.verifyOwnershipOrAdmin(existingUser.getUserId());

        applyUserUpdates(existingUser, userUpdates);
        return userRepo.save(existingUser);
    }

    private void applyUserUpdates(User existing, User updates) {
        if (updates.getName() != null) existing.setName(updates.getName());
        if (updates.getEmail() != null) existing.setEmail(updates.getEmail()); // optional improvement
        if (updates.getPassword() != null) existing.setPassword(passwordEncoder.encode(updates.getPassword()));
    }

    // ─── Delete ───────────────────────────────────────────────────────────────────

    @Override
    public void deleteUser(Integer id) {
        User existingUser = getUserById(id);
        authService.verifyOwnershipOrAdmin(existingUser.getUserId());
        userRepo.delete(existingUser);
    }

    // ─── Utility ──────────────────────────────────────────────────────────────────

    @Override
    public void updateLastLogin(Integer id) {
        User user = getUserById(id);
        user.setLastLogin(LocalDateTime.now());
        userRepo.save(user);
    }

    @Override
    public void updateLastLogin(String email) {
        User user = getUserByEmail(email);
        user.setLastLogin(LocalDateTime.now());
        userRepo.save(user);
    }
}
