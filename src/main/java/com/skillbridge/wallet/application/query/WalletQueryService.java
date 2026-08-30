package com.skillbridge.wallet.application.query;

import com.skillbridge.wallet.api.dto.response.PointTransactionResponse;
import com.skillbridge.wallet.api.dto.response.WalletResponse;
import com.skillbridge.wallet.api.mapper.WalletMapper;
import com.skillbridge.wallet.domain.entity.PointTransaction;
import com.skillbridge.wallet.domain.model.PointEventType;
import com.skillbridge.wallet.infrastructure.persistence.PointTransactionRepository;
import com.skillbridge.wallet.infrastructure.persistence.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

// WalletQueryService: Read-only owner-facing wallet projections (balance, ledger page, CSV export)
// Linkage: WalletController -> WalletQueryService -> WalletRepository, PointTransactionRepository
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class WalletQueryService {

    private final WalletRepository walletRepository;

    private final PointTransactionRepository pointTransactionRepository;

    private final WalletMapper walletMapper;

    // Returns the caller's balances; accounts predating V5 see a zeroed wallet without any write
    public WalletResponse getWallet(UUID ownerId) {
        return walletRepository.findByUserId(ownerId)
                .map(walletMapper::toWalletResponse)
                .orElseGet(this::zeroedWalletResponse);
    }

    // Returns one filtered, sorted page of the caller's immutable point activity
    public Page<PointTransactionResponse> getTransactions(
            UUID ownerId,
            PointEventType eventType,
            OffsetDateTime from,
            OffsetDateTime to,
            Pageable pageable
    ) {
        return loadTransactionsPage(ownerId, eventType, from, to, pageable)
                .map(walletMapper::toTransactionResponse);
    }

    // Renders the caller's filtered activity as RFC 4180-style CSV for owner export only
    public String exportTransactionsCsv(UUID ownerId, PointEventType eventType, OffsetDateTime from, OffsetDateTime to) {
        StringBuilder csv = new StringBuilder();
        csv.append("id,event_type,available_delta,held_delta,balance_after_available,balance_after_held,description,reference_type,reference_id,created_at\n");

        for (PointTransaction transaction : loadTransactionsPage(ownerId, eventType, from, to, Pageable.unpaged())) {
            csv.append(escapeCsvValue(transaction.getId().toString())).append(',')
                    .append(escapeCsvValue(transaction.getEventType().name())).append(',')
                    .append(transaction.getAvailableDelta()).append(',')
                    .append(transaction.getHeldDelta()).append(',')
                    .append(transaction.getBalanceAfterAvailable()).append(',')
                    .append(transaction.getBalanceAfterHeld()).append(',')
                    .append(escapeCsvValue(transaction.getDescription())).append(',')
                    .append(escapeCsvValue(transaction.getReferenceType())).append(',')
                    .append(escapeCsvValue(safeReferenceId(transaction))).append(',')
                    .append(escapeCsvValue(transaction.getCreatedAt().toString()))
                    .append('\n');
        }
        return csv.toString();
    }

    // Zeroed projection used when no wallet row exists yet; queries never mutate state
    private WalletResponse zeroedWalletResponse() {
        return WalletResponse.builder()
                .availablePoints(0)
                .heldPoints(0)
                .totalEarned(0)
                .totalSpent(0)
                .version(0L)
                .updatedAt(OffsetDateTime.now())
                .build();
    }

    // Chooses the matching derived-query combination based on the optional filters
    private Page<PointTransaction> loadTransactionsPage(
            UUID ownerId,
            PointEventType eventType,
            OffsetDateTime from,
            OffsetDateTime to,
            Pageable pageable
    ) {
        if (eventType != null && from != null && to != null) {
            return pointTransactionRepository.findByUserIdAndEventTypeAndCreatedAtBetween(ownerId, eventType, from, to, pageable);
        }
        if (eventType != null) {
            return pointTransactionRepository.findByUserIdAndEventType(ownerId, eventType, pageable);
        }
        if (from != null && to != null) {
            return pointTransactionRepository.findByUserIdAndCreatedAtBetween(ownerId, from, to, pageable);
        }
        return pointTransactionRepository.findByUserId(ownerId, pageable);
    }

    // Wraps a value in quotes when it contains characters that would break the CSV structure
    private String escapeCsvValue(String value) {
        if (value == null) {
            return "";
        }
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return '"' + value.replace("\"", "\"\"") + '"';
        }
        return value;
    }

    private String safeReferenceId(PointTransaction transaction) {
        return transaction.getReferenceId() == null ? null : transaction.getReferenceId().toString();
    }
}
