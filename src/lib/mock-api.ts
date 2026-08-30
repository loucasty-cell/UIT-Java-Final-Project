import {
  AuthResponse,
  AuthUser,
  DashboardResponse,
  GlobalCatalogSkill,
  MentorDetailResponse,
  MentorOfferingResponse,
  MentorSearchResponse,
  NotificationResponse,
  PageResponse,
  PointTransactionResponse,
  PublicUserProfileResponse,
  PublicUserSkillResponse,
  ReferralSummaryResponse,
  ReviewResponse,
  SessionResponse,
  SwapRequestResponse,
  UserProfileResponse,
  UserSkillResponse,
  WalletResponse,
  WatchlistItemResponse,
} from "@/types/api";

// Seed state stored in memory and synchronized to localStorage if present
const MOCK_STORAGE_KEY = "skillbridge_mock_db_v1";

interface MockDB {
  users: Array<AuthUser & { password?: string; bio?: string; major?: string; yearOfStudy?: number; points: number }>;
  skills: GlobalCatalogSkill[];
  userSkills: Record<string, UserSkillResponse[]>;
  mentors: MentorDetailResponse[];
  offerings: MentorOfferingResponse[];
  sessions: SessionResponse[];
  swaps: SwapRequestResponse[];
  forumPosts: any[];
  notifications: NotificationResponse[];
  walletTransactions: PointTransactionResponse[];
  watchlist: WatchlistItemResponse[];
}

const DEFAULT_USERS = [
  {
    id: "user-student",
    email: "student@university.edu",
    password: "password123",
    firstName: "Alex",
    lastName: "Chen",
    displayName: "Alex Chen",
    roles: ["USER"],
    status: "ACTIVE",
    bio: "CS sophomore exploring web development, machine learning, and UI/UX design.",
    major: "Computer Science",
    yearOfStudy: 2,
    points: 60,
  },
  {
    id: "user-mentor",
    email: "mentor@university.edu",
    password: "password123",
    firstName: "Priya",
    lastName: "Anand",
    displayName: "Priya Anand",
    roles: ["USER", "MENTOR"],
    status: "ACTIVE",
    bio: "Senior CS major & TA with 2+ years of experience mentoring React, TypeScript, and Java.",
    major: "Software Engineering",
    yearOfStudy: 4,
    points: 180,
  },
  {
    id: "user-admin",
    email: "admin@university.edu",
    password: "password123",
    firstName: "Admin",
    lastName: "User",
    displayName: "System Administrator",
    roles: ["USER", "MENTOR", "ADMIN"],
    status: "ACTIVE",
    bio: "SkillBridge platform administrator and community supervisor.",
    major: "Information Systems",
    yearOfStudy: 4,
    points: 500,
  },
];

const DEFAULT_SKILLS: GlobalCatalogSkill[] = [
  { id: "sk-react", name: "React", category: "Programming", description: "Modern React with Hooks, Server Components, and State Management." },
  { id: "sk-typescript", name: "TypeScript", category: "Programming", description: "Static typing for JavaScript, generics, utility types." },
  { id: "sk-python", name: "Python", category: "Programming", description: "Data structures, algorithms, Flask, and pandas." },
  { id: "sk-java", name: "Java & Spring Boot", category: "Programming", description: "Enterprise backend development, Spring Data JPA, REST APIs." },
  { id: "sk-uiux", name: "UI/UX & Figma", category: "Design", description: "Wireframing, prototyping, design systems, and user testing." },
  { id: "sk-algebra", name: "Linear Algebra", category: "Mathematics", description: "Vector spaces, eigenvalues, matrix transformations." },
  { id: "sk-calculus", name: "Calculus & Analysis", category: "Mathematics", description: "Derivatives, integrals, multivariable calculus." },
  { id: "sk-writing", name: "Academic Essay Writing", category: "Language & Writing", description: "Thesis development, structuring, academic style." },
  { id: "sk-public-speaking", name: "Public Speaking", category: "Soft Skills", description: "Presentations, storytelling, and stage presence." },
];

