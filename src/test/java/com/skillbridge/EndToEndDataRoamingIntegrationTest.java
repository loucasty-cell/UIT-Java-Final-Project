package com.skillbridge;

import com.skillbridge.admin.application.command.AdminAuditService;
import com.skillbridge.admin.application.query.AdminAuditQueryService;
import com.skillbridge.admin.application.query.AdminDashboardQueryService;
import com.skillbridge.auth.api.dto.request.RegisterRequest;
import com.skillbridge.auth.api.dto.response.AuthResponse;
import com.skillbridge.auth.application.command.AuthenticationService;
import com.skillbridge.auth.application.command.RegistrationService;
import com.skillbridge.auth.infrastructure.persistence.UserRepository;
import com.skillbridge.forum.api.dto.request.ForumCommentCreateRequest;
import com.skillbridge.forum.api.dto.request.ForumPostCreateRequest;
import com.skillbridge.forum.api.dto.response.ForumCommentResponse;
import com.skillbridge.forum.api.dto.response.ForumEngagementResponse;
import com.skillbridge.forum.api.dto.response.ForumPostResponse;
import com.skillbridge.forum.application.command.ForumService;
import com.skillbridge.notification.api.dto.response.NotificationResponse;
import com.skillbridge.notification.application.NotificationService;
import com.skillbridge.review.api.dto.request.SubmitReviewRequest;
import com.skillbridge.review.api.dto.response.ReviewResponse;
import com.skillbridge.review.application.ReviewService;
import com.skillbridge.session.api.dto.response.SessionResponse;
import com.skillbridge.session.application.SessionService;
import com.skillbridge.shared.domain.model.Direction;
import com.skillbridge.shared.domain.model.Level;
import com.skillbridge.shared.infrastructure.scheduling.EscrowAutoReleaseScheduler;
import com.skillbridge.shared.infrastructure.scheduling.ProposalExpiryScheduler;
import com.skillbridge.shared.infrastructure.scheduling.RefreshTokenCleanupScheduler;
import com.skillbridge.skill.domain.entity.Skill;
import com.skillbridge.skill.infrastructure.SkillRepository;
import com.skillbridge.support.TestAuthContext;
import com.skillbridge.swap.api.dto.request.CreateSwapProposalRequest;
import com.skillbridge.swap.api.dto.response.SwapRequestResponse;
import com.skillbridge.swap.application.SwapService;
import com.skillbridge.swap.domain.model.SwapRequestStatus;
import com.skillbridge.swap.domain.model.SwapSessionStatus;
import com.skillbridge.user.api.dto.request.UserSkillCreateRequest;
import com.skillbridge.user.api.dto.response.CertificateResponse;
import com.skillbridge.user.api.dto.response.UserSkillResponse;
import com.skillbridge.user.application.command.CertificateService;
import com.skillbridge.user.application.command.UserSkillService;
import com.skillbridge.wallet.application.command.WalletService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("default")
public class EndToEndDataRoamingIntegrationTest {

    // 1. Auth Module Beans
    @Autowired
    private RegistrationService registrationService;

    @Autowired
    private AuthenticationService authenticationService;

    @Autowired
    private UserRepository userRepository;

    // 2. User & Certificate Module Beans
    @Autowired
    private UserSkillService userSkillService;

    @Autowired
    private CertificateService certificateService;

    // 3. Skill Catalog Module Bean
    @Autowired
    private SkillRepository skillRepository;

    // 4. Swap & Session Module Beans
    @Autowired
    private SwapService swapService;

    @Autowired
    private SessionService sessionService;

    // 5. Wallet Module Bean
    @Autowired
    private WalletService walletService;

    // 6. Review Module Bean
    @Autowired
    private ReviewService reviewService;

    // 7. Forum Module Bean
    @Autowired
    private ForumService forumService;

    // 8. Notification Module Bean
    @Autowired
    private NotificationService notificationService;

    // 9. Admin Module Beans
    @Autowired
    private AdminAuditService adminAuditService;

    @Autowired
    private AdminAuditQueryService adminAuditQueryService;

    @Autowired
    private AdminDashboardQueryService adminDashboardQueryService;

    // 10. Background Schedulers
    @Autowired
    private EscrowAutoReleaseScheduler escrowAutoReleaseScheduler;

    @Autowired
    private ProposalExpiryScheduler proposalExpiryScheduler;

    @Autowired
    private RefreshTokenCleanupScheduler refreshTokenCleanupScheduler;

