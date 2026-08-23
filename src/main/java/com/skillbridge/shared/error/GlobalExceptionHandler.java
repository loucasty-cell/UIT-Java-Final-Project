package com.skillbridge.shared.error;

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

    // Handles validation errors triggered by @Valid / @Validated on Request DTOs
    // Linkage: Maps field-level validation constraints to structured RFC 9457 problem details
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidationException(MethodArgumentNotValidException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                "One or more fields failed validation."
        );
        problemDetail.setType(URI.create("https://skillbridge.edu/errors/validation-failed"));
        problemDetail.setTitle("Validation Failed");
        problemDetail.setProperty("code", "VALIDATION_FAILED");
        problemDetail.setProperty("timestamp", OffsetDateTime.now().toString());
        problemDetail.setProperty("requestId", UUID.randomUUID().toString());

        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }
        problemDetail.setProperty("fieldErrors", fieldErrors);
        return problemDetail;
    }

    // Handles authentication failures such as invalid password or non-existent user
    // Linkage: Thrown by AuthenticationService during login check
    @ExceptionHandler(BadCredentialsException.class)
    public ProblemDetail handleBadCredentialsException(BadCredentialsException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.UNAUTHORIZED,
                ex.getMessage()
        );
        problemDetail.setType(URI.create("https://skillbridge.edu/errors/unauthenticated"));
        problemDetail.setTitle("Authentication Failed");
        problemDetail.setProperty("code", "UNAUTHENTICATED");
        problemDetail.setProperty("timestamp", OffsetDateTime.now().toString());
        problemDetail.setProperty("requestId", UUID.randomUUID().toString());
        return problemDetail;
    }

    // Handles authorization and permission violations
    // Linkage: Thrown by @PreAuthorize on Controllers or SecurityUtils / domain services
    @ExceptionHandler(AccessDeniedException.class)
    public ProblemDetail handleAccessDeniedException(AccessDeniedException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.FORBIDDEN,
                ex.getMessage()
        );
        problemDetail.setType(URI.create("https://skillbridge.edu/errors/forbidden"));
        problemDetail.setTitle("Access Denied");
        problemDetail.setProperty("code", "FORBIDDEN");
        problemDetail.setProperty("timestamp", OffsetDateTime.now().toString());
        problemDetail.setProperty("requestId", UUID.randomUUID().toString());
        return problemDetail;
    }

    // Handles invalid domain operations and contract argument constraints
    // Linkage: Thrown by command services when business invariant checks fail
    @ExceptionHandler({IllegalArgumentException.class, IllegalStateException.class})
    public ProblemDetail handleIllegalArgumentException(RuntimeException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                ex.getMessage()
        );
        problemDetail.setType(URI.create("https://skillbridge.edu/errors/bad-request"));
        problemDetail.setTitle("Bad Request");
        problemDetail.setProperty("code", "INVALID_ARGUMENT");
        problemDetail.setProperty("timestamp", OffsetDateTime.now().toString());
        problemDetail.setProperty("requestId", UUID.randomUUID().toString());
        return problemDetail;
    }

    // Fallback handler for unhandled server exceptions
    // Linkage: Prevents leaking internal stack traces to clients while returning standardized error format
    @ExceptionHandler(Exception.class)
    public ProblemDetail handleGenericException(Exception ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected internal error occurred."
        );
        problemDetail.setType(URI.create("https://skillbridge.edu/errors/internal-error"));
        problemDetail.setTitle("Internal Server Error");
        problemDetail.setProperty("code", "INTERNAL_ERROR");
        problemDetail.setProperty("timestamp", OffsetDateTime.now().toString());
        problemDetail.setProperty("requestId", UUID.randomUUID().toString());
        return problemDetail;
    }
}