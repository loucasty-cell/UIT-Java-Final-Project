/**
 * SkillBridge Backend API Types & DTOs
 * Base URL: http://localhost:9095
 */

// ==========================================
// 1. Common & Pagination Models
// ==========================================

export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
}

// ==========================================
// 2. Authentication & User Profile
// ==========================================

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  major?: string;
  yearOfStudy?: number;
  referralCode?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  roles: string[];
  status: "ACTIVE" | "WARNED" | "SUSPENDED" | "DISABLED" | string;
}

export interface AuthResponse {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  user: AuthUser;
}

export interface UserProfileResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  bio?: string;
  major?: string;
  yearOfStudy?: number;
  timezone?: string;
  avatarObjectKey?: string;
  status: string;
  roles?: string[];
  accountStatus?: string;
}

export interface UpdateUserProfileRequest {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  bio?: string;
  major?: string;
  yearOfStudy?: number;
  timezone?: string;
}

export interface PublicUserProfileResponse {
  id: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  major?: string;
  yearOfStudy?: number;
  avatarObjectKey?: string;
  averageRating?: number;
  reviewCount?: number;
}

export interface PublicUserSkillResponse {
  id: string;
  skillId: string;
  skillName: string;
  category: string;
  direction: SkillDirection;
  level: SkillLevel;
}

// ==========================================
// 3. User Skills & Certificates
// ==========================================

export type SkillDirection = "TEACH" | "LEARN";
export type SkillLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export interface GlobalCatalogSkill {
  id: string;
  name: string;
  category: string;
  description?: string;
}

export interface UserSkillResponse {
  id: string;
  skill: GlobalCatalogSkill;
  direction: SkillDirection;
  level: SkillLevel;
  createdAt: string;
  updatedAt: string;
}

export interface AddUserSkillRequest {
  skillId: string;
  direction: SkillDirection;
  level: SkillLevel;
}

export interface UpdateUserSkillRequest {
  level: SkillLevel;
}

export interface SkillCertificateResponse {
  id: string;
  skill: GlobalCatalogSkill;
  fileName: string;
  fileSize: number;
  contentType: string;
  createdAt: string;
}

// ==========================================
// 4. Mentors & Offerings
// ==========================================

export interface MentorSearchFilters {
  skillId?: string;
  search?: string;
  minRating?: number;
}

export interface MentorSearchResponse {
  user: {
    id: string;
    displayName: string;
    major?: string;
    yearOfStudy?: number;
    avatarUrl?: string;
  };
  rating: number;
  ratingCount: number;
  activeModes: ("POINTS" | "SKILL_SWAP" | "VOLUNTEER")[];
  matchingTeachSkills: GlobalCatalogSkill[];
  wantedSkills: GlobalCatalogSkill[];
  minimumPointCost: number;
}

export interface MentorDetailResponse {
  activeOfferings?: MentorOfferingResponse[];
  id: string;
  userId: string;
  mentorId: string;
  name: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  major?: string;
  yearOfStudy?: number;
  averageRating: number;
  reviewCount: number;
  skills: GlobalCatalogSkill[];
  hourlyRatePoints: number;
  availableOfferings?: MentorOfferingResponse[];
}

