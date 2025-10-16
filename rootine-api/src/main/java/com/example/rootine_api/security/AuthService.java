package com.example.rootine_api.security;

import com.example.rootine_api.model.User;
import com.example.rootine_api.repository.UserRepo;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepo userRepo;

    public AuthService(UserRepo userRepo) {
        this.userRepo = userRepo;
    }

    public User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new AccessDeniedException("User not authenticated or not found."));
    }

    /**
     * Checks if the current user is the owner of the resource or has admin privileges.
     * Throws AccessDeniedException if unauthorized.
     */
    public void verifyOwnershipOrAdmin(Integer ownerId) {
        User currentUser = getCurrentUser();

        boolean isOwner = currentUser.getUserId().equals(ownerId);
        boolean isAdmin = currentUser.getAuthorities()
                .stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("You are not authorized to perform this action.");
        }
    }
}