const DEFAULT_MENTORS: MentorDetailResponse[] = [
  {
    id: "m-priya",
    mentorId: "m-priya",
    userId: "user-mentor",
    name: "Priya Anand",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
    major: "Software Engineering, Year 4",
    bio: "Senior software engineering student passionate about helping peers build full-stack web applications with React, TypeScript, and Spring.",
    averageRating: 4.9,
    reviewCount: 32,
    hourlyRatePoints: 50,
    skills: [
      { id: "sk-react", name: "React", category: "Programming" },
      { id: "sk-typescript", name: "TypeScript", category: "Programming" },
      { id: "sk-uiux", name: "UI/UX & Figma", category: "Design" },
    ],
  },
  {
    id: "m-marcus",
    mentorId: "m-marcus",
    userId: "user-marcus",
    name: "Marcus Delgado",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
    major: "Mathematics, Year 3",
    bio: "Mathematics honors student specializing in linear algebra, calculus, and mathematical modeling.",
    averageRating: 4.8,
    reviewCount: 24,
    hourlyRatePoints: 40,
    skills: [
      { id: "sk-algebra", name: "Linear Algebra", category: "Mathematics" },
      { id: "sk-calculus", name: "Calculus & Analysis", category: "Mathematics" },
      { id: "sk-python", name: "Python", category: "Programming" },
    ],
  },
  {
    id: "m-kenji",
    mentorId: "m-kenji",
    userId: "user-kenji",
    name: "Kenji Watanabe",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kenji",
    major: "Digital Media & Design, Year 3",
    bio: "Product designer with internship experience at top startups. Let's level up your portfolio.",
    averageRating: 4.9,
    reviewCount: 41,
    hourlyRatePoints: 55,
    skills: [
      { id: "sk-uiux", name: "UI/UX & Figma", category: "Design" },
    ],
  },
];

