package com.skillbridge.review.api.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

@Data
public class SubmitReviewRequest {

    @NotNull
    private UUID reviewerId;

    @NotNull
    private UUID revieweeId;

    @NotNull
    private UUID skillId;

    @NotNull
    @Min(1)
    @Max(5)
    private Integer rating;

    @Size(max = 1000)
    private String feedback;
}
