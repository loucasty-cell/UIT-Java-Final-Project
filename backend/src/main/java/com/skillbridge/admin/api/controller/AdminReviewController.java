package com.skillbridge.admin.api.controller;

import com.skillbridge.admin.api.dto.response.AdminReviewResponse;
import com.skillbridge.admin.application.command.AdminReviewService;
import com.skillbridge.shared.api.dto.response.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/reviews")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ADMIN') or hasAuthority('ROLE_ADMIN')")
public class AdminReviewController {
    private final AdminReviewService adminReviewService;

    @GetMapping
    public ResponseEntity<PageResponse<AdminReviewResponse>> listNeedsAttention(
            @PageableDefault(size = 50) Pageable pageable
    ) {
        return ResponseEntity.ok(adminReviewService.listNeedsAttention(pageable));
    }
}
