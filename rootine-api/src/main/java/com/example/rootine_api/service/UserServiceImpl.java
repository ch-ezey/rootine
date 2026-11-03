package com.example.rootine_api.service;

import com.example.rootine_api.dto.RegisterRequest;
import com.example.rootine_api.dto.UserUpdateRequest;
import com.example.rootine_api.exception.UserAlreadyExistsException;
import com.example.rootine_api.exception.UserNotFoundException;
import com.example.rootine_api.model.User;
import com.example.rootine_api.repository.UserRepo;
import com.example.rootine_api.security.AuthService;
import java.time.LocalDateTime;
import java.util.UUID;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    // ─── Create / Register ────────────────────────────────────────────────────────

    @Override
    @Transactional
    public User registerUser(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (userRepo.existsByEmail(email)) {
            throw new UserAlreadyExistsException("An account with this email already exists");
        }

        User user = new User(email, passwordEncoder.encode(request.password()), request.name().trim());
        user.setUuid(UUID.randomUUID());
        return userRepo.save(user);
    }

    // ─── Current user ─────────────────────────────────────────────────────────────

    @Override
    public User getCurrentUser() {
        // Already loaded by the JWT filter for this request
        return authService.getCurrentUser();
    }

    @Override
    @Transactional
    public User updateCurrentUser(UserUpdateRequest request) {
        User user = findById(authService.getCurrentUserId());
        user.setName(request.name().trim());
        return user;
    }

    @Override
    @Transactional
    public void deleteCurrentUser() {
        // Routines and tasks are removed by ON DELETE CASCADE
        userRepo.delete(findById(authService.getCurrentUserId()));
    }

    // ─── Utility ──────────────────────────────────────────────────────────────────

    @Override
    public void updateLastLogin(Integer userId) {
        userRepo.updateLastLogin(userId, LocalDateTime.now());
    }

    private User findById(Integer id) {
        return userRepo.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));
    }
}
