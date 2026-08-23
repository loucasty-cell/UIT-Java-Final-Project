package com.skillbridge.session.api.controller;

import com.skillbridge.session.api.dto.request.UpdateSessionRequest;
import com.skillbridge.session.api.dto.response.SessionResponse;
import com.skillbridge.session.application.SessionService;
import com.skillbridge.swap.domain.model.SwapSessionStatus;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class SessionControllerTest {

    @Test
    void exposesSessionEndpoints() {
        RecordingSessionService service = new RecordingSessionService();
        SessionController controller = new SessionController(service);
        UUID sessionId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UpdateSessionRequest update = new UpdateSessionRequest();

        assertEquals(1, controller.getActiveSwapSessions(userId).getBody().size());
        assertEquals(userId, service.activeUserId);
        assertEquals(SwapSessionStatus.STARTED, controller.startSession(sessionId).getBody().getStatus());
        assertEquals(sessionId, service.startedId);
        assertEquals(SwapSessionStatus.COMPLETED, controller.completeSession(sessionId).getBody().getStatus());
        assertEquals(sessionId, service.completedId);
        assertEquals(SwapSessionStatus.ACCEPTED, controller.updateSession(sessionId, update).getBody().getStatus());
        assertEquals(update, service.updateRequest);
    }

    private static class RecordingSessionService extends SessionService {
        private UUID activeUserId;
        private UUID startedId;
        private UUID completedId;
        private UpdateSessionRequest updateRequest;

        RecordingSessionService() {
            super(null, null, null, null);
        }

        @Override
        public List<SessionResponse> getActiveSwapSessions(UUID userId) {
            this.activeUserId = userId;
            return List.of(response(SwapSessionStatus.ACCEPTED));
        }

        @Override
        public SessionResponse startSession(UUID sessionId) {
            this.startedId = sessionId;
            return response(SwapSessionStatus.STARTED);
        }

        @Override
        public SessionResponse completeSession(UUID sessionId) {
            this.completedId = sessionId;
            return response(SwapSessionStatus.COMPLETED);
        }

        @Override
        public SessionResponse updateSession(UUID sessionId, UpdateSessionRequest request) {
            this.updateRequest = request;
            return response(SwapSessionStatus.ACCEPTED);
        }

        private SessionResponse response(SwapSessionStatus status) {
            SessionResponse response = new SessionResponse();
            response.setId(UUID.randomUUID());
            response.setStatus(status);
            return response;
        }
    }
}
