package com.example.rootine_api.service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;

public interface JwtService {
    String generateToken(UserDetails userDetails);
    String generateToken(Authentication authentication);
    String extractUsername(String token);
    boolean isTokenValid(String token, UserDetails userDetails);
}