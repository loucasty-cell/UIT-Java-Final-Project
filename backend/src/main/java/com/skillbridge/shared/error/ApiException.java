package com.skillbridge.shared.error;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class ApiException extends RuntimeException {
    private final HttpStatus status;
    private final String code;

    public ApiException(HttpStatus status, String code, String message) {
        super(message);
        this.status = status;
        this.code = code;
    }

    public static ApiException conflict(String code, String message) {
        return new ApiException(HttpStatus.CONFLICT, code, message);
    }

    public static ApiException insufficientPoints(String message) {
        return new ApiException(HttpStatus.CONFLICT, "INSUFFICIENT_POINTS", message);
    }

    public static ApiException scheduleConflict(String message) {
        return new ApiException(HttpStatus.CONFLICT, "SCHEDULE_CONFLICT", message);
    }

    public static ApiException idempotencyConflict(String message) {
        return new ApiException(HttpStatus.CONFLICT, "IDEMPOTENCY_CONFLICT", message);
    }

    public static ApiException skillSwapNotMatched(String message) {
        return new ApiException(HttpStatus.CONFLICT, "SKILL_SWAP_NOT_MATCHED", message);
    }

    public static ApiException tokenExpired(String message) {
        return new ApiException(HttpStatus.UNAUTHORIZED, "TOKEN_EXPIRED", message);
    }

    public static ApiException notFound(String message) {
        return new ApiException(HttpStatus.NOT_FOUND, "RESOURCE_NOT_FOUND", message);
    }
}
