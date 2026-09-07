package com.skillbridge.shared.error;

import org.springframework.http.HttpStatus;

/**
 * InvalidDisputeResolutionException: Thrown when dispute resolution violates business rules
 * Linkage: Used by AdminDisputeService.validateResolutionRequest()
 * Example: Cannot release to mentor on cancelled session
 */
public class InvalidDisputeResolutionException extends ApiException {
    public InvalidDisputeResolutionException(String message) {
        super(HttpStatus.BAD_REQUEST, "INVALID_DISPUTE_RESOLUTION", message);
    }
}
