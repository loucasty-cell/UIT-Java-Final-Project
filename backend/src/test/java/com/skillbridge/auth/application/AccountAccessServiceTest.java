package com.skillbridge.auth.application;

import com.skillbridge.admin.domain.model.AccountStatus;
import com.skillbridge.auth.application.command.AccountAccessService;
import com.skillbridge.auth.domain.entity.User;
import com.skillbridge.auth.infrastructure.persistence.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;

import java.time.OffsetDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AccountAccessServiceTest {
    private final UserRepository users = mock(UserRepository.class);
    private final AccountAccessService service = new AccountAccessService(users);

    @Test
    void blocksAnActiveTemporarySuspensionWithItsEndTime() {
        User user = suspendedUntil(OffsetDateTime.now().plusDays(7));
        AccessDeniedException error = assertThrows(AccessDeniedException.class, () -> service.requireAccessible(user));
        assertTrue(error.getMessage().contains("temporarily suspended until"));
        verify(users, never()).save(any());
    }

    @Test
    void automaticallyReactivatesAnExpiredSuspension() {
        User user = suspendedUntil(OffsetDateTime.now().minusMinutes(1));
        when(users.save(user)).thenReturn(user);
        User result = service.requireAccessible(user);
        assertSame(user, result);
        assertEquals(AccountStatus.ACTIVE, user.getStatus());
        assertNull(user.getSuspendedUntil());
        verify(users).save(user);
    }

    private User suspendedUntil(OffsetDateTime until) {
        User user = new User();
        user.setStatus(AccountStatus.SUSPENDED);
        user.setSuspendedUntil(until);
        user.setUpdatedAt(OffsetDateTime.now().minusDays(1));
        return user;
    }
}
