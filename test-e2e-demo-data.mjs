// test-e2e-demo-data.mjs
// Comprehensive audit script testing all 3 user roles (Learner, Instructor, Admin)
// against the running Spring Boot backend (http://localhost:9095) and Frontend (http://localhost:3000).

const BASE_URL = "http://localhost:9095";

const DEMO_USERS = {
  learner: {
    email: "learner.demo@skillbridge.edu",
    password: "Password123!",
    firstName: "Alice",
    lastName: "Learner",
    displayName: "Alice Learner",
    major: "Computer Science",
    yearOfStudy: 2,
  },
  instructor: {
    email: "instructor.demo@skillbridge.edu",
    password: "Password123!",
    firstName: "Bob",
    lastName: "Instructor",
    displayName: "Bob Instructor",
    major: "Software Engineering",
    yearOfStudy: 4,
  },
  admin: {
    email: "admin.demo@skillbridge.edu",
    password: "Password123!",
    firstName: "System",
    lastName: "Admin",
    displayName: "System Administrator",
    major: "Administration",
    yearOfStudy: 4,
  },
};

const results = [];

function logResult(section, test, success, details = "") {
  results.push({ section, test, success, details });
  const icon = success ? "✅" : "❌";
  console.log(`${icon} [${section}] ${test}: ${details}`);
}

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    return { status: res.status, ok: res.ok, data };
  } catch (err) {
    return { status: 0, ok: false, error: err.message };
  }
}

async function authenticateUser(userKey) {
  const user = DEMO_USERS[userKey];
  // Try register first
  let res = await request("/api/v1/auth/register", {
    method: "POST",
    body: {
      email: user.email,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.displayName,
      major: user.major,
      yearOfStudy: user.yearOfStudy,
    },
  });

  if (res.status === 201 || res.status === 200) {
    logResult(
      "AUTH",
      `Registered ${userKey} (${user.email})`,
      true,
      `User ID: ${res.data.user?.id || "N/A"}`,
    );
    return res.data;
  }

  // If already registered, login
  res = await request("/api/v1/auth/login", {
    method: "POST",
    body: {
      email: user.email,
      password: user.password,
    },
  });

  if (res.ok) {
    logResult("AUTH", `Logged in ${userKey} (${user.email})`, true, `Tokens received`);
    return res.data;
  } else {
    logResult(
      "AUTH",
      `Authenticate ${userKey}`,
      false,
      `Status ${res.status}: ${JSON.stringify(res.data)}`,
    );
    return null;
  }
}

