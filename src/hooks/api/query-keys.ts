import { MentorSearchFilters, PaginationParams, SkillDirection } from "@/types/api";

export const queryKeys = {
  auth: {
    profile: ["auth", "profile"] as const,
    publicProfile: (userId: string) => ["auth", "publicProfile", userId] as const,
    publicSkills: (userId: string) => ["auth", "publicSkills", userId] as const,
  },
  skills: {
    user: (direction?: SkillDirection) => ["skills", "user", direction] as const,
    catalog: ["skills", "catalog"] as const,
    search: (query: string) => ["skills", "search", query] as const,
    categories: ["skills", "categories"] as const,
    detail: (id: string) => ["skills", "detail", id] as const,
  },
  mentors: {
    list: (filters?: MentorSearchFilters) => ["mentors", "list", filters] as const,
    detail: (mentorId: string) => ["mentors", "detail", mentorId] as const,
    reviews: (mentorId: string, pagination?: PaginationParams) =>
      ["mentors", "reviews", mentorId, pagination] as const,
    myOfferings: ["mentors", "myOfferings"] as const,
  },
  swaps: {
    all: ["swaps"] as const,
    detail: (id: string) => ["swaps", "detail", id] as const,
  },
  sessions: {
    list: (status?: string) => ["sessions", "list", status] as const,
    calendar: (start?: string, end?: string) => ["sessions", "calendar", { start, end }] as const,
    detail: (id: string) => ["sessions", "detail", id] as const,
  },
  reviews: {
    bySession: (sessionId: string) => ["reviews", "session", sessionId] as const,
  },
  wallet: {
    balance: ["wallet", "balance"] as const,
    transactions: (params?: PaginationParams) => ["wallet", "transactions", params] as const,
  },
  forum: {
    posts: (skillId?: string, search?: string) => ["forum", "posts", { skillId, search }] as const,
    topVolunteers: (week?: string) => ["forum", "topVolunteers", week] as const,
  },
  notifications: {
    all: ["notifications", "all"] as const,
    unreadCount: ["notifications", "unreadCount"] as const,
  },
  admin: {
    metrics: ["admin", "metrics"] as const,
    users: (params?: PaginationParams) => ["admin", "users", params] as const,
    disputes: ["admin", "disputes"] as const,
    settings: ["admin", "settings"] as const,
    auditLogs: (params?: PaginationParams) => ["admin", "auditLogs", params] as const,
    mentorApplications: ["admin", "mentorApplications"] as const,
  },
  learningRequests: {
    all: ["learningRequests"] as const,
    list: (direction?: string, status?: string) =>
      ["learningRequests", "list", direction, status] as const,
    detail: (id: string) => ["learningRequests", "detail", id] as const,
  },
  mentorApplication: {
    me: ["mentorApplication", "me"] as const,
  },
  referrals: {
    code: ["referrals", "code"] as const,
    list: ["referrals", "list"] as const,
  },
  milestones: {
    me: ["milestones", "me"] as const,
    admin: ["milestones", "admin"] as const,
  },
  watchlist: {
    all: ["watchlist"] as const,
  },
  dashboard: {
    me: ["dashboard", "me"] as const,
  },
} as const;
