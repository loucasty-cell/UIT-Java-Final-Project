package com.skillbridge.mentorapplication.application;

import com.skillbridge.auth.domain.entity.User;
import com.skillbridge.auth.domain.entity.UserRole;
import com.skillbridge.auth.domain.model.Role;
import com.skillbridge.auth.infrastructure.persistence.UserRepository;
import com.skillbridge.auth.infrastructure.persistence.UserRoleRepository;
import com.skillbridge.mentorapplication.api.dto.request.RejectMentorApplicationRequest;
import com.skillbridge.mentorapplication.api.dto.request.SubmitMentorApplicationRequest;
import com.skillbridge.mentorapplication.api.dto.response.MentorApplicationResponse;
import com.skillbridge.mentorapplication.domain.entity.MentorApplication;
import com.skillbridge.mentorapplication.domain.model.MentorApplicationStatus;
import com.skillbridge.mentorapplication.infrastructure.persistence.MentorApplicationRepository;
import com.skillbridge.mentorapplication.infrastructure.persistence.MentorApplicationSkillRepository;
import com.skillbridge.notification.application.NotificationService;
import com.skillbridge.skill.infrastructure.SkillRepository;
import com.skillbridge.support.TestAuthContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

public class MentorApplicationServiceTest {

    private MentorApplicationRepository applicationRepository;
    private MentorApplicationSkillRepository applicationSkillRepository;
    private UserRepository userRepository;
    private UserRoleRepository userRoleRepository;
    private SkillRepository skillRepository;
    private NotificationService notificationService;
    private MentorApplicationService service;

    private final UUID applicantId = UUID.randomUUID();
    private final UUID adminId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        applicationRepository = Mockito.mock(MentorApplicationRepository.class);
        applicationSkillRepository = Mockito.mock(MentorApplicationSkillRepository.class);
        userRepository = Mockito.mock(UserRepository.class);
        userRoleRepository = Mockito.mock(UserRoleRepository.class);
        skillRepository = Mockito.mock(SkillRepository.class);
        notificationService = Mockito.mock(NotificationService.class);

        service = new MentorApplicationService(
                applicationRepository,
                applicationSkillRepository,
                userRepository,
                userRoleRepository,
                skillRepository,
                notificationService
        );

        TestAuthContext.loginAs(applicantId);
    }

    @AfterEach
    void tearDown() {
        TestAuthContext.logout();
    }

    @Test
    void submitsApplicationSuccessfully() {
        SubmitMentorApplicationRequest request = new SubmitMentorApplicationRequest();
        request.setExperience("4 years building distributed systems");
        request.setMotivation("Excited to mentor");
        request.setTeachSkillIds(List.of(UUID.randomUUID()));

        User user = new User();
        user.setId(applicantId);
        user.setFirstName("Alice");

        when(userRepository.findById(applicantId)).thenReturn(Optional.of(user));
        when(applicationRepository.findTopByUserIdOrderByCreatedAtDesc(applicantId))
                .thenReturn(Optional.empty());
        when(applicationRepository.save(any())).thenAnswer(invocation -> {
            MentorApplication app = invocation.getArgument(0);
            app.setId(UUID.randomUUID());
            return app;
        });

        MentorApplicationResponse response = service.submitApplication(request);

        assertNotNull(response);
        assertEquals(MentorApplicationStatus.PENDING, response.getStatus());
        assertEquals("4 years building distributed systems", response.getExperience());
    }

    @Test
    void adminApprovesApplicationAndGrantsMentorRole() {
        TestAuthContext.loginAs(adminId);

        UUID applicationId = UUID.randomUUID();
        MentorApplication app = new MentorApplication();
        app.setId(applicationId);
        app.setUserId(applicantId);
        app.setStatus(MentorApplicationStatus.PENDING);

        when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(app));
        when(applicationRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(userRoleRepository.existsById(any())).thenReturn(false);

        MentorApplicationResponse response = service.approveApplication(applicationId);

        assertEquals(MentorApplicationStatus.APPROVED, response.getStatus());
        verify(userRoleRepository).save(any(UserRole.class));
    }

    @Test
    void adminRejectsApplicationWithReason() {
        TestAuthContext.loginAs(adminId);

        UUID applicationId = UUID.randomUUID();
        MentorApplication app = new MentorApplication();
        app.setId(applicationId);
        app.setUserId(applicantId);
        app.setStatus(MentorApplicationStatus.PENDING);

        when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(app));
        when(applicationRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        RejectMentorApplicationRequest rejectReq = new RejectMentorApplicationRequest();
        rejectReq.setAdminNotes("Need more teaching evidence");

        MentorApplicationResponse response = service.rejectApplication(applicationId, rejectReq);

        assertEquals(MentorApplicationStatus.REJECTED, response.getStatus());
        assertEquals("Need more teaching evidence", response.getAdminNotes());
    }
}