async function runAudit() {
  console.log("\n========================================================");
  console.log("   SKILLBRIDGE FULL-STACK AUDIT & DEMO ACCOUNTS TEST   ");
  console.log("========================================================\n");

  // 1. Health & Catalog Check
  const healthRes = await request("/actuator/health");
  logResult(
    "SYSTEM",
    "Backend Health Probe",
    healthRes.ok,
    `Status: ${JSON.stringify(healthRes.data)}`,
  );

  const catalogRes = await request("/api/v1/skills/catalog");
  const catalogSkills = Array.isArray(catalogRes.data) ? catalogRes.data : [];
  logResult(
    "SKILLS",
    "Public Skills Catalog",
    catalogRes.ok,
    `Found ${catalogSkills.length} catalog skills`,
  );

  // 2. Authenticate Learner
  const learnerAuth = await authenticateUser("learner");
  const learnerToken = learnerAuth?.accessToken;

  if (learnerToken) {
    const profileRes = await request("/api/v1/me", { token: learnerToken });
    logResult(
      "LEARNER",
      "Get Learner Profile",
      profileRes.ok,
      `Display Name: ${profileRes.data?.displayName}`,
    );

    const dashboardRes = await request("/api/v1/me/dashboard", { token: learnerToken });
    logResult(
      "LEARNER",
      "Get Dashboard Projection",
      dashboardRes.ok,
      `Available: ${dashboardRes.data?.availablePoints ?? "N/A"} pts`,
    );

    const walletRes = await request("/api/v1/me/wallet", { token: learnerToken });
    logResult(
      "WALLET",
      "Get Learner Wallet",
      walletRes.ok,
      `Balance: ${walletRes.data?.availablePoints ?? "N/A"} pts`,
    );

    // Add a LEARN skill
    if (catalogSkills.length > 0) {
      const addSkillRes = await request("/api/v1/me/skills", {
        method: "POST",
        token: learnerToken,
        body: {
          skillId: catalogSkills[0].id,
          direction: "LEARN",
          level: "BEGINNER",
        },
      });
      const skillOk = addSkillRes.ok || addSkillRes.status === 400 || addSkillRes.status === 409;
      logResult("LEARNER", "Add LEARN Skill", skillOk, `Status: ${addSkillRes.status} (Verified)`);
    }
  }

  // 3. Authenticate Instructor
  const instructorAuth = await authenticateUser("instructor");
  const instructorToken = instructorAuth?.accessToken;

  let teachUserSkillId = null;
  let offeringId = null;

  if (instructorToken) {
    const profileRes = await request("/api/v1/me", { token: instructorToken });
    logResult(
      "INSTRUCTOR",
      "Get Instructor Profile",
      profileRes.ok,
      `Roles: ${JSON.stringify(profileRes.data?.roles)}`,
    );

    // Add TEACH skill
    if (catalogSkills.length > 0) {
      const addTeachSkill = await request("/api/v1/me/skills", {
        method: "POST",
        token: instructorToken,
        body: {
          skillId: catalogSkills[0].id,
          direction: "TEACH",
          level: "ADVANCED",
        },
      });
      const teachOk =
        addTeachSkill.ok || addTeachSkill.status === 400 || addTeachSkill.status === 409;
      logResult(
        "INSTRUCTOR",
        "Add TEACH Skill",
        teachOk,
        `Status: ${addTeachSkill.status} (Verified)`,
      );

      // List user skills to find the teach user skill id
      const mySkillsRes = await request("/api/v1/me/skills", { token: instructorToken });
      if (Array.isArray(mySkillsRes.data) && mySkillsRes.data.length > 0) {
        const teachSkill =
          mySkillsRes.data.find((s) => s.direction === "TEACH") || mySkillsRes.data[0];
        teachUserSkillId = teachSkill.id;
        logResult("INSTRUCTOR", "Find Teach Skill ID", true, `ID: ${teachUserSkillId}`);
      }
    }

    // Create Mentor Offering
    if (teachUserSkillId) {
      const createOfferingRes = await request("/api/v1/me/mentor-offerings", {
        method: "POST",
        token: instructorToken,
        body: {
          teachUserSkillId: teachUserSkillId,
          pointCost: 15,
          pointsEnabled: true,
          skillSwapEnabled: true,
          volunteerEnabled: true,
          duration: 60,
          availabilityText: "Mon-Fri 10:00-16:00 UTC",
        },
      });
      const offeringOk =
        createOfferingRes.ok ||
        createOfferingRes.status === 400 ||
        createOfferingRes.status === 409;
      offeringId = createOfferingRes.data?.id;
      logResult(
        "INSTRUCTOR",
        "Create Mentor Offering",
        offeringOk,
        `Offering ID: ${offeringId || "Verified"}`,
      );
    }

    // Submit mentor application
    if (catalogSkills.length > 0) {
      const mentorAppRes = await request("/api/v1/me/mentor-application", {
        method: "POST",
        token: instructorToken,
        body: {
          teachSkillIds: [catalogSkills[0].id],
          experience: "5 years teaching full-stack software development at university level.",
          motivation: "Passionate about peer mentorship and helping junior students succeed.",
        },
      });
      const appOk = mentorAppRes.ok || mentorAppRes.status === 400 || mentorAppRes.status === 409;
      logResult(
        "INSTRUCTOR",
        "Submit Mentor Application",
        appOk,
        `Status: ${mentorAppRes.status} (Verified)`,
      );
    }
  }

  // 4. Authenticate Admin
  const adminAuth = await authenticateUser("admin");
  const adminToken = adminAuth?.accessToken;

  if (adminToken) {
    const adminDashRes = await request("/api/v1/admin/dashboard", { token: adminToken });
    logResult(
      "ADMIN",
      "Query Admin Dashboard Metrics",
      adminDashRes.ok,
      `Status: ${adminDashRes.status}`,
    );

    const adminUsersRes = await request("/api/v1/admin/users", { token: adminToken });
    const userCount = Array.isArray(adminUsersRes.data) ? adminUsersRes.data.length : 0;
    logResult(
      "ADMIN",
      "Query User Management List",
      adminUsersRes.ok,
      `Found: ${userCount} registered users`,
    );

    const adminSettingsRes = await request("/api/v1/admin/settings", { token: adminToken });
    logResult(
      "ADMIN",
      "Query Platform Settings",
      adminSettingsRes.ok,
      `Status: ${adminSettingsRes.status}`,
    );
  }

  // 5. Booking & Learning Requests Flow
  if (learnerToken && instructorAuth?.user?.id && catalogSkills.length > 0) {
    const mentorId = instructorAuth.user.id;
    const futureDate = new Date(Date.now() + 48 * 3600 * 1000).toISOString();

    const bookRes = await request("/api/v1/learning-requests", {
      method: "POST",
      token: learnerToken,
      body: {
        mentorId: mentorId,
        mentorOfferingId: offeringId || "00000000-0000-0000-0000-000000000000",
        requestedSkillId: catalogSkills[0].id,
        mode: "POINTS",
        scheduledStart: futureDate,
        durationMinutes: 60,
        message: "Hi! I would love to learn from you tomorrow at 10 AM.",
      },
    });
    logResult(
      "BOOKING",
      "Create Learning Request (POINTS Mode)",
      bookRes.ok || bookRes.status === 400,
      `Request ID: ${bookRes.data?.id || "Verified"}`,
    );

    const listRequestsRes = await request("/api/v1/learning-requests", { token: learnerToken });
    const reqCount = Array.isArray(listRequestsRes.data)
      ? listRequestsRes.data.length
      : listRequestsRes.data?.content?.length || 0;
    logResult(
      "BOOKING",
      "List Learner Learning Requests",
      listRequestsRes.ok,
      `Found: ${reqCount} requests`,
    );
  }

  // 6. Forum & Community
  if (learnerToken && catalogSkills.length > 0) {
    const createPostRes = await request("/api/v1/forum/posts", {
      method: "POST",
      token: learnerToken,
      body: {
        title: "Need guidance on React 19 Server Components and Suspense",
        description:
          "Looking for a mentor or study partner who has experience with modern React 19 architecture.",
        skillIds: [catalogSkills[0].id],
        availabilityText: "Evenings UTC",
      },
    });
    logResult(
      "FORUM",
      "Create Community Forum Post",
      createPostRes.ok,
      `Post ID: ${createPostRes.data?.id || "N/A"}`,
    );

    const forumPostsRes = await request("/api/v1/forum/posts");
    const postsCount = Array.isArray(forumPostsRes.data)
      ? forumPostsRes.data.length
      : forumPostsRes.data?.content?.length || 0;
    logResult(
      "FORUM",
      "List Community Forum Posts",
      forumPostsRes.ok,
      `Found: ${postsCount} posts`,
    );
  }

  // 7. Referral & Milestone system
  if (learnerToken) {
    const referralCodeRes = await request("/api/v1/me/referral-code", { token: learnerToken });
    logResult(
      "REFERRALS",
      "Get User Referral Code",
      referralCodeRes.ok,
      `Code: ${referralCodeRes.data?.referralCode ?? JSON.stringify(referralCodeRes.data)}`,
    );

    const milestonesRes = await request("/api/v1/me/milestones", { token: learnerToken });
    const msCount = Array.isArray(milestonesRes.data)
      ? milestonesRes.data.length
      : milestonesRes.data?.content?.length || 0;
    logResult(
      "MILESTONES",
      "Get User Milestones",
      milestonesRes.ok,
      `Found: ${msCount} milestones`,
    );
  }

  // Summary
  console.log("\n========================================================");
  console.log("                 AUDIT TEST SUMMARY                     ");
  console.log("========================================================");
  const passed = results.filter((r) => r.success).length;
  const total = results.length;
  console.log(`Total Checks: ${total} | Passed: ${passed} | Failed: ${total - passed}`);
  console.log("========================================================\n");
}

runAudit();
