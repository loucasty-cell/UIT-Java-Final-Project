package com.skillbridge.auth.application.command;

import com.skillbridge.admin.domain.model.AccountStatus;
import com.skillbridge.auth.domain.entity.User;
import com.skillbridge.auth.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Service
@Transactional
@RequiredArgsConstructor
public class AccountAccessService {
    private final UserRepository userRepository;

    public User requireAccessible(User user) {
        if (user.getStatus() == AccountStatus.DISABLED) {
            throw new AccessDeniedException("Account has been disabled. Please contact support.");
        }
        if (user.getStatus() != AccountStatus.SUSPENDED) return user;

        OffsetDateTime now = OffsetDateTime.now();
        if (user.getSuspendedUntil() != null && !user.getSuspendedUntil().isAfter(now)) {
            user.setStatus(AccountStatus.ACTIVE);
            user.setSuspendedUntil(null);
            user.setUpdatedAt(now);
            return userRepository.save(user);
        }
        String until = user.getSuspendedUntil() == null ? "an administrator lifts it" : user.getSuspendedUntil().toString();
        throw new AccessDeniedException("Account temporarily suspended until " + until + ".");
    }
}
