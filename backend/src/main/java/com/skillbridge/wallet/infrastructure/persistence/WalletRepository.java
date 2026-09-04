package com.skillbridge.wallet.infrastructure.persistence;

import com.skillbridge.wallet.domain.entity.Wallet;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, UUID> {
    @org.springframework.data.jpa.repository.Query("select coalesce(sum(wallet.heldPoints), 0) from Wallet wallet")
    long sumHeldPoints();

    Optional<Wallet> findByUserId(UUID userId);

    boolean existsByUserId(UUID userId);

    // Pessimistic row lock so concurrent holds/releases/adjustments serialize on one wallet row
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Wallet> findWithLockByUserId(UUID userId);
}
