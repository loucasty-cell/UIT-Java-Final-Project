package com.skillbridge.admin.application.query;

import com.skillbridge.admin.api.dto.response.DisputeResponse;
import com.skillbridge.admin.api.mapper.AdminMapper;
import com.skillbridge.admin.domain.entity.Dispute;
import com.skillbridge.admin.domain.model.DisputeStatus;
import com.skillbridge.admin.infrastructure.persistence.DisputeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class AdminDisputeQueryService {

    private final DisputeRepository disputeRepository;
    private final AdminMapper adminMapper;

    public Page<DisputeResponse> getDisputes(DisputeStatus status, Pageable pageable) {
        Page<Dispute> disputes;
        if (status != null) {
            disputes = disputeRepository.findByStatus(status, pageable);
        } else {
            disputes = disputeRepository.findAll(pageable);
        }

        return disputes.map(adminMapper::toResponse);
    }
}
