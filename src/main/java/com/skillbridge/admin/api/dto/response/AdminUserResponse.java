package com.skillbridge.admin.api.dto.response;

import com.skillbridge.admin.domain.model.AccountStatus;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class AdminUserResponse {
    private UUID id;
    private String email;
    private String firstName;
    private String lastName;
    private AccountStatus status;
    private List<String> roles;
    private String major;
    private Integer yearOfStudy;
    private Long warningCount;
    private Long reportCount;
    private Long completedSessionCount;
    private Integer availablePoints;
    private Integer heldPoints;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private Long version;
}
