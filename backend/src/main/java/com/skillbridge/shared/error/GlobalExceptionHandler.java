package com.skillbridge.shared.error;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.net.URI;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

// GlobalExceptionHandler: Centralized REST exception handling following RFC 9457 ProblemDetail
// Linkage: Intercepts exceptions thrown by all Controllers, Services, and Security filters
@RestControllerAdvice
public class GlobalExceptionHandler {

    public record ApiErrorResponse(ErrorDetail error) {}
    public record ErrorDetail(String code, String message, Map<String, String> fieldErrors, String requestId, String timestamp) {}

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // Handles validation errors triggered by @Valid / @Validated on Request DTOs
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidationException(MethodArgumentNotValidException ex) {
        String requestId = UUID.randomUUID().toString();
        String timestamp = OffsetDateTime.now().toString();

        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }

        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                "One or more fields failed validation."
        );
        problemDetail.setType(URI.create("https://skillbridge.edu/errors/validation-failed"));
        problemDetail.setTitle("Validation Failed");
        problemDetail.setProperty("code", "VALIDATION_FAILED");
        problemDetail.setProperty("timestamp", timestamp);
        problemDetail.setProperty("requestId", requestId);
        problemDetail.setProperty("fieldErrors", fieldErrors);
        problemDetail.setProperty("error", new ErrorDetail("VALIDATION_FAILED", "One or more fields failed validation.", fieldErrors, requestId, timestamp));
        return problemDetail;
    }

    // Handles custom domain ApiException (e.g. INSUFFICIENT_POINTS, SCHEDULE_CONFLICT, TOKEN_EXPIRED)
    @ExceptionHandler(ApiException.class)
    public ProblemDetail handleApiException(ApiException ex) {
        String requestId = UUID.randomUUID().toString();
        String timestamp = OffsetDateTime.now().toString();

        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                ex.getStatus(),
                ex.getMessage()
        );
        problemDetail.setType(URI.create("https://skillbridge.edu/errors/" + ex.getCode().toLowerCase()));
        problemDetail.setTitle(ex.getCode());
        problemDetail.setProperty("code", ex.getCode());
        problemDetail.setProperty("timestamp", timestamp);
        problemDetail.setProperty("requestId", requestId);
        problemDetail.setProperty("error", new ErrorDetail(ex.getCode(), ex.getMessage(), null, requestId, timestamp));
        return problemDetail;
    }

    // Handles authentication failures such as invalid password or non-existent user
    @ExceptionHandler(BadCredentialsException.class)
    public ProblemDetail handleBadCredentialsException(BadCredentialsException ex) {
        String requestId = UUID.randomUUID().toString();
        String timestamp = OffsetDateTime.now().toString();

        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.UNAUTHORIZED,
                ex.getMessage()
        );
        problemDetail.setType(URI.create("https://skillbridge.edu/errors/unauthenticated"));
        problemDetail.setTitle("Authentication Failed");
        problemDetail.setProperty("code", "UNAUTHENTICATED");
        problemDetail.setProperty("timestamp", timestamp);
        problemDetail.setProperty("requestId", requestId);
        problemDetail.setProperty("error", new ErrorDetail("UNAUTHENTICATED", ex.getMessage(), null, requestId, timestamp));
        return problemDetail;
    }

    // Handles authorization and permission violations
    @ExceptionHandler(AccessDeniedException.class)
    public ProblemDetail handleAccessDeniedException(AccessDeniedException ex) {
        String requestId = UUID.randomUUID().toString();
        String timestamp = OffsetDateTime.now().toString();

        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.FORBIDDEN,
                ex.getMessage()
        );
        problemDetail.setType(URI.create("https://skillbridge.edu/errors/forbidden"));
        problemDetail.setTitle("Access Denied");
        problemDetail.setProperty("code", "FORBIDDEN");
        problemDetail.setProperty("timestamp", timestamp);
        problemDetail.setProperty("requestId", requestId);
        problemDetail.setProperty("error", new ErrorDetail("FORBIDDEN", ex.getMessage(), null, requestId, timestamp));
        return problemDetail;
    }

    // Handles schedule time overlap conflicts (status 409 Conflict)
    @ExceptionHandler(ScheduleConflictException.class)
    public ProblemDetail handleScheduleConflictException(ScheduleConflictException ex) {
        String requestId = UUID.randomUUID().toString();
        String timestamp = OffsetDateTime.now().toString();

        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.CONFLICT,
                ex.getMessage()
        );
        problemDetail.setType(URI.create("https://skillbridge.edu/errors/schedule-conflict"));
        problemDetail.setTitle("Schedule Conflict");
        problemDetail.setProperty("code", "SCHEDULE_CONFLICT");
        problemDetail.setProperty("timestamp", timestamp);
        problemDetail.setProperty("requestId", requestId);
        if (ex.getConflictingSessionId() != null) {
            problemDetail.setProperty("conflictingSessionId", ex.getConflictingSessionId().toString());
            problemDetail.setProperty("scheduledStart", ex.getScheduledStart() != null ? ex.getScheduledStart().toString() : null);
            problemDetail.setProperty("scheduledEnd", ex.getScheduledEnd() != null ? ex.getScheduledEnd().toString() : null);
        }
        problemDetail.setProperty("error", new ErrorDetail("SCHEDULE_CONFLICT", ex.getMessage(), null, requestId, timestamp));
        return problemDetail;
    }

    // Handles invalid domain operations and contract argument constraints
    @ExceptionHandler({IllegalArgumentException.class, IllegalStateException.class})
    public ProblemDetail handleIllegalArgumentException(RuntimeException ex) {
        String requestId = UUID.randomUUID().toString();
        String timestamp = OffsetDateTime.now().toString();

        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                ex.getMessage()
        );
        problemDetail.setType(URI.create("https://skillbridge.edu/errors/bad-request"));
        problemDetail.setTitle("Bad Request");
        problemDetail.setProperty("code", "INVALID_ARGUMENT");
        problemDetail.setProperty("timestamp", timestamp);
        problemDetail.setProperty("requestId", requestId);
        problemDetail.setProperty("error", new ErrorDetail("INVALID_ARGUMENT", ex.getMessage(), null, requestId, timestamp));
        return problemDetail;
    }

    // Fallback handler for unhandled server exceptions
    @ExceptionHandler(Exception.class)
    public ProblemDetail handleGenericException(Exception ex) {
        String requestId = UUID.randomUUID().toString();
        String timestamp = OffsetDateTime.now().toString();
        log.error("Unhandled internal error [requestId={}]", requestId, ex);

        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected internal error occurred."
        );
        problemDetail.setType(URI.create("https://skillbridge.edu/errors/internal-error"));
        problemDetail.setTitle("Internal Server Error");
        problemDetail.setProperty("code", "INTERNAL_ERROR");
        problemDetail.setProperty("timestamp", timestamp);
        problemDetail.setProperty("requestId", requestId);
        problemDetail.setProperty("error", new ErrorDetail("INTERNAL_ERROR", "An unexpected internal error occurred.", null, requestId, timestamp));
        return problemDetail;
    }
}