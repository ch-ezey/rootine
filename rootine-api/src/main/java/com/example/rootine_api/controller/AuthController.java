package com.example.rootine_api.controller;

import com.example.rootine_api.dto.AuthResponse;
import com.example.rootine_api.dto.LoginRequest;
import com.example.rootine_api.dto.RegisterRequest;
import com.example.rootine_api.dto.UserResponse;
import com.example.rootine_api.model.User;
import com.example.rootine_api.service.JwtService;
import com.example.rootine_api.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserService userService;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthController(UserService userService, JwtService jwtService,
                          AuthenticationManager authenticationManager) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email().trim().toLowerCase(),
                        request.password()
                )
        );

        // The principal is the User loaded during authentication; no second lookup
        User user = (User) authentication.getPrincipal();
        userService.updateLastLogin(user.getUserId());

        return ResponseEntity.ok(new AuthResponse(jwtService.generateToken(user), UserResponse.from(user)));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        User savedUser = userService.registerUser(request);

        // Issue JWT immediately upon successful registration
        return ResponseEntity.ok(new AuthResponse(jwtService.generateToken(savedUser), UserResponse.from(savedUser)));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser() {
        return ResponseEntity.ok(UserResponse.from(userService.getCurrentUser()));
    }
}
