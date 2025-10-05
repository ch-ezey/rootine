package com.example.rootine_api.controller;

import com.example.rootine_api.dto.AuthResponse;

import com.example.rootine_api.model.User;
import com.example.rootine_api.service.JwtService;
import com.example.rootine_api.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> authenticate(@RequestBody User request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        String token = jwtService.generateToken(authentication);

        User user = userService.getUserByEmail(request.getEmail());

        Map<String, Object> response = Map.of(
                "token", token,
                "user", Map.of(
                        "id", user.getUserId(),
                        "name", user.getName(),
                        "email", user.getEmail()
                )
        );

        userService.updateLastLogin(request.getEmail());

        return ResponseEntity.ok(response);
    }


    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody User user) {
        // UserService throws RuntimeException if user already exists
        User savedUser = userService.registerUser(user);

        // Issue JWT immediately upon successful registration
        String token = jwtService.generateToken(savedUser);

        Map<String, Object> response = Map.of(
                "token", token,
                "user", Map.of(
                        "id", user.getUserId(),
                        "name", user.getName(),
                        "email", user.getEmail()
                )
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        String email = authentication.getName(); // from UserDetails
        User user = userService.getUserByEmail(email);

        return ResponseEntity.ok(Map.of(
                "id", user.getUserId(),
                "email", user.getEmail(),
                "name", user.getName(),
                "lastLogin", user.getLastLogin()
        ));
    }

}