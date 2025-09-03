package com.example.rootine_api.controller;

import com.example.rootine_api.dto.AuthRequest;
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
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
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
    public ResponseEntity<AuthResponse> authenticate(@RequestBody User request) {
        // Let AuthenticationManager handle validation (BadCredentialsException if invalid)
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // Generate JWT for authenticated user
        String token = jwtService.generateToken(authentication);

        return ResponseEntity.ok(new AuthResponse(token));
    }


    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody User user) {
        // UserService throws RuntimeException if user already exists
        User savedUser = userService.registerUser(user);

        // Issue JWT immediately upon successful registration
        String token = jwtService.generateToken(savedUser);

        return ResponseEntity.ok(new AuthResponse(token));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        String email = authentication.getName(); // from UserDetails
        User user = userService.getUserByEmail(email);

        // return only safe fields (no password!)
        return ResponseEntity.ok(Map.of(
                "id", user.getUserId(),
                "email", user.getEmail(),
                "name", user.getName()
        ));
    }



}