    @AfterEach
    void tearDown() {
        TestAuthContext.logout();
    }

    @Test
    @DisplayName("Verify Spring IoC Dependency Injection across all folder beans")
    void verifyDependencyInjectionAcrossAllFolders() {
        assertNotNull(registrationService, "RegistrationService bean must be injected");
        assertNotNull(authenticationService, "AuthenticationService bean must be injected");
        assertNotNull(userRepository, "UserRepository bean must be injected");
        assertNotNull(userSkillService, "UserSkillService bean must be injected");
        assertNotNull(certificateService, "CertificateService bean must be injected");
        assertNotNull(skillRepository, "SkillRepository bean must be injected");
        assertNotNull(swapService, "SwapService bean must be injected");
        assertNotNull(sessionService, "SessionService bean must be injected");
        assertNotNull(walletService, "WalletService bean must be injected");
        assertNotNull(reviewService, "ReviewService bean must be injected");
        assertNotNull(forumService, "ForumService bean must be injected");
        assertNotNull(notificationService, "NotificationService bean must be injected");
        assertNotNull(adminAuditService, "AdminAuditService bean must be injected");
        assertNotNull(adminAuditQueryService, "AdminAuditQueryService bean must be injected");
        assertNotNull(adminDashboardQueryService, "AdminDashboardQueryService bean must be injected");
        assertNotNull(escrowAutoReleaseScheduler, "EscrowAutoReleaseScheduler bean must be injected");
        assertNotNull(proposalExpiryScheduler, "ProposalExpiryScheduler bean must be injected");
        assertNotNull(refreshTokenCleanupScheduler, "RefreshTokenCleanupScheduler bean must be injected");
    }

