package com.skillbridge.user.application.command;

import com.skillbridge.auth.domain.entity.User;
import com.skillbridge.auth.infrastructure.persistence.UserRepository;
import com.skillbridge.user.api.dto.request.ProfileUpdateRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class UserProfileServiceTest {

    private UUID userId;
    private User user;
    private UserRepository repository;
    private UserProfileService service;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        user = new User();
        user.setId(userId);
        user.setFirstName("Old");
        user.setLastName("Name");
        user.setVersion(4L);
        repository = mock(UserRepository.class);
        when(repository.findById(userId)).thenReturn(Optional.of(user));
        when(repository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        service = new UserProfileService(repository);
    }

    @Test
    void updatesNamesAndProfileFieldsWhenVersionMatches() {
        ProfileUpdateRequest request = new ProfileUpdateRequest();
        request.setFirstName("  New  ");
        request.setLastName("  Person  ");
        request.setDisplayName("New Person");
        request.setMajor("Computer Science");

        User updated = service.updateProfile(userId, request, 4L);

        assertEquals("New", updated.getFirstName());
        assertEquals("Person", updated.getLastName());
        assertEquals("New Person", updated.getDisplayName());
        assertEquals("Computer Science", updated.getMajor());
        verify(repository).save(user);
    }

    @Test
    void rejectsMissingOrStaleVersionsWithoutSaving() {
        ProfileUpdateRequest request = new ProfileUpdateRequest();
        request.setDisplayName("New Person");

        assertThrows(IllegalArgumentException.class, () -> service.updateProfile(userId, request, null));
        assertThrows(IllegalArgumentException.class, () -> service.updateProfile(userId, request, 3L));
        verify(repository, never()).save(any(User.class));
    }
}
