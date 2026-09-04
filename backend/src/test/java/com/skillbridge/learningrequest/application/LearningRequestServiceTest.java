package com.skillbridge.learningrequest.application;

import com.skillbridge.auth.domain.entity.User;
import com.skillbridge.auth.infrastructure.persistence.UserRepository;
import com.skillbridge.learningrequest.api.dto.request.CreateLearningRequest;
import com.skillbridge.learningrequest.api.dto.request.RejectLearningRequest;
import com.skillbridge.learningrequest.api.dto.response.LearningRequestResponse;
import com.skillbridge.learningrequest.api.mapper.LearningRequestMapper;
import com.skillbridge.learningrequest.application.command.LearningRequestService;
import com.skillbridge.learningrequest.application.query.ScheduleConflictService;
import com.skillbridge.learningrequest.domain.entity.LearningRequest;
import com.skillbridge.learningrequest.domain.model.LearningRequestStatus;
import com.skillbridge.learningrequest.infrastructure.persistence.LearningRequestRepository;
import com.skillbridge.mentor.domain.entity.MentorOffering;
import com.skillbridge.mentor.infrastructure.persistence.MentorOfferingRepository;
import com.skillbridge.notification.application.NotificationService;
import com.skillbridge.shared.domain.model.SessionMode;
import com.skillbridge.shared.error.ScheduleConflictException;
import com.skillbridge.skill.domain.entity.Skill;
import com.skillbridge.skill.infrastructure.SkillRepository;
import com.skillbridge.support.TestAuthContext;
import com.skillbridge.swap.domain.entity.SwapRequest;
import com.skillbridge.swap.domain.entity.SwapSession;
import com.skillbridge.swap.infrastructure.persistence.SwapRequestRepository;
import com.skillbridge.swap.infrastructure.persistence.SwapSessionRepository;
import com.skillbridge.user.domain.entity.UserSkill;
import com.skillbridge.user.infrastructure.persistence.UserSkillRepository;
import com.skillbridge.wallet.application.command.WalletService;
import com.skillbridge.wallet.domain.entity.Wallet;
import com.skillbridge.wallet.infrastructure.persistence.WalletRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

public class LearningRequestServiceTest {

    private LearningRequestRepository learningRequestRepository;
    private ScheduleConflictService scheduleConflictService;
    private SwapSessionRepository swapSessionRepository;
    private SwapRequestRepository swapRequestRepository;
    private UserRepository userRepository;
    private SkillRepository skillRepository;
    private MentorOfferingRepository mentorOfferingRepository;
    private UserSkillRepository userSkillRepository;
    private WalletService walletService;
    private WalletRepository walletRepository;
    private NotificationService notificationService;
    private LearningRequestMapper learningRequestMapper;

    private LearningRequestService service;

    private final UUID learnerId = UUID.randomUUID();
    private final UUID mentorId = UUID.randomUUID();
    private final UUID skillId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        learningRequestRepository = Mockito.mock(LearningRequestRepository.class);
        scheduleConflictService = Mockito.mock(ScheduleConflictService.class);
        swapSessionRepository = Mockito.mock(SwapSessionRepository.class);
        swapRequestRepository = Mockito.mock(SwapRequestRepository.class);
        userRepository = Mockito.mock(UserRepository.class);
        skillRepository = Mockito.mock(SkillRepository.class);
        mentorOfferingRepository = Mockito.mock(MentorOfferingRepository.class);
        userSkillRepository = Mockito.mock(UserSkillRepository.class);
        walletService = Mockito.mock(WalletService.class);
        walletRepository = Mockito.mock(WalletRepository.class);
        notificationService = Mockito.mock(NotificationService.class);
        learningRequestMapper = new LearningRequestMapper();

        service = new LearningRequestService(
                learningRequestRepository,
                scheduleConflictService,
                swapSessionRepository,
                swapRequestRepository,
                userRepository,
                skillRepository,
                mentorOfferingRepository,
                userSkillRepository,
                walletService,
                walletRepository,
                notificationService,
                learningRequestMapper,
                Mockito.mock(com.skillbridge.forum.infrastructure.persistence.ForumPostRepository.class)
        );

