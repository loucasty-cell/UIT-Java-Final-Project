package com.skillbridge.swap.api.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateSwapProposalRequest {

    @NotNull
    private UUID responderId;

    @NotNull
    private UUID offeredSkillId;

    @NotNull
    private UUID requestedSkillId;

    @Min(0)
    private Integer pointCost = 0;

    @Size(max = 1000)
    private String message;
}
