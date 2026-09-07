package com.skillbridge.wallet.api.controller;

import com.skillbridge.shared.security.SecurityUtils;
import com.skillbridge.wallet.api.dto.request.TransferPointsRequest;
import com.skillbridge.wallet.api.dto.response.PointTransactionResponse;
import com.skillbridge.wallet.api.dto.response.WalletResponse;
import com.skillbridge.wallet.api.mapper.WalletMapper;
import com.skillbridge.wallet.application.command.WalletService;
import com.skillbridge.wallet.application.query.WalletQueryService;
import com.skillbridge.wallet.domain.entity.PointTransaction;
import com.skillbridge.wallet.domain.model.PointEventType;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.UUID;

// WalletController: Exposes owner-only endpoints for the authenticated caller's wallet and peer transfers
// Linkage: GET /api/v1/me/wallet* / POST /api/v1/wallet/transfer -> SecurityUtils (JWT subject)
@RestController
@RequestMapping({"/api/v1", "/api"})
@RequiredArgsConstructor
public class WalletController {

    private final WalletQueryService walletQueryService;
    private final WalletService walletService;
    private final WalletMapper walletMapper;

    // Returns the caller's wallet balances; the JWT subject is the only ownership source
    // Linkage: GET /api/v1/me/wallet -> WalletQueryService.getWallet() -> WalletResponse
    @GetMapping({"/me/wallet", "/me/wallet/balance", "/wallet/balance"})
    public ResponseEntity<WalletResponse> getMyWallet() {
        UUID ownerId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(walletQueryService.getWallet(ownerId));
    }

    // Direct peer-to-peer point transfer to another student
    @PostMapping({"/wallet/transfer", "/me/wallet/transfer"})
    public ResponseEntity<PointTransactionResponse> transferPoints(
            @Valid @RequestBody TransferPointsRequest request
    ) {
        UUID senderId = SecurityUtils.getCurrentUserId();
        PointTransaction tx = walletService.transferPoints(
                senderId,
                request.getRecipientId(),
                request.getAmount(),
                request.getReason()
        );
        return ResponseEntity.ok(walletMapper.toTransactionResponse(tx));
    }

    // Returns one page of the caller's point activity with optional type and date-window filters
    // Linkage: GET /api/v1/me/wallet/transactions?type=&from=&to= -> WalletQueryService.getTransactions()
    @GetMapping("/me/wallet/transactions")
    public ResponseEntity<Page<PointTransactionResponse>> getMyTransactions(
            @RequestParam(required = false) PointEventType type,
            @RequestParam(required = false) OffsetDateTime from,
            @RequestParam(required = false) OffsetDateTime to,
            Pageable pageable
    ) {
        UUID ownerId = SecurityUtils.getCurrentUserId();
        Page<PointTransactionResponse> transactions =
                walletQueryService.getTransactions(ownerId, type, from, to, pageable);
        return ResponseEntity.ok(transactions);
    }

    // Streams the caller's filtered activity as a downloadable CSV file (owner export only)
    // Linkage: GET /api/v1/me/wallet/transactions.csv -> WalletQueryService.exportTransactionsCsv()
    @GetMapping("/me/wallet/transactions.csv")
    public ResponseEntity<byte[]> exportMyTransactionsCsv(
            @RequestParam(required = false) PointEventType type,
            @RequestParam(required = false) OffsetDateTime from,
            @RequestParam(required = false) OffsetDateTime to
    ) {
        UUID ownerId = SecurityUtils.getCurrentUserId();
        String csv = walletQueryService.exportTransactionsCsv(ownerId, type, from, to);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(new MediaType("text", "csv", StandardCharsets.UTF_8));
        headers.setContentDisposition(ContentDisposition.attachment().filename("point-transactions.csv").build());
        return ResponseEntity.ok().headers(headers).body(csv.getBytes(StandardCharsets.UTF_8));
    }
}