        TestAuthContext.loginAs(learnerId);
    }

    @AfterEach
    void tearDown() {
        TestAuthContext.logout();
    }

    @Test
    void createsPointsRequestAndHoldsEscrow() {
        CreateLearningRequest request = new CreateLearningRequest();
        request.setMentorId(mentorId);
        request.setRequestedSkillId(skillId);
        request.setMode(SessionMode.POINTS);
        request.setScheduledStart(OffsetDateTime.now().plusDays(1));
        request.setDurationMinutes(60);
        request.setMessage("Let's do Java concurrency");

        User learner = new User();
        learner.setId(learnerId);
        learner.setFirstName("Learner");
        learner.setLastName("One");

        User mentor = new User();
        mentor.setId(mentorId);
        mentor.setFirstName("Mentor");
        mentor.setLastName("Two");

        Skill skill = Skill.builder().id(skillId).name("Java").category("Tech").build();

        Wallet wallet = new Wallet();
        wallet.setUserId(learnerId);
        wallet.setAvailablePoints(50);

        when(userRepository.findById(learnerId)).thenReturn(Optional.of(learner));
        when(userRepository.findById(mentorId)).thenReturn(Optional.of(mentor));
        when(skillRepository.findById(skillId)).thenReturn(Optional.of(skill));
        doNothing().when(scheduleConflictService).validateNoConflict(any(), any(), anyInt());
        when(walletRepository.findByUserId(learnerId)).thenReturn(Optional.of(wallet));
        when(walletService.ensureWallet(learnerId)).thenReturn(wallet);
        when(learningRequestRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        LearningRequestResponse response = service.createLearningRequest(request);

        assertNotNull(response);
        assertEquals(SessionMode.POINTS, response.getMode());
        assertEquals(10, response.getPointCost());
        verify(walletService).holdPoints(eq(learnerId), eq(mentorId), eq(10), eq("LEARNING_REQUEST"), any(), any());
    }

    @Test
    void throwsConflictExceptionWhenScheduleOverlaps() {
        CreateLearningRequest request = new CreateLearningRequest();
        request.setMentorId(mentorId);
        request.setRequestedSkillId(skillId);
        request.setMode(SessionMode.VOLUNTEER);
        request.setScheduledStart(OffsetDateTime.now().plusDays(1));
        request.setDurationMinutes(60);

        User learner = new User();
        learner.setId(learnerId);
        User mentor = new User();
        mentor.setId(mentorId);
        Skill skill = Skill.builder().id(skillId).name("Java").build();

        when(userRepository.findById(learnerId)).thenReturn(Optional.of(learner));
        when(userRepository.findById(mentorId)).thenReturn(Optional.of(mentor));
        when(skillRepository.findById(skillId)).thenReturn(Optional.of(skill));
        doThrow(new ScheduleConflictException("Conflict detected", UUID.randomUUID(), OffsetDateTime.now(), OffsetDateTime.now().plusHours(1)))
                .when(scheduleConflictService).validateNoConflict(eq(mentorId), any(), anyInt());

        assertThrows(ScheduleConflictException.class, () -> service.createLearningRequest(request));
    }

    @Test
    void mentorAcceptsRequestCreatesScheduledSession() {
        TestAuthContext.loginAs(mentorId);

        UUID requestId = UUID.randomUUID();
        LearningRequest lr = new LearningRequest();
        lr.setId(requestId);
        lr.setLearnerId(learnerId);
        lr.setMentorId(mentorId);
        lr.setRequestedSkillId(skillId);
        lr.setMode(SessionMode.POINTS);
        lr.setPointCost(10);
        lr.setScheduledStart(OffsetDateTime.now().plusDays(2));
        lr.setDurationMinutes(60);
        lr.setStatus(LearningRequestStatus.PENDING);

        when(learningRequestRepository.findById(requestId)).thenReturn(Optional.of(lr));
        when(swapRequestRepository.save(any())).thenAnswer(invocation -> {
            SwapRequest sr = invocation.getArgument(0);
            sr.setId(UUID.randomUUID());
            return sr;
        });
        when(swapSessionRepository.save(any())).thenAnswer(invocation -> {
            SwapSession ss = invocation.getArgument(0);
            ss.setId(UUID.randomUUID());
            return ss;
        });
        when(learningRequestRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        LearningRequestResponse response = service.acceptLearningRequest(requestId);

        assertEquals(LearningRequestStatus.ACCEPTED, response.getStatus());
        assertNotNull(response.getSessionId());
    }

    @Test
    void rejectsPendingRequestAndRefundsHeldPoints() {
        TestAuthContext.loginAs(mentorId);

        UUID requestId = UUID.randomUUID();
        LearningRequest lr = new LearningRequest();
        lr.setId(requestId);
        lr.setLearnerId(learnerId);
        lr.setMentorId(mentorId);
        lr.setRequestedSkillId(skillId);
        lr.setMode(SessionMode.POINTS);
        lr.setPointCost(10);
        lr.setPointsHeld(true);
        lr.setStatus(LearningRequestStatus.PENDING);

        when(learningRequestRepository.findById(requestId)).thenReturn(Optional.of(lr));
        when(learningRequestRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        RejectLearningRequest rejectRequest = new RejectLearningRequest();
        rejectRequest.setReason("Unavailable this week");

        LearningRequestResponse response = service.rejectLearningRequest(requestId, rejectRequest);

        assertEquals(LearningRequestStatus.REJECTED, response.getStatus());
        verify(walletService).refundHeldPoints(eq(learnerId), eq("LEARNING_REQUEST"), eq(requestId), any());
    }
}
