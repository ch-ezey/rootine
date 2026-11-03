package com.example.rootine_api.security;

import com.example.rootine_api.model.User;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    /**
     * The authenticated user, as loaded once per request by JwtAuthenticationFilter.
     * No database access. The entity is detached: use its id for queries rather than
     * navigating lazy associations.
     */
    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof User user)) {
            throw new AuthenticationCredentialsNotFoundException("Not authenticated");
        }
        return user;
    }

    public Integer getCurrentUserId() {
        return getCurrentUser().getUserId();
    }
}
