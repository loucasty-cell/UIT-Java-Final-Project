# SkillBridge Backend — Business Logic & Workflows

## 🔄 Core Workflows

### 1. User Registration & Onboarding

```
Register Request → Validate email uniqueness → Hash password
→ Create User (role=ROLE_USER) → Create Wallet (+30 bonus)
→ Generate JWT pair (access: 12h, refresh: 7d) → Return tokens
```

**Invariants**:
- Email unique, password ≥ 8 chars
- Every user has exactly one wallet
- Wallet initialized with 30 points

---

### 2. Skill Swap Lifecycle

```
Learner creates LearningRequest
  ↓
Mentor creates SwapRequest (50 points)
  ↓
Learner accepts → Lock 50 points in escrow
  ↓
Schedule LearningSession
  ↓
Mark session COMPLETED
  ↓
Release 50 points to mentor
  ↓
Both submit reviews (1-5 stars)
```

**State Machine**:
```
SwapRequest: PENDING → ACCEPTED → IN_PROGRESS → COMPLETED
LearningSession: SCHEDULED → ONGOING → COMPLETED
```

**Rules**:
- Cannot swap with yourself
- Points locked in escrow until session complete
- Auto-release after 18 hours if incomplete

---

### 3. Point Economy

```
Registration Bonus:         +30 points
Swap Accepted (locked):     -50 points
Session Completed (to mentor): +50 points
Helpful Forum Post:         +5 points
Moderation Penalty:         -10 to -100 points
```

**Wallet State**:
```
total_points = available_points + locked_points

Accept swap:
  available: 100 → 50
  locked: 0 → 50
  
Complete session:
  Mentor: available += 50
  Learner: locked -= 50
```

---

### 4. Notification System

**Triggers**:
- SwapRequest created → Notify mentor
- SwapRequest accepted → Notify both
- Session scheduled → Remind both
- Session completed → Prompt reviews
- Review submitted → Notify reviewee
- Forum post reply → Notify author
- Post marked helpful → +5 points to author

---

### 5. Review & Rating

```
Session completed
  ↓
Submit review (1-5 stars + text)
  ↓
Update user aggregate rating
  ↓
Badge shown if ≥ 5 reviews
```

**Reputation**:
- Average rating (1-5)
- Total reviews count
- Helpful contributions

---

### 6. Escrow Locking

```
Accept swap → Lock 50 points
  ↓
If completed within 18h → Release to mentor
  ↓
If not completed → Auto-release to learner after 18h
```

**Safety**: Automated job releases expired escrows hourly

---

### 7. Moderation Workflow

```
Flag forum post
  ↓
Moderator reviews
  ↓
Decision:
  APPROVE → Clear flag
  WARN → Record warning
  SUSPEND → Deactivate user, refund points
  BAN → Permanent ban
```

---

### 8. JWT Authentication

```
Login { username, password }
  ↓
Validate with BCrypt
  ↓
Generate JWT with 12h expiry
  ↓
Client stores + includes in Authorization header
  ↓
Each request: JWT filter validates signature + expiration
  ↓
If expired: Call refresh endpoint for new token
```

**Token Structure**:
```
Header: { "alg": "HS256", "typ": "JWT" }
Payload: { "sub": user_id, "username", "role", "exp": now + 12h }
Signature: HMAC256(header.payload, JWT_SECRET)
```

---

## 📊 State Invariants

**Always True**:
- `total_points = available_points + locked_points`
- `available_points ≥ 0` and `locked_points ≥ 0`
- Every user has exactly one wallet
- `learner_id ≠ mentor_id` in SwapRequest
- Reviews only on completed sessions
- Admin role has all permissions

**Guard Conditions**:
```
Can accept swap?
  ✓ Learner + mentor exist
  ✓ Swap not already accepted
  ✓ Learner has ≥ 50 available points
  ✓ Not swapping with self
  
Can mark complete?
  ✓ Session is ONGOING
  ✓ User is session participant
  
Can review?
  ✓ Session is COMPLETED
  ✓ User is session participant
  ✓ No review yet from user
```

---

## 🔐 CORS & Security

**Development**:
```
Allowed Origins: http://localhost:* (all ports)
Allowed Headers: Content-Type, Authorization
Allowed Methods: GET, POST, PUT, DELETE, PATCH
```

**Production**:
```
Allowed Origins: https://app.skillbridge.dev (specific only)
Enforced via FRONTEND_ORIGINS env var
```

**Password Security**:
- Stored as BCrypt hash (not plaintext)
- Minimum 8 characters enforced
- One-way hashing prevents recovery
