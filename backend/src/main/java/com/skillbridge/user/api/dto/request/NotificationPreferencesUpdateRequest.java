package com.skillbridge.user.api.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/** Complete set of in-app notification preferences for the authenticated user. */
@Data
public class NotificationPreferencesUpdateRequest {

    @NotNull(message = "Session reminder preference is required")
    private Boolean sessionRemindersEnabled;

    @NotNull(message = "Session request preference is required")
    private Boolean sessionRequestNotificationsEnabled;

    @NotNull(message = "Message alert preference is required")
    private Boolean messageAlertsEnabled;
}