export interface MentorOfferingResponse {
  id: string;
  mentor: { id: string; displayName: string };
  skill: GlobalCatalogSkill;
  price: number;
  modes: ("POINTS" | "SKILL_SWAP" | "VOLUNTEER")[];
  duration: number;
  availability?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMentorOfferingRequest {
  teachUserSkillId: string;
  pointCost: number;
  pointsEnabled: boolean;
  skillSwapEnabled: boolean;
  volunteerEnabled: boolean;
  duration: number;
  availabilityText?: string;
}

export interface UpdateMentorOfferingRequest extends Partial<
  Omit<CreateMentorOfferingRequest, "teachUserSkillId">
> {
  active?: boolean;
}

// ==========================================
// 5. Swap Proposals & Barter
// ==========================================

export type SwapProposalStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "COUNTERED" | "CANCELLED";

export interface CreateSwapProposalRequest {
  responderId: string;
  offeredSkillId: string;
  requestedSkillId: string;
  pointCost: number;
  message: string;
}

export interface RejectSwapProposalRequest {
  reason: string;
}

export interface CounterSwapProposalRequest {
  offeredSkillId: string;
  requestedSkillId: string;
  pointCost: number;
  message: string;
}

export interface SwapProposalResponse {
  id: string;
  requesterId: string;
  responderId: string;
  offeredSkillId: string;
  requestedSkillId: string;
  pointCost: number;
  pointsHeld: number;
  status: SwapProposalStatus;
  message: string;
  createdAt: string;
  sessionId?: string;
}

// ==========================================
// 6. Sessions & Double-Confirmation
// ==========================================

export type SessionStatus =
  | "ACCEPTED"
  | "SCHEDULED"
  | "STARTED"
  | "AWAITING_CONFIRMATION"
  | "COMPLETED"
  | "DISPUTED"
  | "CANCELLED";

export interface SessionResponse {
  id: string;
  title?: string;
  requesterId?: string;
  responderId?: string;
  mentorId?: string;
  learnerId?: string;
  mentorName?: string;
  learnerName?: string;
  counterpartName?: string;
  counterpartAvatar?: string;
  skillId?: string;
  skillName?: string;
  role?: "Mentor" | "Learner";
  requester?: { id: string; displayName: string; major?: string; avatarUrl?: string };
  responder?: { id: string; displayName: string; major?: string; avatarUrl?: string };
  requestedSkill?: GlobalCatalogSkill;
  offeredSkill?: GlobalCatalogSkill;
  scheduledStart?: string;
  startedAt?: string;
  completedAt?: string;
  autoReleaseAt?: string;
  pointCost: number;
  pointsHeld?: number;
  status: SessionStatus;
  meetingUrl?: string;
  notes?: string;
  mode?: "POINTS" | "SKILL_SWAP" | "VOLUNTEER" | string;
  firstPartyConfirmed?: boolean;
  secondPartyConfirmed?: boolean;
  createdAt: string;
}

export interface UpdateSessionRequest {
  meetingUrl?: string;
  notes?: string;
}

export interface DisputeSessionRequest {
  reason: string;
  details?: string;
}

// ==========================================
// 7. Reviews & Ratings
// ==========================================

export interface CreateReviewRequest {
  revieweeId?: string;
  skillId?: string;
  rating?: number; // 1 to 5, optional for skip-review
  feedback?: string;
  review?: string; // alias per api.md:244 completion-confirmations
}

export interface ReviewResponse {
  id: string;
  sessionId: string;
  reviewerId: string;
  reviewerName?: string;
  revieweeId: string;
  skillId: string;
  skillName?: string;
  rating: number;
  feedback: string;
  createdAt: string;
}

// ==========================================
// 8. Wallet & Points
// ==========================================

export interface WalletBalanceResponse {
  userId: string;
  availablePoints: number;
  heldPoints: number;
  totalEarned: number;
  totalSpent: number;
}

export interface WalletTransactionResponse {
  id: string;
  type:
    | "REGISTRATION_BONUS"
    | "ESCROW_HOLD"
    | "ESCROW_RELEASE"
    | "ESCROW_REFUND"
    | "FORUM_REWARD"
    | "VOLUNTEER_REWARD"
    | "REVIEW_REWARD"
    | "REFERRAL_BONUS"
    | "MILESTONE_BONUS"
    | "ADMIN_ADJUSTMENT"
    | "DIRECT_TRANSFER_SENT"
    | "DIRECT_TRANSFER_RECEIVED"
    | string;
  // compat aliases for legacy payloads
  eventType?: string;
  availableDelta: number;
  heldDelta: number;
  availableBalanceAfter?: number;
  heldBalanceAfter?: number;
  balanceAfterAvailable?: number;
  balanceAfterHeld?: number;
  amount?: number;
  description: string;
  referenceType?: string;
  referenceId?: string;
  idempotencyKey?: string;
  createdAt: string;
}

export interface TransferPointsRequest {
  recipientId: string;
  amount: number;
  reason?: string;
}

// ==========================================
// 9. Community Forum
// ==========================================

export interface ForumCommentResponse {
  id: string;
  postId?: string;
  authorId: string;
  authorName: string;
  author?: { id: string; displayName: string; major?: string; avatarUrl?: string };
  authorMajor?: string;
  authorAvatar?: string;
  body: string;
  createdAt: string;
}

export interface ForumPostSummaryResponse {
  id: string;
  title: string;
  description?: string;
  excerpt?: string;
  author?: { id: string; displayName: string; major?: string; avatarUrl?: string };
  skillTags?: GlobalCatalogSkill[];
  availability?: string;
  timestamp?: string;
  skillIds: string[];
  skills?: string[];
  tags?: string[];
  authorId: string;
  authorName: string;
  authorMajor?: string;
  authorAvatar?: string;
  availabilityText?: string;
  active: boolean;
  likeCount: number;
  commentCount: number;
  likedByMe?: boolean;
  createdAt: string;
}

export interface ForumPostResponse extends ForumPostSummaryResponse {
  comments: ForumCommentResponse[];
}

export interface CreateForumPostRequest {
  title: string;
  description: string;
  skillIds: string[];
  availabilityText?: string;
  active?: boolean;
}

export interface ForumPostLikeResponse {
  postId: string;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
}

export interface CreateForumCommentRequest {
  body: string;
}

export interface RewardCommentRequest {
  commentId: string;
  points: number;
}

export interface RewardCommentResponse {
  success?: boolean;
  transactionId?: string;
  pointsAwarded: number;
  message?: string;
}

// ==========================================
// 10. Notifications
// ==========================================

export interface NotificationResponse {
  id: string;
  userId?: string;
  title: string;
  message?: string;
  detail?: string;
  tone?: "success" | "info" | "warning" | "error";
  read: boolean;
  type?: string;
  createdAt: string;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

// ==========================================
// 11. Admin & Moderation
// ==========================================

export interface AdminDashboardMetricsResponse {
  totalUsers: number;
  activeSessions: number;
  pendingDisputes?: number;
  openReports?: number;
  activeDisputes?: number;
  heldEscrowPoints?: number;
  totalPointsInCirculation?: number;
  newUsersLast24h?: number;
}

export interface AdminUserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  roles: string[];
  status: "ACTIVE" | "FROZEN" | "BANNED" | "WARNED" | string;
  availablePoints?: number;
  heldPoints?: number;
  createdAt: string;
}

export interface AdminDisputeResponse {
  details?: string;
  openedBy?: { id: string; displayName: string };
  resolutionNote?: string;
  id: string;
  sessionId: string;
  requesterId: string;
  requesterName?: string;
  responderId: string;
  responderName?: string;
  reason: string;
  status: "OPEN" | "RESOLVED" | "DISMISSED" | string;
  heldPoints: number;
  createdAt: string;
  resolution?: DisputeResolutionType;
  adminNotes?: string;
}

export type DisputeResolutionType = "REFUND_REQUESTER" | "RELEASE_RESPONDER" | "SPLIT";

export interface ResolveDisputeRequest {
  resolution: DisputeResolutionType;
  adminNotes: string;
}

export interface AdminPlatformSettingsResponse {
  escrowReleaseHours?: number;
  registrationBonus?: number;
  forumContributionReward?: number;
  // canonical names per api.md:12 / backendchanges.md
  registrationBonusPoints?: number;
  helpfulForumContributionPoints?: number;
  escrowAutoReleaseHours?: number;
}

export interface AdminAuditEventResponse {
  id: string;
  actorId: string;
  actorName?: string;
  action: string;
  targetType: string;
  targetId: string;
  details?: string;
  timestamp: string;
}

// ==========================================
// 12. Learning Requests, Mentorship & Extensions
// ==========================================

// PHASE 2: Duration-based pricing types
export type SessionDuration = 15 | 30 | 45;

export interface SessionDurationOption {
  value: SessionDuration;
  label: string;
  cost: number;
}

export type LearningRequestMode = "POINTS" | "SKILL_SWAP" | "VOLUNTEER";
export type LearningRequestStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED" | "EXPIRED";
export type LearningRequestDirection = "INCOMING" | "OUTGOING";

export interface CreateLearningRequestDTO {
  mentorId: string;
  mentorOfferingId: string;
  requestedSkillId: string;
  mode: LearningRequestMode;
  offeredUserSkillId?: string;
  scheduledStart: string;
  durationMinutes: number;
  message?: string;
  sourceForumPostId?: string;
}

export interface LearningRequestResponse {
  id: string;
  learnerId: string;
  learnerName?: string;
  mentorId: string;
  mentorName?: string;
  mentorOfferingId: string;
  requestedSkillId?: string;
  requestedSkill?: GlobalCatalogSkill;
  requestedSkillName?: string;
  mode: LearningRequestMode;
  offeredUserSkillId?: string;
  offeredSkillName?: string;
  scheduledStart: string;
  durationMinutes: number;
  message?: string;
  status: LearningRequestStatus;
  pointCostSnapshot?: number;
  sessionId?: string;
  meetingUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 13. Mentor Applications
// ==========================================

export type MentorApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface SubmitMentorApplicationRequest {
  teachSkillIds: string[];
  experience: string;
  motivation: string;
  certificateIds?: string[];
}

export interface MentorApplicationResponse {
  id: string;
  userId: string;
  applicantName?: string;
  applicantEmail?: string;
  status: MentorApplicationStatus;
  experience: string;
  motivation: string;
  adminNotes?: string;
  teachSkills?: GlobalCatalogSkill[];
  certificates?: SkillCertificateResponse[];
  createdAt: string;
  reviewedAt?: string;
}

// ==========================================
// 14. Milestones & Achievements
// ==========================================

export interface MilestoneResponse {
  id: string;
  code: string;
  title: string;
  description: string;
  conditionType: string;
  conditionValue: number;
  pointsReward: number;
  icon?: string;
  achieved?: boolean;
  achievedAt?: string;
  progress?: number;
}

// ==========================================
// 15. Referrals
// ==========================================

export interface ReferralCodeResponse {
  referralCode: string;
  referralUrl: string;
  totalReferrals: number;
  totalPointsEarned: number;
}

export interface ReferralItemResponse {
  id: string;
  referredUserId: string;
  referredUserName: string;
  referredUserEmail: string;
  pointsAwarded: number;
  createdAt: string;
}

// ==========================================
// 16. Watchlist (My List)
// ==========================================

export type WatchlistItemType = "SKILL" | "MENTOR";

export interface WatchlistItem {
  id: string;
  type: WatchlistItemType;
  targetId: string;
  title: string;
  subtitle?: string;
  badge?: string;
  imageUrl?: string;
  rating?: number;
  addedAt: string;
}

// ==========================================
// 17. Missing Response Types
// ==========================================

export interface NormalizedSession {
  id: string;
  counterpart: string;
  initials: string;
  role: "Mentor" | "Learner";
  date: string;
  time: string;
  mode: string;
  points: number;
  status: SessionStatus | string;
  meetingUrl?: string;
  completedAt?: string;
  skillName?: string;
  scheduledStart?: string;
  scheduledAt?: string;
  duration?: number;
  durationMinutes?: number;
  mentorName?: string;
  learnerName?: string;
  counterpartAvatar?: string;
  raw?: SessionResponse;
  title?: string;
  requesterId?: string;
  responderId?: string;
  mentorId?: string;
}

export interface SkillProgress {
  skillId: string;
  skillName: string;
  direction: "TEACH" | "LEARN";
  progressPercentage: number; // 0-100
  hoursLearned: number;
  sessionsCompleted: number;
  currentLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
}

export type SkillProgressSummary = SkillProgress;

export interface EngagementMetrics {
  currentStreak: number;
  longestStreak: number;
  hoursThisWeek: number;
  hoursThisMonth: number;
  lastActiveDate?: string;
}

export interface DashboardResponse {
  userId?: string;
  displayName?: string;
  profile?: UserProfileResponse;
  wallet?: WalletResponse;
  totalPoints?: number;
  skillsTeaching?: number;
  skillsLearning?: number;
  completedSessions?: number;
  completedSessionCount?: number;
  mentorSessionCount?: number;
  learnerSessionCount?: number;
  upcomingSessions?: SessionResponse[];
  nextSessions?: SessionResponse[];
  teachSkills?: UserSkillResponse[];
  learnSkills?: UserSkillResponse[];
  certificates?: SkillCertificateResponse[];
  recentActivity?: PointTransactionResponse[];
  skillProgress?: SkillProgress[];
  engagement?: EngagementMetrics;
}

export interface PointTransactionResponse {
  id: string;
  userId: string;
  type: string;
  amount: number;
  balance: number;
  description: string;
  referenceId?: string;
  createdAt: string;
}

export interface WalletResponse {
  userId: string;
  totalPoints: number;
  availablePoints: number;
  transactions: WalletTransactionResponse[];
}

export interface ReferralSummaryResponse {
  referralCode: string;
  referralUrl: string;
  totalReferrals: number;
  totalPointsEarned: number;
  recentReferrals: ReferralItemResponse[];
}

export interface SwapRequestResponse {
  id: string;
  initiatorId: string;
  initiatorName?: string;
  receiverId: string;
  receiverName?: string;
  initiatorSkillId: string;
  initiatorSkillName?: string;
  receiverSkillId: string;
  receiverSkillName?: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED" | "CANCELLED" | "PROPOSED";
  message?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WatchlistItemResponse {
  id: string;
  userId: string;
  type: WatchlistItemType;
  targetId: string;
  title: string;
  subtitle?: string;
  badge?: string;
  imageUrl?: string;
  rating?: number;
  addedAt: string;
}
