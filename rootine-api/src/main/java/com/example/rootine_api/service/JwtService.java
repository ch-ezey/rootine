package com.example.rootine_api.service;

import org.springframework.security.core.userdetails.UserDetails;

public interface JwtService {
    String generateToken(UserDetails userDetails);

    /**
     * Verifies the token's signature and expiry and returns its subject (the user's email).
     * Throws io.jsonwebtoken.JwtException if the token is invalid or expired.
     */
    String extractUsername(String token);
}