const DEFAULT_FORUM_POSTS = [
  {
    id: "fp-1",
    authorId: "user-student",
    authorName: "Alex Chen",
    title: "Looking for study partner / mentor for Advanced Algorithms (CS 301)",
    content: "Preparing for the midterm next week. Happy to swap React/Tailwind frontend skills or offer 40 points per session!",
    tags: ["Algorithms", "StudyGroup", "Python"],
    upvotes: 14,
    hasUpvoted: false,
    commentsCount: 5,
    rewardOfferedPoints: 40,
    status: "OPEN",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: "fp-2",
    authorId: "user-mentor",
    authorName: "Priya Anand",
    title: "Free volunteer office hours: Code review for React & TypeScript projects",
    content: "Hosting free 30-min 1-on-1 portfolio review slots this Thursday for anyone building summer projects!",
    tags: ["Volunteer", "React", "TypeScript", "Mentorship"],
    upvotes: 38,
    hasUpvoted: true,
    commentsCount: 12,
    rewardOfferedPoints: 0,
    status: "OPEN",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

function initDB(): MockDB {
  if (typeof window !== "undefined") {
    const raw = localStorage.getItem(MOCK_STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
  }

  const initialDB: MockDB = {
    users: [...DEFAULT_USERS],
    skills: [...DEFAULT_SKILLS],
    userSkills: {
      "user-student": [
        { id: "us-1", skill: { id: "sk-react", name: "React", category: "Programming" }, level: "INTERMEDIATE", direction: "TEACH", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "us-2", skill: { id: "sk-algebra", name: "Linear Algebra", category: "Mathematics" }, level: "BEGINNER", direction: "LEARN", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ],
      "user-mentor": [
        { id: "us-3", skill: { id: "sk-react", name: "React", category: "Programming" }, level: "ADVANCED", direction: "TEACH", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "us-4", skill: { id: "sk-typescript", name: "TypeScript", category: "Programming" }, level: "ADVANCED", direction: "TEACH", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ],
    },
    mentors: [...DEFAULT_MENTORS],
    offerings: [
      {
        id: "off-1",
        mentorId: "user-mentor",
        skillId: "sk-react",
        skillName: "React",
        description: "Comprehensive 1-on-1 coaching covering state management, hooks, and clean architecture.",
        hourlyRatePoints: 50,
        available: true,
      },
    ],
    sessions: [
      {
        id: "sess-1",
        title: "React Performance Optimization",
        mentorId: "user-mentor",
        learnerId: "user-student",
        counterpartName: "Alex Chen",
        skillName: "React",
        scheduledStart: new Date(Date.now() + 86400000 * 2).toISOString(),
        pointCost: 50,
        status: "SCHEDULED",
        meetingUrl: "https://meet.skillbridge.edu/session-101",
        createdAt: new Date().toISOString(),
      },
    ],
    swaps: [],
    forumPosts: [...DEFAULT_FORUM_POSTS],
    notifications: [
      {
        id: "notif-1",
        userId: "user-student",
        title: "Welcome to SkillBridge!",
        message: "You received +30 starter points in your student wallet. Start browsing mentors or offer a skill!",
        type: "SYSTEM_NOTIFICATION",
        read: false,
        createdAt: new Date().toISOString(),
      },
    ],
    walletTransactions: [
      {
        id: "tx-1",
        userId: "user-student",
        amount: 30,
        balance: 30,
        type: "EARN",
        description: "Starter account bonus points",
        createdAt: new Date().toISOString(),
      },
      {
        id: "tx-2",
        userId: "user-student",
        amount: 30,
        balance: 60,
        type: "EARN",
        description: "Community welcome gift",
        createdAt: new Date().toISOString(),
      },
    ],
    watchlist: [
      {
        id: "wl-1",
        userId: "user-student",
        targetId: "m-priya",
        type: "MENTOR",
        title: "Priya Anand (React / TypeScript)",
        addedAt: new Date().toISOString(),
      },
    ],
  };

  saveDB(initialDB);
  return initialDB;
}

function saveDB(db: MockDB) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(db));
    } catch {}
  }
}

let db = initDB();

export function handleMockApiRequest(endpoint: string, method: string = "GET", body?: any, params?: any): any {
  // Refresh db in case modified
  db = initDB();

  const cleanPath = endpoint.split("?")[0].replace(/\/+$/, "");

  // ==========================================
  // Auth & Profile
  // ==========================================
  if (cleanPath === "/api/v1/auth/login" && method === "POST") {
    const email = body?.email || "";
    let user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      // Auto create or fallback
      user = {
        id: "user-" + Date.now(),
        email: email || "student@university.edu",
        firstName: "Student",
        lastName: "User",
        displayName: email ? email.split("@")[0] : "Student User",
        roles: ["USER"],
        status: "ACTIVE",
        points: 30,
      };
      db.users.push(user);
      saveDB(db);
    }
    const token = "mock-jwt-" + user.id + "-" + Date.now();
    return {
      accessToken: token,
      accessTokenExpiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
      refreshToken: "mock-refresh-" + user.id,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName,
        roles: user.roles,
        status: user.status,
      },
    };
  }

  if (cleanPath === "/api/v1/auth/register" && method === "POST") {
    const newUser = {
      id: "user-" + Date.now(),
      email: body.email,
      firstName: body.firstName || "Student",
      lastName: body.lastName || "User",
      displayName: body.displayName || `${body.firstName} ${body.lastName}`.trim() || "Student",
      major: body.major || "Computer Science",
      yearOfStudy: body.yearOfStudy || 1,
      roles: ["USER"],
      status: "ACTIVE",
      points: 30 + (body.referralCode ? 5 : 0),
    };
    db.users.push(newUser);
    saveDB(db);

    const token = "mock-jwt-" + newUser.id + "-" + Date.now();
    return {
      accessToken: token,
      accessTokenExpiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
      refreshToken: "mock-refresh-" + newUser.id,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        displayName: newUser.displayName,
        roles: newUser.roles,
        status: newUser.status,
      },
    };
  }

  if (cleanPath === "/api/v1/auth/refresh" && method === "POST") {
    return {
      accessToken: "mock-jwt-refreshed-" + Date.now(),
      accessTokenExpiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
      refreshToken: "mock-refresh-" + Date.now(),
      user: db.users[0],
    };
  }

  if (cleanPath === "/api/v1/auth/logout") {
    return {};
  }

  if (cleanPath === "/api/v1/me" || cleanPath === "/api/v1/me/profile") {
    if (method === "PATCH" || method === "PUT") {
      const u = db.users[0];
      if (body.displayName) u.displayName = body.displayName;
      if (body.bio) u.bio = body.bio;
      if (body.major) u.major = body.major;
      if (body.yearOfStudy) u.yearOfStudy = body.yearOfStudy;
      saveDB(db);
      return u;
    }
    const current = db.users[0];
    return {
      id: current.id,
      email: current.email,
      firstName: current.firstName,
      lastName: current.lastName,
      displayName: current.displayName,
      bio: current.bio,
      major: current.major,
      yearOfStudy: current.yearOfStudy,
      status: current.status,
      roles: current.roles,
    };
  }

  if (cleanPath === "/api/v1/me/dashboard") {
    const current = db.users[0];
    return {
      userId: current.id,
      displayName: current.displayName,
      email: current.email,
      major: current.major,
      yearOfStudy: current.yearOfStudy,
      availablePoints: current.points,
      heldPoints: 10,
      totalEarned: 120,
      totalSpent: 40,
      completedSessionsCount: 6,
      activeSessionsCount: 1,
    };
  }

  // ==========================================
  // Mentors
  // ==========================================
  if (cleanPath === "/api/v1/mentors") {
    const search = params?.search?.toLowerCase() || "";
    let filtered = db.mentors;
    if (search) {
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(search) ||
          m.skills.some((s) => s.name.toLowerCase().includes(search)) ||
          (m.major && m.major.toLowerCase().includes(search))
      );
    }
    return {
      content: filtered,
      pageNumber: 0,
      pageSize: 20,
      totalElements: filtered.length,
      totalPages: 1,
      last: true,
    };
  }

  if (cleanPath.startsWith("/api/v1/mentors/")) {
    const parts = cleanPath.split("/");
    const mentorId = parts[4];
    const subRoute = parts[5];

    const mentor = db.mentors.find((m) => m.id === mentorId || m.userId === mentorId) || db.mentors[0];

    if (subRoute === "availability") {
      return {
        mentorId: mentor.id,
        slots: [
          { dayOfWeek: "MONDAY", startTime: "14:00", endTime: "18:00" },
          { dayOfWeek: "WEDNESDAY", startTime: "10:00", endTime: "16:00" },
          { dayOfWeek: "FRIDAY", startTime: "13:00", endTime: "17:00" },
        ],
      };
    }

    if (subRoute === "reviews") {
      return {
        content: [
          {
            id: "rev-1",
            sessionId: "sess-1",
            authorName: "Alex Chen",
            rating: 5,
            comment: "Exceptional explanation of React performance bottlenecks and useMemo! Highly recommended.",
            createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          },
          {
            id: "rev-2",
            sessionId: "sess-2",
            authorName: "Sarah Jenkins",
            rating: 5,
            comment: "Very patient mentor and gave super practical code reviews.",
            createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
          },
        ],
        pageNumber: 0,
        pageSize: 10,
        totalElements: 2,
        totalPages: 1,
        last: true,
      };
    }

    return mentor;
  }

  if (cleanPath === "/api/v1/me/mentor-offerings") {
    if (method === "POST") {
      const newOffering: MentorOfferingResponse = {
        id: "off-" + Date.now(),
        mentorId: db.users[0].id,
        skillId: body.skillId || "sk-react",
        skillName: body.skillName || "React",
        description: body.description || "1-on-1 mentorship",
        hourlyRatePoints: body.hourlyRatePoints ?? 35,
        available: true,
      };
      db.offerings.push(newOffering);
      saveDB(db);
      return newOffering;
    }
    return db.offerings;
  }

  // ==========================================
  // Skills
  // ==========================================
  if (cleanPath === "/api/skills" || cleanPath === "/api/v1/skills") {
    return db.skills;
  }

  if (cleanPath === "/api/skills/search" || cleanPath === "/api/v1/skills/search") {
    const q = params?.q?.toLowerCase() || "";
    return db.skills.filter((s) => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q));
  }

  if (cleanPath === "/api/v1/skills/categories") {
    return ["Programming", "Design", "Mathematics", "Language & Writing", "Soft Skills", "Business"];
  }

  if (cleanPath === "/api/v1/me/skills") {
    const uid = db.users[0].id;
    const userSkills = db.userSkills[uid] || db.userSkills["user-student"] || [];
    const direction = params?.direction;
    if (method === "POST") {
      const added: UserSkillResponse = {
        id: "us-" + Date.now(),
        skill: {
          id: body.skillId || "sk-react",
          name: body.skillName || "Added Skill",
          category: body.category || "General",
        },
        level: body.level || "BEGINNER",
        direction: body.direction || "LEARN",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (!db.userSkills[uid]) db.userSkills[uid] = [];
      db.userSkills[uid].push(added);
      saveDB(db);
      return added;
    }
    if (direction) {
      return userSkills.filter((s) => s.direction === direction);
    }
    return userSkills;
  }

  if (cleanPath === "/api/v1/me/certificates") {
    return [
      {
        id: "cert-1",
        skillId: "sk-react",
        skillName: "React",
        fileName: "meta_frontend_react_cert.pdf",
        fileSize: 1048576,
        contentType: "application/pdf",
        verified: true,
        uploadedAt: new Date(Date.now() - 86400000 * 20).toISOString(),
      },
    ];
  }

  // ==========================================
  // Forum
  // ==========================================
  if (cleanPath === "/api/v1/forum/posts" || cleanPath === "/api/v1/forum") {
    if (method === "POST") {
      const newPost = {
        id: "fp-" + Date.now(),
        authorId: db.users[0].id,
        authorName: db.users[0].displayName,
        title: body.title,
        content: body.content,
        tags: body.tags || [],
        upvotes: 0,
        hasUpvoted: false,
        commentsCount: 0,
        rewardOfferedPoints: body.rewardOfferedPoints || 0,
        status: "OPEN",
        createdAt: new Date().toISOString(),
      };
      db.forumPosts.unshift(newPost);
      saveDB(db);
      return newPost;
    }
    return {
      content: db.forumPosts,
      pageNumber: 0,
      pageSize: 20,
      totalElements: db.forumPosts.length,
      totalPages: 1,
      last: true,
    };
  }

  if (cleanPath === "/api/v1/forum/top-volunteers") {
    return [
      { userId: "user-mentor", displayName: "Priya Anand", volunteerHours: 24, badge: "Gold Mentor" },
      { userId: "user-marcus", displayName: "Marcus Delgado", volunteerHours: 18, badge: "Silver Mentor" },
      { userId: "user-kenji", displayName: "Kenji Watanabe", volunteerHours: 14, badge: "Bronze Mentor" },
    ];
  }

  // ==========================================
  // Sessions & Swaps
  // ==========================================
  if (cleanPath === "/api/v1/sessions" || cleanPath === "/api/v1/me/sessions") {
    if (method === "POST") {
      const newSession: SessionResponse = {
        id: "sess-" + Date.now(),
        title: body.title || "Skill Mentorship Session",
        mentorId: body.mentorId || "user-mentor",
        counterpartName: "Priya Anand",
        learnerId: db.users[0].id,
        skillName: body.skillName || "React",
        scheduledStart: body.scheduledStart || new Date(Date.now() + 86400000).toISOString(),
        pointCost: body.pointCost || 40,
        status: "SCHEDULED",
        meetingUrl: "https://meet.skillbridge.edu/sess-" + Date.now(),
        createdAt: new Date().toISOString(),
      };
      db.sessions.push(newSession);
      saveDB(db);
      return newSession;
    }
    return db.sessions;
  }

  if (cleanPath === "/api/v1/swaps" || cleanPath === "/api/v1/me/swaps") {
    if (method === "POST") {
      const newSwap: SwapRequestResponse = {
        id: "swap-" + Date.now(),
        initiatorId: db.users[0].id,
        initiatorName: db.users[0].displayName,
        receiverId: body.receiverId || "user-marcus",
        receiverName: "Marcus Delgado",
        initiatorSkillName: body.initiatorSkillName || "React",
        receiverSkillName: body.receiverSkillName || "Linear Algebra",
        initiatorSkillId: "sk-react",
        receiverSkillId: "sk-algebra",
        status: "PENDING",
        message: body.message || "Hi! Let's swap skills.",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.swaps.push(newSwap);
      saveDB(db);
      return newSwap;
    }
    return db.swaps;
  }

  // ==========================================
  // Wallet
  // ==========================================
  if (cleanPath === "/api/v1/wallet" || cleanPath === "/api/v1/me/wallet") {
    const user = db.users[0];
    return {
      userId: user.id,
      availablePoints: user.points,
      heldPoints: 10,
      totalEarned: 120,
      totalSpent: 40,
    };
  }

  if (cleanPath === "/api/v1/wallet/transactions" || cleanPath === "/api/v1/me/transactions") {
    return {
      content: db.walletTransactions,
      pageNumber: 0,
      pageSize: 20,
      totalElements: db.walletTransactions.length,
      totalPages: 1,
      last: true,
    };
  }

  // ==========================================
  // Admin & Platform
  // ==========================================
  if (cleanPath === "/api/v1/admin/dashboard") {
    return {
      totalUsers: 142,
      activeUsersToday: 48,
      totalSessionsCompleted: 312,
      escrowPointsLocked: 850,
      openDisputesCount: 2,
      pendingReportsCount: 1,
      totalPointsInCirculation: 12450,
    };
  }

  if (cleanPath === "/api/v1/admin/users") {
    return {
      content: db.users.map((u) => ({
        id: u.id,
        email: u.email,
        displayName: u.displayName,
        roles: u.roles,
        status: u.status,
        availablePoints: u.points,
        createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
      })),
      pageNumber: 0,
      pageSize: 20,
      totalElements: db.users.length,
      totalPages: 1,
      last: true,
    };
  }

  if (cleanPath === "/api/v1/admin/disputes") {
    return {
      content: [
        {
          id: "disp-1",
          sessionId: "sess-1",
          initiatorName: "Alex Chen",
          respondentName: "Priya Anand",
          reason: "Schedule conflict arose after confirmation",
          status: "OPEN",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ],
      pageNumber: 0,
      pageSize: 10,
      totalElements: 1,
      totalPages: 1,
      last: true,
    };
  }

  if (cleanPath === "/api/v1/admin/reports") {
    return {
      content: [],
      pageNumber: 0,
      pageSize: 10,
      totalElements: 0,
      totalPages: 0,
      last: true,
    };
  }

  if (cleanPath === "/api/v1/admin/settings") {
    return {
      starterPointsBonus: 30,
      referralBonusPoints: 5,
      escrowAutoReleaseHours: 24,
      platformFeePercent: 0,
      allowVolunteerMentoring: true,
    };
  }

  if (cleanPath === "/api/v1/admin/audit-events") {
    return {
      content: [
        {
          id: "aud-1",
          adminName: "System Administrator",
          action: "CONFIG_UPDATE",
          details: "Platform starter bonus set to 30 points",
          timestamp: new Date().toISOString(),
        },
      ],
      pageNumber: 0,
      pageSize: 20,
      totalElements: 1,
      totalPages: 1,
      last: true,
    };
  }

  // ==========================================
  // Notifications & Watchlist & Referrals
  // ==========================================
  if (cleanPath === "/api/v1/notifications") {
    return db.notifications;
  }

  if (cleanPath === "/api/v1/me/watchlist" || cleanPath === "/api/v1/watchlist") {
    return db.watchlist;
  }

  if (cleanPath === "/api/v1/me/referrals" || cleanPath === "/api/v1/referrals") {
    return {
      referralCode: "SKILL-ALEX-2026",
      successfulReferralsCount: 2,
      pointsEarned: 10,
      pendingReferralsCount: 1,
    };
  }

  // Default fallback for any unhandled GET/POST
  if (method === "GET") {
    return cleanPath.endsWith("s") || cleanPath.endsWith("s/") ? [] : {};
  }

  return { success: true, message: "Action recorded successfully." };
}
