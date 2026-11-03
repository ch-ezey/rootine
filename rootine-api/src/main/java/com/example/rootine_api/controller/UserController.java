package com.example.rootine_api.controller;

import com.example.rootine_api.dto.UserResponse;
import com.example.rootine_api.dto.UserUpdateRequest;
import com.example.rootine_api.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/** The authenticated user's own account. Other users' accounts are not exposed. */
@RestController
@RequestMapping("/user/me")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<UserResponse> getMe() {
        return ResponseEntity.ok(UserResponse.from(userService.getCurrentUser()));
    }

    @PutMapping
    public ResponseEntity<UserResponse> updateMe(@Valid @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(UserResponse.from(userService.updateCurrentUser(request)));
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteMe() {
        userService.deleteCurrentUser();
        return ResponseEntity.noContent().build();
    }
}