    @Test
    @DisplayName("End-to-End Data Roaming: User -> Skills -> Certificate -> Wallet -> Swap -> Double-Confirmation Session -> Review -> Forum -> Notifications")
    void testEndToEndDataRoamingAcrossAllModules() {
        String uniqueSuffix = UUID.randomUUID().toString().substring(0, 8);

        // Step 1: Register Learner and Mentor via Auth Module
        RegisterRequest learnerReq = new RegisterRequest();
        learnerReq.setEmail("learner_" + uniqueSuffix + "@skillbridge.test");
        learnerReq.setPassword("Password123!");
        learnerReq.setFirstName("Learner");
        learnerReq.setLastName(uniqueSuffix);
        AuthResponse learnerAuth = registrationService.register(learnerReq);
        assertNotNull(learnerAuth.getAccessToken());
        UUID learnerId = learnerAuth.getUser().getId();

        RegisterRequest mentorReq = new RegisterRequest();
        mentorReq.setEmail("mentor_" + uniqueSuffix + "@skillbridge.test");
        mentorReq.setPassword("Password123!");
        mentorReq.setFirstName("Mentor");
        mentorReq.setLastName(uniqueSuffix);
        AuthResponse mentorAuth = registrationService.register(mentorReq);
        assertNotNull(mentorAuth.getAccessToken());
        UUID mentorId = mentorAuth.getUser().getId();

        // Step 2: Retrieve or create catalog skills from Database
        List<Skill> existingSkills = skillRepository.findAll();
        Skill javaSkill;
        Skill springSkill;
        if (existingSkills.size() >= 2) {
            javaSkill = existingSkills.get(0);
            springSkill = existingSkills.get(1);
        } else {
            Skill s1 = new Skill();
            s1.setName("Catalog Skill A " + uniqueSuffix);
            s1.setCategory("Programming");
            s1.setDescription("Skill A description");
            javaSkill = skillRepository.save(s1);

            Skill s2 = new Skill();
            s2.setName("Catalog Skill B " + uniqueSuffix);
            s2.setCategory("Framework");
            s2.setDescription("Skill B description");
            springSkill = skillRepository.save(s2);
        }

        // Step 3: Mentor adds Skill to Portfolio via User Skills Module
        TestAuthContext.loginAs(mentorId);
        UserSkillCreateRequest addSkillReq = new UserSkillCreateRequest(
                javaSkill.getId(),
                Direction.TEACH,
                Level.ADVANCED
        );
        UserSkillResponse mentorSkill = userSkillService.createUserSkill(addSkillReq);
        assertEquals(javaSkill.getId(), mentorSkill.getSkill().getId());

        // Step 4: Mentor uploads Certificate via Storage & Certificate Module
        MockMultipartFile certFile = new MockMultipartFile(
                "file",
                "java_cert.pdf",
                "application/pdf",
                "CERTIFICATE DATA CONTENT".getBytes()
        );
        CertificateResponse cert = certificateService.uploadCertificate(javaSkill.getId(), certFile);
        assertEquals("java_cert.pdf", cert.getFileName());

        // Step 5: Learner proposes Skill Swap Session via Swap Module
        TestAuthContext.loginAs(learnerId);
        CreateSwapProposalRequest proposalReq = new CreateSwapProposalRequest();
        proposalReq.setResponderId(mentorId);
        proposalReq.setOfferedSkillId(springSkill.getId());
        proposalReq.setRequestedSkillId(javaSkill.getId());
        proposalReq.setPointCost(0); // Skill barter flow
        proposalReq.setMessage("Let's swap Java for Spring Boot!");

        SwapRequestResponse proposal = swapService.createProposal(proposalReq);
        assertNotNull(proposal.getId());

        // Step 6: Mentor accepts Swap Proposal -> Creates SwapSession
        TestAuthContext.loginAs(mentorId);
        SwapRequestResponse accepted = swapService.acceptProposal(proposal.getId());
        assertEquals(SwapRequestStatus.ACCEPTED, accepted.getStatus());
        UUID sessionId = accepted.getSessionId();
        assertNotNull(sessionId);

        // Step 7: Start Session via Session Module
        SessionResponse started = sessionService.startSession(sessionId);
        assertEquals(SwapSessionStatus.STARTED, started.getStatus());

        // Step 8: Double-Confirmation Completion Flow (Two-party confirm)
        // Party 1 (Mentor) confirms (sets autoReleaseAt)
        SessionResponse firstConfirm = sessionService.completeSession(sessionId);
        assertNotNull(firstConfirm);

        // Party 2 (Learner) confirms (triggers session completion)
        TestAuthContext.loginAs(learnerId);
        SessionResponse completed = sessionService.completeSession(sessionId);
        assertEquals(SwapSessionStatus.COMPLETED, completed.getStatus());

        // Step 9: Review Module - Learner reviews Mentor
        SubmitReviewRequest reviewReq = new SubmitReviewRequest();
        reviewReq.setRevieweeId(mentorId);
        reviewReq.setSkillId(javaSkill.getId());
        reviewReq.setRating(5);
        reviewReq.setFeedback("Outstanding mentor!");
        ReviewResponse review = reviewService.submitReview(sessionId, reviewReq);
        assertEquals(5, review.getRating());

        // Step 10: Forum Module - Learner creates post and Mentor likes & comments
        ForumPostCreateRequest postReq = new ForumPostCreateRequest();
        postReq.setTitle("How to structure Spring Boot 3 modules?");
        postReq.setDescription("Looking for best architecture guidelines for modular Spring Boot with clean boundaries.");
        postReq.setSkillIds(List.of(javaSkill.getId()));
        ForumPostResponse post = forumService.createPost(postReq);
        assertNotNull(post.getId());

        TestAuthContext.loginAs(mentorId);
        ForumEngagementResponse liked = forumService.likePost(post.getId());
        assertTrue(liked.getLikedByMe());

        ForumCommentCreateRequest commentReq = new ForumCommentCreateRequest();
        commentReq.setBody("Modular monolith with clean domain boundaries works best.");
        ForumCommentResponse comment = forumService.addComment(post.getId(), commentReq);
        assertNotNull(comment.getId());

        // Step 11: Notification Module - Query notifications & mark read
        List<NotificationResponse> mentorNotifications = notificationService.getUserNotifications();
        assertNotNull(mentorNotifications);
        notificationService.markAllAsRead();
        assertEquals(0, notificationService.getUnreadCount());

        // Step 12: Admin Audit & Schedulers Execution
        adminAuditService.logEvent(
                mentorId,
                "TEST_ROAMING",
                "SESSION",
                sessionId,
                "Started",
                "Completed",
                "E2E Data Roaming Verification",
                UUID.randomUUID().toString()
        );

        // Verify background schedulers run safely without exception
        assertDoesNotThrow(() -> escrowAutoReleaseScheduler.processAutoReleases());
        assertDoesNotThrow(() -> proposalExpiryScheduler.processExpiredProposals());
        assertDoesNotThrow(() -> refreshTokenCleanupScheduler.cleanupExpiredTokens());
    }
}
