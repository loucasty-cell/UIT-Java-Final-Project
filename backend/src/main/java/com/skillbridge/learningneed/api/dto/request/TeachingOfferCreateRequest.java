package com.skillbridge.learningneed.api.dto.request;

import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import com.skillbridge.shared.domain.model.SessionMode;
import lombok.Data;

import java.time.OffsetDateTime;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class TeachingOfferCreateRequest {
    @NotNull
    private SessionMode mode;

    @NotNull
    @Future
    private OffsetDateTime proposedStart;

    private LocalDate availabilityDate;

    private LocalTime availabilityTime;

    @Size(max = 2000)
    private String message;
}
