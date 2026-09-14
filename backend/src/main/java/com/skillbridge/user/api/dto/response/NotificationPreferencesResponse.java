package com.skillbridge.user.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

/** Safe preference projection used by the Settings page. */
@Getter
@AllArgsConstructor
public class NotificationPreferencesResponse {
    private final Boolean sessionRemindersEnabled;
    private final Boolean sessionRequestNotificationsEnabled;
    private final Boolean messageAlertsEnabled;
}
