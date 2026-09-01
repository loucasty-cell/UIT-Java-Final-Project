# 🎓 SkillBridge Platform - Complete Architecture & User Journey Demo

**A full-stack peer-to-peer learning and skill exchange platform**

- **Frontend:** React 18 + TypeScript + Vite (Port 3000)
- **Backend:** Spring Boot 3.5 + Java 25 (Port 9095)
- **Database:** PostgreSQL 16 + Flyway (Port 5432)

---

## Project Overview

**SkillBridge** is a peer-to-peer learning marketplace where students exchange knowledge and skills.

**Key Features:**
- 🎯 Browse and discover learning opportunities
- 📅 Book skill exchange sessions with mentors
- 💰 Earn and transfer points for completed sessions
- ⭐ Rate and review mentors
- 🛡️ Dispute resolution for session conflicts
- 📊 Track learning progress and achievements

---

## System Architecture - Multi-Layer Overview

```mermaid
graph TB
    subgraph Frontend["🖥️ Frontend Layer (Port 3000)"]
        RC["React Components"]
        RH["React Hooks"]
        SVC["Service Layer"]
        API["API Client"]
        TM["Token Manager"]
        
        RC --> RH
        RH --> SVC
        SVC --> API
        API --> TM
    end
    
    subgraph Backend["☕ Backend Layer (Port 9095)"]
        CORS["CORS Filter"]
        JWT["JWT Filter"]
        EXC["Exception Handler"]
        CTR["@RestController"]
        CMD["@Service Command"]
        QRY["@Service Query"]
        REP["@Repository"]
        ENT["@Entity"]
        
        JWT --> CORS
        CORS --> CTR
        CTR --> CMD
        CTR --> QRY
        CMD --> REP
        QRY --> REP
        REP --> ENT
    end
    
    subgraph Database["🗄️ Database Layer (Port 5432)"]
        POOL["HikariCP Connection Pool"]
        FLYWAY["Flyway Migrations"]
        PG["PostgreSQL 16"]
        TABLES["35+ Tables"]
        
        POOL --> PG
        FLYWAY --> PG
        PG --> TABLES
    end
    
    API --> JWT
    ENT --> POOL
    
    style Frontend fill:#e1f5ff
    style Backend fill:#fff3e0
    style Database fill:#f3e5f5
```

**Architecture Layers:**
- **Frontend:** React components → React hooks → Services → API Client → Token Manager
- **Backend:** JWT Filter → CORS → Controllers → (Command/Query Services) → Repositories → Entities
- **Database:** Connection Pool ← Flyway Migrations → PostgreSQL → 35+ Tables

**Key Patterns:**
- ✅ **CQRS:** Command services (mutations) separate from Query services (reads)
- ✅ **DTO Pattern:** Entity ↔ DTO mapping for API boundaries
- ✅ **Transactional Safety:** Optimistic & pessimistic locking, escrow patterns
- ✅ **JWT Auth:** 12-hour access tokens + rotating refresh token families
- ✅ **Connection Pooling:** HikariCP for high-performance database access
- ✅ **Flyway Migrations:** 22 versioned schema migrations

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, TanStack Router, Tailwind CSS |
| Backend | Java 25, Spring Boot 3.5, Spring Security, Hibernate JPA |
| Database | PostgreSQL 16, Flyway, HikariCP, UUID |
| Testing | Playwright E2E, JUnit 5, Mockito |

---

## Request Flow Architecture - Complete Request Lifecycle

### Flow 1: Authenticated GET Request

This diagram shows how a GET request flows through all layers:

```mermaid
sequenceDiagram
    participant RC as React Component
    participant SVC as Service Layer
    participant API as apiClient
    participant JWT as JWT Filter
    participant CTR as Controller
    participant SRV as Service
    participant REP as Repository
    participant DB as PostgreSQL
    
    RC->>SVC: walletService.getBalance()
    SVC->>API: apiClient("/api/v1/me/wallet")
    API->>API: getAccessToken() from localStorage
    API->>API: Add Authorization header<br/>Bearer {token}
    API->>JWT: GET /api/v1/me/wallet
    JWT->>JWT: Validate JWT signature
    JWT->>JWT: Extract userId from claims
    JWT->>CTR: Forward to @GetMapping handler
    CTR->>CTR: SecurityUtils.getCurrentUserId()
    CTR->>SRV: walletQueryService.getBalance(userId)
    SRV->>SRV: @Transactional(readOnly=true)
    SRV->>REP: walletRepository.findByUserId(userId)
    REP->>DB: SELECT * FROM wallets<br/>WHERE user_id = ?
    DB-->>REP: Wallet entity
    REP-->>SRV: Wallet entity
    SRV->>SRV: walletMapper.toBalanceResponse(wallet)
    SRV-->>CTR: WalletBalanceResponse DTO
    CTR-->>JWT: ResponseEntity(200 OK)
    JWT-->>API: JSON response body
    API->>API: response.json()
    API-->>SVC: Typed WalletBalanceResponse
    SVC-->>RC: Balance data + Update state
```

**Key Points:**
- Token automatically injected by apiClient from localStorage
- JWT Filter validates signature before routing to controller
- Service layer uses CQRS query service for read-only operations
- Single database query for simple balance lookup
- Response automatically typed by apiClient generic

### Flow 2: Authenticated POST Request with Transaction & Locking

This diagram shows a more complex flow with data modifications and pessimistic locking:

```mermaid
sequenceDiagram
    participant RC as React Component
    participant SVC as Service Layer
    participant API as apiClient
    participant JWT as JWT Filter
    participant CTR as Controller
    participant SRV as Service
    participant REP as Repository
    participant DB as PostgreSQL
    
    RC->>SVC: walletService.transferPoints(data)
    SVC->>API: POST /api/v1/wallet/transfer<br/>{recipientId, amount}
    API->>API: Generate Idempotency-Key
    API->>API: Add Authorization header
    API->>JWT: POST request with body
    JWT->>JWT: Validate token ✓
    JWT->>CTR: @PostMapping handler
    CTR->>CTR: @Valid TransferPointsRequest
    CTR->>SRV: walletService.transferPoints(request)
    SRV->>SRV: @Transactional BEGIN
    SRV->>REP: Lock sender wallet FOR UPDATE
    REP->>DB: SELECT * FROM wallets<br/>WHERE user_id=?<br/>FOR UPDATE NOWAIT
    DB-->>REP: Locked wallet row
    SRV->>SRV: Validate balance >= amount
    SRV->>REP: Deduct from sender
    REP->>DB: UPDATE wallets SET<br/>available_points -= ?
    SRV->>REP: Add to recipient
    REP->>DB: UPDATE wallets SET<br/>available_points += ?
    SRV->>REP: Insert ledger entries
    REP->>DB: INSERT INTO point_ledger (2 rows)
    SRV->>SRV: @Transactional COMMIT
    SRV-->>CTR: TransactionResponse DTO
    CTR-->>JWT: ResponseEntity(200 OK)
    JWT-->>API: JSON response
    API-->>SVC: Success data
    SVC-->>RC: Show success toast
```

**Key Points:**
- Idempotency-Key header ensures duplicate requests are safe
- Pessimistic locking (FOR UPDATE) prevents race conditions
- Single @Transactional boundary ensures ACID properties
- Multiple database operations wrapped in one transaction
- Automatic rollback on any exception

### Flow 3: Token Refresh on 401 Response

This diagram shows how expired tokens are automatically refreshed:

```mermaid
sequenceDiagram
    participant RC as React Component
    participant SVC as Service Layer
    participant API as apiClient
    participant JWT as JWT Filter
    participant CTR as Controller
    participant AUTH as AuthController
    participant TK as TokenService
    participant DB as PostgreSQL
    
    RC->>SVC: Call any endpoint (expired token)
    SVC->>API: apiClient("/api/v1/me/dashboard")
    API->>JWT: GET with expired token
    JWT->>JWT: Validate JWT: EXPIRED ✗
    JWT-->>API: 401 Unauthorized
    
    API->>API: response.status === 401
    API->>API: isRefreshing = true<br/>Queue other requests
    API->>API: getRefreshToken() from localStorage
    API->>AUTH: POST /api/v1/auth/refresh<br/>{refreshToken}
    AUTH->>TK: refreshTokenService.refresh(token)
    TK->>TK: @Transactional BEGIN
    TK->>DB: SELECT * FROM refresh_tokens<br/>WHERE token_hash=?
    DB-->>TK: RefreshToken entity
    TK->>TK: Validate token family
    TK->>TK: Check not revoked
    TK->>TK: Generate new access token (12h)
    TK->>TK: Rotate refresh token (new family)
    TK->>DB: INSERT new refresh token
    TK->>DB: DELETE old refresh token
    TK->>TK: @Transactional COMMIT
    TK-->>AUTH: AuthResponse{accessToken, refreshToken}
    AUTH-->>API: 200 OK
    
    API->>API: setAccessToken(newToken)
    API->>API: setRefreshToken(newToken)
    API->>API: isRefreshing = false
    API->>API: Process queued requests
    
    API->>JWT: Retry GET /api/v1/me/dashboard<br/>Authorization: Bearer {newToken}
    JWT->>JWT: Validate new token ✓
    JWT->>CTR: Forward to handler
    CTR->>CTR: Process request
    CTR-->>API: 200 OK + data
    
    API-->>SVC: Dashboard data
    SVC-->>RC: Render successfully
```

**Key Points:**
- Client automatically detects 401 and initiates token refresh
- Refresh token family prevents token replay attacks
- Old refresh token invalidated immediately on rotation
- Original request is retried with new access token
- Concurrent requests queued until refresh completes
- All token operations within single transaction for consistency

---

## Frontend Service Layer Architecture

The frontend uses a centralized service layer pattern where React components don't call the API directly. Instead, they use typed services that encapsulate API calls, error handling, and data transformation:

```mermaid
graph TB
    subgraph Pages["React Pages"]
        LP["LoginPage"]
        DP["DashboardPage"]
        WP["WalletPage"]
        SP["SessionsPage"]
        EP["ExplorePage"]
    end
    
    subgraph Services["Service Layer"]
        AS["authService"]
        DS["dashboardService"]
        WS["walletService"]
        SSS["sessionsService"]
        SKS["skillsService"]
        MES["mentorsService"]
    end
    
    subgraph Client["API Client Layer"]
        AC["apiClient<T>()"]
        TM["Token Manager"]
        EH["Error Handler"]
    end
    
    LP --> AS
    DP --> DS
    WP --> WS
    SP --> SSS
    EP --> SKS
    EP --> MES
    
    AS --> AC
    DS --> AC
    WS --> AC
    SSS --> AC
    SKS --> AC
    MES --> AC
    
    AC --> TM
    AC --> EH
    
    style Pages fill:#e1f5ff
    style Services fill:#fff3e0
    style Client fill:#f3e5f5
```

**Service-to-Endpoint Mapping:**

| Frontend Service | HTTP Method | Backend Endpoint | Operation |
|------------------|-------------|-----------------|-----------|
| authService.login | POST | /api/v1/auth/login | Authenticate |
| authService.register | POST | /api/v1/auth/register | Create account |
| dashboardService.getDashboard | GET | /api/v1/me/dashboard | Load dashboard |
| walletService.getBalance | GET | /api/v1/me/wallet | Get balance |
| walletService.transferPoints | POST | /api/v1/wallet/transfer | Transfer points |
| sessionsService.listSessions | GET | /api/v1/sessions/me | List sessions |
| sessionsService.completeSession | POST | /api/v1/sessions/{id}/completion-confirmations | Complete |
| skillsService.getMySkills | GET | /api/v1/me/skills | Get skills |
| mentorsService.findMentorsBySkill | GET | /api/v1/users?skillId=xxx | Find mentors |

**API Client Features:**
- ✅ Automatic token injection from localStorage
- ✅ Automatic 401 token refresh and retry
- ✅ Request queuing during token refresh
- ✅ Idempotency-Key generation
- ✅ Type-safe generic responses
- ✅ Mock API fallback for dev mode

---

## Backend Service Dependencies

The backend services follow a layered architecture where controllers route requests to either command (mutation) or query (read-only) services, which may call other services:

```mermaid
graph TB
    subgraph Controllers["@RestController"]
        SC["SwapController"]
        SSC["SessionController"]
        WC["WalletController"]
        ADC["AdminDisputeController"]
    end
    
    subgraph Services["@Service (Command & Query)"]
        SS["SwapService"]
        SES["SessionService"]
        WS["WalletService"]
        NS["NotificationService"]
        MS["MilestoneService"]
        ADS["AdminDisputeService"]
    end
    
    subgraph Repos["@Repository"]
        SWR["SwapRepository"]
        SR["SessionRepository"]
        WR["WalletRepository"]
        DR["DisputeRepository"]
    end
    
    SC --> SS
    SSC --> SES
    WC --> WS
    ADC --> ADS
    
    SS -.->|holdPoints| WS
    SS -.->|notify| NS
    SS -.->|track| MS
    SES -.->|releasePoints| WS
    SES -.->|notify| NS
    ADS -.->|refundEscrow| WS
    
    SS --> SWR
    SES --> SR
    WS --> WR
    ADS --> DR
    
    style Controllers fill:#e3f2fd
    style Services fill:#fff3e0
    style Repos fill:#f3e5f5
```

**Key Service Interactions:**

1. **SwapService → WalletService:** When swap proposal accepted, holds points in escrow via `holdPoints()`
2. **SessionService → WalletService:** On session completion, releases escrow to mentor via `releasePoints()`
3. **All Services → NotificationService:** Notify users of state changes (fire-and-forget)
4. **SwapService/SessionService → MilestoneService:** Track achievements (e.g., "Complete 5 sessions")
5. **AdminDisputeService → WalletService:** On dispute resolution, refund or release escrow

**Transaction Propagation:**
- Command services use `@Transactional` (REQUIRED)
- WalletService uses `REQUIRES_NEW` to commit immediately
- NotificationService failures don't rollback (async pattern)

---

## Core Database Tables
**Skills:** skills, user_skills
**Wallet:** wallets, point_ledger, escrows
**Sessions:** swap_requests, swap_sessions, session_confirmations
**Admin:** reports, disputes, admin_audit_events

---

## Backend Layered Architecture

```
HTTP Request
    ↓
@RestController (API Layer)
    ↓ @Valid DTO validation
@Service Layer (Business Logic)
    ↓ @Transactional
@Repository (Spring Data JPA)
    ↓ Hibernate ORM
PostgreSQL Database
    ↓
JSON Response
```

**Key Patterns:**
- ✅ CQRS: Command & Query services separated
- ✅ DTO Pattern: Entity ↔ DTO mapping
- ✅ Optimistic Locking: @Version for concurrency
- ✅ Pessimistic Locking: SELECT FOR UPDATE for wallets
- ✅ Escrow Pattern: Safe payment transfers

---

## API Endpoints Overview

### Authentication
- `POST /api/v1/auth/register` - Create account
- `POST /api/v1/auth/login` - Login with credentials
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout & revoke tokens

### User Profile
- `GET /api/v1/me` - Get authenticated user
- `PATCH /api/v1/me` - Update profile
- `GET /api/v1/me/dashboard` - Get dashboard data
- `GET /api/v1/users/{id}/profile` - Get public profile

### Wallet Management
- `GET /api/v1/me/wallet` - Get wallet balance
- `GET /api/v1/me/wallet/transactions` - Transaction history (paginated)
- `GET /api/v1/me/wallet/transactions.csv` - Export CSV
- `POST /api/v1/wallet/transfer` - Transfer points to user

### Skills
- `GET /api/v1/skills` - List all skills
- `GET /api/v1/skills/search?q=Java` - Search skills
- `POST /api/v1/skills` - Create new skill
- `GET /api/v1/me/skills` - Get user's skills
- `POST /api/v1/me/skills` - Add skill to portfolio
- `DELETE /api/v1/me/skills/{id}` - Remove skill

### Sessions
- `GET /api/v1/sessions/me` - Get user sessions
- `GET /api/v1/sessions/active/me` - Get active sessions
- `GET /api/v1/sessions/{id}` - Get session details
- `POST /api/v1/sessions/{id}/start` - Start session
- `POST /api/v1/sessions/{id}/complete` - Complete session
- `POST /api/v1/sessions/{id}/completion-confirmations` - Confirm completion
- `PATCH /api/v1/sessions/{id}` - Update session
- `POST /api/v1/sessions/{id}/dispute` - Open dispute

### Admin
- `GET /api/v1/admin/dashboard` - Admin statistics
- `GET /api/v1/admin/reports` - Moderation reports
- `GET /api/v1/admin/disputes` - Disputes queue
- `PATCH /api/v1/admin/disputes/{id}` - Resolve dispute
- `GET /api/v1/admin/audit-events` - Audit log

---

## JWT Authentication Flow

```mermaid
flowchart TD
    A["User submits email+password"] --> B["POST /api/v1/auth/login"]
    B --> C["AuthService validates credentials"]
    C --> D{"Match?"}
    D -->|No| E["401 Unauthorized"]
    D -->|Yes| F["Generate JWT access token<br/>(12 hours, HS256)"]
    F --> G["Generate refresh token<br/>(7 days, hashed)"]


---

## User Journey Flows

### Journey 1: New User Registration & Onboarding

```mermaid
sequenceDiagram
    participant Browser as Browser
    participant RC as RegisterPage
    participant AS as authService
    participant API as apiClient
    participant CTR as AuthController
    participant SRVR as AuthService
    participant UR as UserRepository
    participant WR as WalletRepository
    participant DB as PostgreSQL
    
    Browser->>RC: Navigate to signup
    RC->>RC: Render form
    Browser->>RC: Enter email, password, name
    RC->>AS: authService.register(data)
    
    AS->>API: POST /api/v1/auth/register
    API->>CTR: @PostMapping with body
    CTR->>CTR: @Valid RegisterRequest validation
    CTR->>SRVR: authService.register(request)
    
    SRVR->>SRVR: @Transactional BEGIN
    SRVR->>SRVR: BCrypt.encode(password)
    SRVR->>UR: userRepository.save(user)
    UR->>DB: INSERT INTO users (email, password_hash, name)
    DB-->>UR: user_id generated (UUID)
    
    SRVR->>WR: walletRepository.save(wallet)
    WR->>DB: INSERT INTO wallets (user_id, available_points=30)
    
    SRVR->>DB: INSERT INTO point_ledger (bonus transaction)
    
    SRVR->>SRVR: Generate JWT access token (12h)
    SRVR->>SRVR: Generate refresh token + hash
    SRVR->>DB: INSERT INTO refresh_tokens
    
    SRVR->>SRVR: @Transactional COMMIT
    SRVR-->>CTR: AuthResponse{access, refresh}
    CTR-->>API: 201 Created
    
    API->>API: setAccessToken(token)
    API->>API: setRefreshToken(token)
    API-->>AS: AuthResponse
    
    AS-->>RC: Success + redirect to dashboard
```

**Key Points:**
- Email uniqueness validated (database constraint)
- Password hashed with BCrypt before storage
- Wallet created with 30 bonus points automatically
- Point ledger entry records bonus transaction
- JWT tokens (12-hour access, 7-day refresh) generated
- Refresh token family established for future rotations
- All operations in single @Transactional boundary
- Automatic rollback if any step fails

### Journey 2: User Login & Token Management

```mermaid
sequenceDiagram
    participant Browser as Browser
    participant LP as LoginPage
    participant AS as authService
    participant API as apiClient
    participant CTR as AuthController
    participant SRVR as AuthService
    participant UR as UserRepository
    participant TR as TokenRepository
    participant DB as PostgreSQL
    
    Browser->>LP: Navigate to login
    LP->>LP: Render login form
    Browser->>LP: Enter email + password
    LP->>AS: authService.login(email, password)
    
    AS->>API: POST /api/v1/auth/login
    API->>CTR: @PostMapping /login
    CTR->>CTR: @Valid LoginRequest
    CTR->>SRVR: authService.authenticate(email, password)
    
    SRVR->>UR: userRepository.findByEmail(email)
    UR->>DB: SELECT * FROM users WHERE email = ?
    DB-->>UR: User entity (or null)
    
    SRVR->>SRVR: BCrypt.matches(password, hash)
    SRVR->>SRVR: Password valid? ✓
    
    SRVR->>SRVR: Generate JWT access token<br/>(HS256, 12-hour expiry)
    SRVR->>SRVR: Include claims: userId, email, roles
    
    SRVR->>SRVR: Generate refresh token<br/>(create new family)
    SRVR->>SRVR: Hash refresh token (SHA-256)
    SRVR->>TR: Insert refresh token family
    TR->>DB: INSERT INTO refresh_tokens<br/>(family_id, token_hash, expiry=7d)
    
    SRVR-->>CTR: AuthResponse{accessToken, refreshToken}
    CTR-->>API: 200 OK
    
    API->>API: setAccessToken(accessToken)
    API->>API: setRefreshToken(refreshToken)
    API->>API: localStorage.setItem('token', accessToken)
    API-->>AS: AuthResponse
    
    AS-->>LP: Success
    LP->>LP: Navigate to dashboard
    Browser->>Browser: Load dashboard page
```

**Key Points:**
- Email lookup (indexed for performance)
- Password validated via BCrypt comparison
- Access token valid for 12 hours
- Refresh token valid for 7 days
- Refresh token family prevents replay attacks
- Both tokens stored in localStorage
- Subsequent requests include access token in Authorization header



### Journey 3: Browse Skills & Find Mentors

```mermaid
sequenceDiagram
    participant Browser as Browser
    participant ExplorePage as ExplorePage
    participant SkillService as skillsService
    participant MentorService as mentorsService
    participant API as apiClient
    participant CTR as SkillController
    participant SRVR as SkillQueryService
    participant REP as SkillRepository
    participant DB as PostgreSQL
    
    Browser->>ExplorePage: Navigate to Explore
    ExplorePage->>SkillService: skillsService.getAllSkills()
    
    SkillService->>API: GET /api/v1/skills
    API->>CTR: @GetMapping /skills
    CTR->>SRVR: skillQueryService.getAll()
    SRVR->>SRVR: @Transactional(readOnly=true)
    SRVR->>REP: skillRepository.findAll()
    REP->>DB: SELECT * FROM skills
    DB-->>REP: List<Skill>
    REP-->>SRVR: Skill entities
    SRVR->>SRVR: Map to SkillResponse DTOs
    SRVR-->>CTR: List<SkillResponse>
    CTR-->>API: 200 OK
    API-->>SkillService: List<SkillDTO>
    SkillService-->>ExplorePage: Update skills state
    ExplorePage->>ExplorePage: Render skills grid
    
    Browser->>ExplorePage: Type in search box
    ExplorePage->>SkillService: skillsService.searchSkills(query)
    
    SkillService->>API: GET /api/v1/skills/search?q=Java
    API->>CTR: Route to search endpoint
    CTR->>SRVR: skillQueryService.search("Java")
    SRVR->>REP: Custom query: ILIKE search
    REP->>DB: SELECT * FROM skills<br/>WHERE name ILIKE '%Java%'
    DB-->>REP: Matching skills
    REP-->>SRVR: Results
    SRVR-->>CTR: SkillResponse list
    CTR-->>API: 200 OK
    API-->>SkillService: Filtered results
    SkillService-->>ExplorePage: Update UI
    
    Browser->>ExplorePage: Click on "Java" skill
    ExplorePage->>MentorService: mentorsService.findMentorsBySkill(skillId)
    
    MentorService->>API: GET /api/v1/users?skillId=xyz
    API->>CTR: Route to user search
    CTR->>SRVR: userQueryService.findBySkill(skillId)
    SRVR->>REP: Find users with this skill
    REP->>DB: SELECT u.* FROM users u<br/>JOIN user_skills us ON u.id = us.user_id<br/>WHERE us.skill_id = ?
    DB-->>REP: User entities with skill
    REP-->>SRVR: Users list
    SRVR->>SRVR: Calculate mentor ratings
    SRVR->>SRVR: Map to UserProfileResponse
    SRVR-->>CTR: List<UserProfile>
    CTR-->>API: 200 OK
    API-->>MentorService: Mentor list
    MentorService-->>ExplorePage: Update mentors list
    ExplorePage->>ExplorePage: Render mentor cards
```

**Key Points:**
- Skills fetched on page load (cached client-side)
- Search uses PostgreSQL ILIKE for case-insensitive matching
- Mentor discovery joins users with user_skills table
- Mentor ratings calculated on backend
- All queries read-only for performance
- No locking needed for read operations


### Journey 4: Session Request & Booking with Escrow

```mermaid
sequenceDiagram
    participant Browser as Browser
    participant MentorProfile as MentorProfile
    participant SwapService as swapsService
    participant WalletService as walletService
    participant API as apiClient
    participant CTR as SwapController
    participant SRVR as SwapService
    participant WS as WalletService
    participant SWR as SwapRepository
    participant WR as WalletRepository
    participant DB as PostgreSQL
    
    Browser->>MentorProfile: Click "Request Session"
    MentorProfile->>MentorProfile: Open booking modal
    Browser->>MentorProfile: Select skill, date, time
    MentorProfile->>SwapService: swapsService.createRequest(mentorId, data)
    
    SwapService->>API: POST /api/v1/swap-requests<br/>{mentorId, skillId, proposedDate}
    API->>API: Add Idempotency-Key header
    API->>CTR: @PostMapping /swap-requests
    CTR->>CTR: @Valid SwapRequestDTO
    CTR->>SRVR: swapService.createRequest(request)
    
    SRVR->>SRVR: @Transactional BEGIN
    SRVR->>SRVR: Get current userId
    SRVR->>SRVR: Create SwapRequest entity
    SRVR->>SRVR: status = PENDING
    SRVR->>SWR: swapRepository.save(request)
    SWR->>DB: INSERT INTO swap_requests<br/>(learner_id, mentor_id, status, skill_id...)
    DB-->>SWR: Generated request_id
    
    SRVR->>WS: walletService.holdPoints(mentorId, 50)
    WS->>WS: @Transactional(REQUIRES_NEW)
    WS->>WR: Lock mentor wallet FOR UPDATE
    WR->>DB: SELECT * FROM wallets<br/>WHERE user_id=?<br/>FOR UPDATE NOWAIT
    DB-->>WR: Locked wallet
    WS->>WS: Verify available_points >= 50
    WS->>WR: Create escrow entry
    WR->>DB: INSERT INTO escrows<br/>(user_id, amount, request_id, status=HELD)
    WS->>WR: Reduce wallet available_points
    WR->>DB: UPDATE wallets SET available_points -= 50
    WS->>WR: Record ledger entry
    WR->>DB: INSERT INTO point_ledger (HOLD transaction)
    WS->>SRVR: Escrow created
    
    SRVR->>SRVR: @Transactional COMMIT
    SRVR-->>CTR: SwapRequestResponse{requestId, status=PENDING}
    CTR-->>API: 201 Created
    API-->>SwapService: Request created
    SwapService-->>MentorProfile: Show "Waiting for mentor..."
    
    par Async Notification
        SRVR->>SRVR: Call NotificationService (async)
        Note over SRVR: Send email to mentor
    end
    
    Browser->>Browser: Wait for mentor acceptance
    Browser->>SwapService: Poll GET /api/v1/swap-requests/{id}
    SwapService->>API: GET request
    API->>CTR: Route to detail endpoint
    CTR->>SRVR: Get request status
    SRVR->>SWR: swapRepository.findById(id)
    SWR->>DB: SELECT * FROM swap_requests WHERE id=?
    DB-->>SWR: PENDING status
    SWR-->>SRVR: SwapRequest
    SRVR-->>CTR: Response{status=PENDING}
    CTR-->>API: 200 OK
    API-->>SwapService: Still pending...
```

**Key Points:**
- Swap request created with PENDING status
- Points immediately held in escrow (pessimistic)
- Mentor receives notification email
- Learner polls for mentor acceptance
- Escrow prevents mentor from spending held points
- All operations in single transaction boundary
- Idempotency-Key prevents duplicate requests


### Journey 5: Wallet & Point Transfer with Pessimistic Locking

```mermaid
sequenceDiagram
    participant Browser as Browser
    participant WalletPage as WalletPage
    participant WalletService as walletService
    participant API as apiClient
    participant CTR as WalletController
    participant SRVR as WalletService
    participant WR as WalletRepository
    participant LR as LedgerRepository
    participant DB as PostgreSQL
    
    Browser->>WalletPage: Navigate to Wallet
    WalletPage->>WalletService: walletService.getBalance()
    WalletService->>API: GET /api/v1/me/wallet
    API->>CTR: @GetMapping /wallet
    CTR->>SRVR: walletQueryService.getBalance(userId)
    SRVR->>SRVR: @Transactional(readOnly=true)
    SRVR->>WR: walletRepository.findByUserId(userId)
    WR->>DB: SELECT * FROM wallets WHERE user_id=?
    DB-->>WR: Wallet{available=500, reserved=100}
    WR-->>SRVR: Wallet entity
    SRVR->>SRVR: Map to BalanceResponse DTO
    SRVR-->>CTR: BalanceResponse{available=500, reserved=100}
    CTR-->>API: 200 OK
    API-->>WalletService: Balance data
    WalletService-->>WalletPage: Update state
    WalletPage->>WalletPage: Render wallet card
    
    Browser->>WalletPage: Click "Transfer Points"
    WalletPage->>WalletPage: Open transfer modal
    Browser->>WalletPage: Enter recipientId=xyz, amount=100
    WalletPage->>WalletService: walletService.transferPoints(data)
    
    WalletService->>API: POST /api/v1/wallet/transfer<br/>{recipientId, amount}
    API->>API: Generate Idempotency-Key UUID
    API->>API: Add Authorization: Bearer {token}
    API->>CTR: @PostMapping /transfer
    CTR->>CTR: @Valid TransferRequest
    CTR->>SRVR: walletService.transferPoints(request)
    
    SRVR->>SRVR: @Transactional BEGIN
    SRVR->>SRVR: Get current userId
    SRVR->>SRVR: Validate amount > 0
    SRVR->>SRVR: Validate recipientId exists
    
    Note over SRVR,DB: PESSIMISTIC LOCKING
    SRVR->>WR: Lock sender wallet FOR UPDATE
    WR->>DB: SELECT * FROM wallets<br/>WHERE user_id=?<br/>FOR UPDATE NOWAIT
    DB-->>WR: Locked wallet row
    SRVR->>SRVR: Check available >= 100
    SRVR->>SRVR: available=500, OK ✓
    
    SRVR->>WR: Update sender wallet
    WR->>DB: UPDATE wallets SET<br/>available_points -= 100<br/>WHERE user_id=?
    
    SRVR->>WR: Lock recipient wallet
    WR->>DB: SELECT * FROM wallets<br/>WHERE user_id=?<br/>FOR UPDATE NOWAIT
    DB-->>WR: Locked wallet row
    
    SRVR->>WR: Update recipient wallet
    WR->>DB: UPDATE wallets SET<br/>available_points += 100<br/>WHERE user_id=?
    
    SRVR->>LR: Record ledger entries
    LR->>DB: INSERT INTO point_ledger<br/>(type=TRANSFER_OUT, amount=-100,<br/>sender_id, timestamp)
    LR->>DB: INSERT INTO point_ledger<br/>(type=TRANSFER_IN, amount=+100,<br/>recipient_id, timestamp)
    
    SRVR->>SRVR: @Transactional COMMIT
    DB-->>SRVR: COMMIT successful
    SRVR-->>CTR: TransactionResponse{txId, status=SUCCESS}
    CTR-->>API: 200 OK
    API-->>WalletService: Transaction confirmed
    WalletService-->>WalletPage: Show success toast
    
    Browser->>WalletPage: Click "View History"
    WalletPage->>WalletService: walletService.getTransactions()
    WalletService->>API: GET /api/v1/me/wallet/transactions
    API->>CTR: @GetMapping /transactions
    CTR->>SRVR: walletQueryService.getTransactions(userId)
    SRVR->>LR: ledgerRepository.findByUserId(userId)
    LR->>DB: SELECT * FROM point_ledger<br/>WHERE user_id=?<br/>ORDER BY timestamp DESC<br/>LIMIT 50
    DB-->>LR: List<LedgerEntry>
    LR-->>SRVR: Ledger entries
    SRVR->>SRVR: Map to TransactionResponse DTOs
    SRVR-->>CTR: List<Transaction>
    CTR-->>API: 200 OK
    API-->>WalletService: Transaction list
    WalletService-->>WalletPage: Update transactions table
```

**Key Points:**
- Pessimistic locking (FOR UPDATE NOWAIT) prevents concurrent transfers
- Both sender and recipient wallets locked in sequence
- All point operations wrapped in single transaction
- If either wallet unavailable, NOWAIT causes immediate exception
- Ledger entries created for audit trail
- Idempotency-Key ensures safe retries
- Transaction history queries read-only


### Journey 6: Session Lifecycle - Start, Complete, and Confirmation

```mermaid
sequenceDiagram
    participant Browser as Browser
    participant SessionPage as SessionPage
    participant SessionService as sessionsService
    participant WalletService as walletService
    participant API as apiClient
    participant CTR as SessionController
    participant SRVR as SessionService
    participant SR as SessionRepository
    participant WR as WalletRepository
    participant DB as PostgreSQL
    
    Browser->>SessionPage: Navigate to active sessions
    SessionPage->>SessionService: sessionsService.getActiveSessions()
    SessionService->>API: GET /api/v1/sessions/active/me
    API->>CTR: @GetMapping /active
    CTR->>SRVR: sessionQueryService.getActiveSessions(userId)
    SRVR->>SR: sessionRepository.findActiveByUserId(userId)
    SR->>DB: SELECT * FROM swap_sessions<br/>WHERE status IN (SCHEDULED, IN_PROGRESS)
    DB-->>SR: List<SwapSession>
    SR-->>SRVR: Sessions
    SRVR-->>CTR: List<SessionResponse>
    CTR-->>API: 200 OK
    API-->>SessionService: Active sessions
    SessionService-->>SessionPage: Update sessions list
    
    Browser->>SessionPage: Mentor clicks "Start Session"
    SessionPage->>SessionService: sessionsService.startSession(sessionId)
    
    SessionService->>API: POST /api/v1/sessions/{id}/start
    API->>CTR: @PostMapping /{id}/start
    CTR->>SRVR: sessionService.startSession(sessionId, userId)
    
    SRVR->>SRVR: @Transactional BEGIN
    SRVR->>SR: sessionRepository.findById(sessionId)
    SR->>DB: SELECT * FROM swap_sessions WHERE id=?
    DB-->>SR: Session{status=SCHEDULED}
    SRVR->>SRVR: Verify userId is mentor
    SRVR->>SRVR: status = IN_PROGRESS
    SRVR->>SRVR: start_time = now()
    SRVR->>SR: sessionRepository.save(session)
    SR->>DB: UPDATE swap_sessions SET<br/>status='IN_PROGRESS', start_time=?
    SRVR->>SRVR: @Transactional COMMIT
    SRVR-->>CTR: SessionResponse{status=IN_PROGRESS}
    CTR-->>API: 200 OK
    API-->>SessionService: Session started
    SessionService-->>SessionPage: Show "Session in progress"
    
    Note over Browser: 1 hour session runs...
    
    Browser->>SessionPage: Mentor clicks "Complete Session"
    SessionPage->>SessionService: sessionsService.completeSession(sessionId)
    
    SessionService->>API: POST /api/v1/sessions/{id}/complete
    API->>CTR: @PostMapping /{id}/complete
    CTR->>SRVR: sessionService.completeSession(sessionId, userId)
    
    SRVR->>SRVR: @Transactional BEGIN
    SRVR->>SR: sessionRepository.findById(sessionId)
    SR->>DB: SELECT * FROM swap_sessions WHERE id=?
    DB-->>SR: Session{status=IN_PROGRESS}
    SRVR->>SRVR: Verify mentor
    SRVR->>SRVR: status = AWAITING_CONFIRMATION
    SRVR->>SRVR: end_time = now()
    SRVR->>SR: sessionRepository.save(session)
    SR->>DB: UPDATE swap_sessions SET<br/>status='AWAITING_CONFIRMATION', end_time=?
    SRVR->>SRVR: @Transactional COMMIT
    SRVR-->>CTR: SessionResponse{status=AWAITING_CONFIRMATION}
    CTR-->>API: 200 OK
    
    API->>API: Send notification to learner
    API-->>SessionService: Session marked complete
    SessionService-->>SessionPage: Waiting for learner confirmation...
    
    Browser->>SessionPage: Learner clicks "Confirm Completion"
    SessionPage->>SessionService: sessionsService.confirmCompletion(sessionId)
    
    SessionService->>API: POST /api/v1/sessions/{id}/completion-confirmations<br/>{confirmed: true}
    API->>CTR: @PostMapping /{id}/completion-confirmations
    CTR->>SRVR: sessionService.confirmCompletion(sessionId, userId)
    
    SRVR->>SRVR: @Transactional BEGIN
    SRVR->>SR: sessionRepository.findById(sessionId)
    SR->>DB: SELECT * FROM swap_sessions WHERE id=?
    DB-->>SR: Session{status=AWAITING_CONFIRMATION}
    SRVR->>SRVR: Both confirmed? (count=2)
    
    SRVR->>WalletService: walletService.releasePoints(mentorId, 50)
    WalletService->>WalletService: @Transactional(REQUIRES_NEW)
    WalletService->>WR: Lock mentor wallet
    WR->>DB: SELECT * FROM wallets<br/>WHERE user_id=? FOR UPDATE
    WalletService->>WR: Release escrow to available
    WR->>DB: UPDATE wallets SET available_points += 50
    WalletService->>WR: Update ledger
    WR->>DB: INSERT INTO point_ledger (RELEASE transaction)
    WalletService->>SRVR: Escrow released
    
    SRVR->>SRVR: status = COMPLETED
    SRVR->>SR: sessionRepository.save(session)
    SR->>DB: UPDATE swap_sessions SET status='COMPLETED'
    SRVR->>SRVR: @Transactional COMMIT
    SRVR-->>CTR: SessionResponse{status=COMPLETED}
    CTR-->>API: 200 OK
    API-->>SessionService: Session completed
    SessionService-->>SessionPage: Show completion success
```

**Key Points:**
- Sessions start with SCHEDULED status
- Mentor clicks "Start" → IN_PROGRESS
- Mentor clicks "Complete" → AWAITING_CONFIRMATION
- Learner confirms → COMPLETED
- Escrow released to mentor on completion
- Both parties must confirm within 18 hours or dispute is opened
- All state transitions in single transaction


### Journey 7: Dispute Resolution - Admin Workflow

```mermaid
sequenceDiagram
    participant Browser as Browser
    participant SessionPage as SessionPage
    participant SessionService as sessionsService
    participant API as apiClient
    participant CTR as DisputeController
    participant SRVR as AdminDisputeService
    participant WS as WalletService
    participant DR as DisputeRepository
    participant SR as SessionRepository
    participant DB as PostgreSQL
    
    Note over Browser: 18 hours after session marked complete...
    Browser->>SessionPage: Session still unconfirmed
    
    Note over SRVR: Background job detects timeout
    SRVR->>SR: Find sessions older than 18h unconfirmed
    SR->>DB: SELECT * FROM swap_sessions<br/>WHERE status='AWAITING_CONFIRMATION'<br/>AND end_time < now() - 18h
    DB-->>SR: List of timed-out sessions
    
    SRVR->>SRVR: For each timed-out session:
    SRVR->>DR: Create dispute
    DR->>DB: INSERT INTO disputes<br/>(session_id, status=AUTO_OPENED,<br/>reason='18h_timeout')
    
    Browser->>SessionPage: Manually open dispute
    SessionPage->>SessionService: sessionsService.openDispute(sessionId)
    SessionService->>API: POST /api/v1/sessions/{id}/dispute<br/>{reason: "Mentor didn't show"}
    
    API->>CTR: @PostMapping /{id}/dispute
    CTR->>CTR: @Valid DisputeRequest
    CTR->>SRVR: adminDisputeService.openDispute(request)
    
    SRVR->>SRVR: @Transactional BEGIN
    SRVR->>SR: sessionRepository.findById(sessionId)
    SR->>DB: SELECT * FROM swap_sessions WHERE id=?
    DB-->>SR: Session{status=AWAITING_CONFIRMATION}
    
    SRVR->>DR: Create dispute
    DR->>DB: INSERT INTO disputes<br/>(session_id, learner_reason, status=OPEN)
    
    SRVR->>SRVR: @Transactional COMMIT
    SRVR-->>CTR: DisputeResponse{disputeId, status=OPEN}
    CTR-->>API: 201 Created
    API-->>SessionService: Dispute opened
    SessionService-->>SessionPage: Show "Dispute opened, awaiting admin review"
    
    par Admin Notification
        SRVR->>SRVR: Send email to admins
        Note over SRVR: "New dispute #xyz needs review"
    end
    
    Note over Browser: Admin portal
    Browser->>Browser: Admin logs in
    Browser->>Browser: Navigate to Disputes Queue
    Browser->>API: GET /api/v1/admin/disputes?status=OPEN
    API->>CTR: @GetMapping /disputes
    CTR->>SRVR: adminQueryService.getOpenDisputes()
    SRVR->>DR: disputeRepository.findByStatus(OPEN)
    DR->>DB: SELECT * FROM disputes WHERE status='OPEN'
    DB-->>DR: List<Dispute>
    DR-->>SRVR: Disputes
    SRVR->>SRVR: Enrich with session details
    SRVR-->>CTR: List<DisputeResponse>
    CTR-->>API: 200 OK
    API->>Browser: Display disputes queue
    
    Browser->>Browser: Click dispute to review
    Browser->>API: GET /api/v1/admin/disputes/{disputeId}
    API->>CTR: @GetMapping /{disputeId}
    CTR->>SRVR: Get dispute details
    SRVR->>DR: disputeRepository.findById(disputeId)
    DR->>DB: SELECT * FROM disputes WHERE id=?
    DB-->>DR: Dispute with session details
    DR-->>SRVR: Dispute
    SRVR->>SRVR: Load mentor notes, learner reason
    SRVR-->>CTR: Full DisputeResponse
    CTR-->>API: 200 OK
    API->>Browser: Show dispute details
    
    Browser->>Browser: Admin selects resolution: "Refund learner"
    Browser->>API: PATCH /api/v1/admin/disputes/{disputeId}<br/>{resolution: REFUND_LEARNER}
    API->>CTR: @PatchMapping /{disputeId}
    CTR->>CTR: @Valid ResolutionRequest
    CTR->>SRVR: adminDisputeService.resolve(request)
    
    SRVR->>SRVR: @Transactional BEGIN
    SRVR->>DR: Load dispute
    DR->>DB: SELECT * FROM disputes WHERE id=?
    DB-->>DR: Dispute{resolution=null}
    
    Note over SRVR,DB: REFUND ESCROW TO LEARNER
    SRVR->>WS: walletService.refundEscrow(learnerId, 50)
    WS->>WS: @Transactional(REQUIRES_NEW)
    WS->>DB: SELECT * FROM wallets WHERE user_id=?<br/>FOR UPDATE
    WS->>DB: UPDATE wallets SET available_points += 50
    WS->>DB: INSERT INTO point_ledger (REFUND transaction)
    WS->>SRVR: Refund complete
    
    SRVR->>DR: Update dispute
    DR->>DB: UPDATE disputes SET<br/>resolution='REFUND_LEARNER',<br/>resolved_by=admin_id,<br/>resolved_at=now()
    
    SRVR->>SR: sessionRepository.save(session)
    SR->>DB: UPDATE swap_sessions SET status='DISPUTED_RESOLVED'
    
    SRVR->>DB: INSERT INTO admin_audit_events<br/>(action='DISPUTE_RESOLVED',<br/>admin_id, dispute_id, resolution)
    
    SRVR->>SRVR: @Transactional COMMIT
    SRVR-->>CTR: DisputeResponse{resolution=REFUND_LEARNER}
    CTR-->>API: 200 OK
    
    API->>API: Send email to learner: "Dispute resolved, 50 points refunded"
    API->>API: Send email to mentor: "Dispute ruled against you"
    API-->>Browser: Show resolution success
```

**Key Points:**
- Disputes auto-open after 18 hours of unconfirmed sessions
- Users can manually open disputes with reason
- Admin reviews full dispute details including notes
- Resolution options: REFUND_LEARNER, RELEASE_MENTOR, SPLIT, CANCEL
- Escrow released/refunded based on resolution
- All actions logged in audit_events table
- Both users notified of resolution


### Journey 8: Skill Management - CRUD Operations

```mermaid
sequenceDiagram
    participant Browser as Browser
    participant SkillsPage as SkillsPage
    participant SkillService as skillsService
    participant API as apiClient
    participant CTR as SkillController
    participant SRVR as SkillService
    participant USR as UserSkillRepository
    participant SR as SkillRepository
    participant DB as PostgreSQL
    
    Browser->>SkillsPage: Navigate to "My Skills"
    SkillsPage->>SkillService: skillsService.getMySkills()
    
    SkillService->>API: GET /api/v1/me/skills
    API->>CTR: @GetMapping /me/skills
    CTR->>SRVR: skillQueryService.getUserSkills(userId)
    SRVR->>SRVR: @Transactional(readOnly=true)
    SRVR->>USR: userSkillRepository.findByUserId(userId)
    USR->>DB: SELECT * FROM user_skills<br/>WHERE user_id = ?
    DB-->>USR: List<UserSkill>
    USR-->>SRVR: UserSkill entities
    SRVR->>SRVR: Map to SkillResponse DTOs
    SRVR-->>CTR: List<SkillResponse>
    CTR-->>API: 200 OK
    API-->>SkillService: Skills list
    SkillService-->>SkillsPage: Update skills state
    SkillsPage->>SkillsPage: Render skills cards
    
    Browser->>SkillsPage: Click "Add Skill"
    SkillsPage->>SkillsPage: Open add modal
    Browser->>SkillsPage: Select "Java" + Proficiency "EXPERT"
    SkillsPage->>SkillService: skillsService.addSkill(skillId, proficiency)
    
    SkillService->>API: POST /api/v1/me/skills<br/>{skillId, proficiency}
    API->>CTR: @PostMapping /me/skills
    CTR->>CTR: @Valid AddSkillRequest
    CTR->>SRVR: skillService.addUserSkill(userId, request)
    
    SRVR->>SRVR: @Transactional BEGIN
    SRVR->>SRVR: Validate skillId exists
    SRVR->>USR: Check not already added
    USR->>DB: SELECT * FROM user_skills<br/>WHERE user_id=? AND skill_id=?
    DB-->>USR: null (doesn't exist)
    
    SRVR->>USR: Create UserSkill entity
    SRVR->>USR: userSkillRepository.save(userSkill)
    USR->>DB: INSERT INTO user_skills<br/>(user_id, skill_id, proficiency_level)
    DB-->>USR: user_skill_id generated
    
    SRVR->>DB: UPDATE users SET updated_at=now()
    SRVR->>SRVR: @Transactional COMMIT
    SRVR-->>CTR: SkillResponse{skillId, proficiency}
    CTR-->>API: 201 Created
    API-->>SkillService: Skill added
    SkillService-->>SkillsPage: Add to list + show toast
    
    Browser->>SkillsPage: Click "Edit" on Java skill
    SkillsPage->>SkillsPage: Open edit modal with current proficiency
    Browser->>SkillsPage: Change proficiency to "INTERMEDIATE"
    SkillsPage->>SkillService: skillsService.updateSkill(skillId, proficiency)
    
    SkillService->>API: PATCH /api/v1/me/skills/{skillId}<br/>{proficiency}
    API->>CTR: @PatchMapping /me/skills/{skillId}
    CTR->>CTR: @Valid UpdateSkillRequest
    CTR->>SRVR: skillService.updateUserSkill(userId, skillId, request)
    
    SRVR->>SRVR: @Transactional BEGIN
    SRVR->>USR: userSkillRepository.findByUserIdAndSkillId(userId, skillId)
    USR->>DB: SELECT * FROM user_skills<br/>WHERE user_id=? AND skill_id=?
    DB-->>USR: UserSkill{proficiency=EXPERT}
    
    SRVR->>SRVR: Update proficiency field
    SRVR->>SRVR: proficiency = INTERMEDIATE
    SRVR->>USR: userSkillRepository.save(userSkill)
    USR->>DB: UPDATE user_skills SET proficiency_level='INTERMEDIATE'
    
    SRVR->>SRVR: @Transactional COMMIT
    SRVR-->>CTR: SkillResponse{proficiency=INTERMEDIATE}
    CTR-->>API: 200 OK
    API-->>SkillService: Skill updated
    SkillService-->>SkillsPage: Update in list
    
    Browser->>SkillsPage: Click "Delete" on Java skill
    SkillsPage->>SkillsPage: Show confirmation modal
    Browser->>SkillsPage: Confirm delete
    SkillsPage->>SkillService: skillsService.removeSkill(skillId)
    
    SkillService->>API: DELETE /api/v1/me/skills/{skillId}
    API->>CTR: @DeleteMapping /me/skills/{skillId}
    CTR->>SRVR: skillService.removeUserSkill(userId, skillId)
    
    SRVR->>SRVR: @Transactional BEGIN
    SRVR->>USR: userSkillRepository.findByUserIdAndSkillId(userId, skillId)
    USR->>DB: SELECT * FROM user_skills<br/>WHERE user_id=? AND skill_id=?
    DB-->>USR: UserSkill entity
    
    SRVR->>USR: userSkillRepository.delete(userSkill)
    USR->>DB: DELETE FROM user_skills<br/>WHERE user_id=? AND skill_id=?
    
    SRVR->>SRVR: @Transactional COMMIT
    SRVR-->>CTR: Empty response
    CTR-->>API: 204 No Content
    API-->>SkillService: Skill deleted
    SkillService-->>SkillsPage: Remove from list + show toast
```

**Key Points:**
- Skills are managed via user_skills join table
- Proficiency levels: BEGINNER, INTERMEDIATE, EXPERT
- All skill operations are single @Transactional
- Skills affect mentor discoverability (used in user search)
- No cascading deletes - soft delete via archival if needed


### Journey 9: Dashboard - Parallel Data Aggregation

The dashboard loads multiple independent data sources in parallel:

```mermaid
sequenceDiagram
    participant Browser as Browser
    participant DashboardPage as DashboardPage
    participant DashService as dashboardService
    participant API as apiClient
    participant CTR as DashboardController
    participant SRVR as DashboardService
    participant DB as PostgreSQL
    
    Browser->>DashboardPage: Navigate to /dashboard
    DashboardPage->>DashboardPage: Show loading skeleton
    
    Note over DashboardPage: Parallel requests start
    
    par Request 1: Get Wallet Balance
        DashboardPage->>DashService: dashboardService.getBalance()
        DashService->>API: GET /api/v1/me/wallet
        API->>CTR: Route to WalletController
        CTR->>SRVR: walletQueryService.getBalance(userId)
        SRVR->>DB: SELECT * FROM wallets WHERE user_id=?
        DB-->>SRVR: Wallet data
        SRVR-->>API: 200 OK {available: 500}
        API-->>DashService: Balance
    and Request 2: Get Recent Sessions
        DashboardPage->>DashService: dashboardService.getRecentSessions()
        DashService->>API: GET /api/v1/sessions/me?limit=5
        API->>CTR: Route to SessionController
        CTR->>SRVR: sessionQueryService.getRecent(userId, 5)
        SRVR->>DB: SELECT * FROM swap_sessions<br/>WHERE user_id IN (learner, mentor)<br/>ORDER BY created_at DESC LIMIT 5
        DB-->>SRVR: Session list
        SRVR-->>API: 200 OK [sessions...]
        API-->>DashService: Sessions
    and Request 3: Get Pending Requests
        DashboardPage->>DashService: dashboardService.getPendingRequests()
        DashService->>API: GET /api/v1/swap-requests/me?status=PENDING
        API->>CTR: Route to SwapController
        CTR->>SRVR: swapQueryService.getPending(userId)
        SRVR->>DB: SELECT * FROM swap_requests<br/>WHERE mentor_id=? AND status='PENDING'
        DB-->>SRVR: Pending swap requests
        SRVR-->>API: 200 OK [requests...]
        API-->>DashService: Pending requests
    and Request 4: Get Statistics
        DashboardPage->>DashService: dashboardService.getStats()
        DashService->>API: GET /api/v1/me/statistics
        API->>CTR: Route to DashboardController
        CTR->>SRVR: dashboardService.getStats(userId)
        SRVR->>DB: SELECT COUNT(*) as completed_sessions<br/>FROM swap_sessions<br/>WHERE status='COMPLETED'
        DB-->>SRVR: Count data
        SRVR->>DB: SELECT AVG(rating) as avg_rating<br/>FROM reviews WHERE mentor_id=?
        DB-->>SRVR: Rating data
        SRVR->>DB: SELECT SUM(amount) as total_earned<br/>FROM point_ledger<br/>WHERE type='TRANSFER_IN'
        DB-->>SRVR: Earnings data
        SRVR-->>API: 200 OK {sessions: 12, rating: 4.8, earned: 250}
        API-->>DashService: Statistics
    end
    
    Note over DashboardPage: All requests complete
    DashboardPage->>DashboardPage: Combine all data
    DashboardPage->>DashboardPage: Render dashboard sections
    DashboardPage->>DashboardPage: Hide loading skeleton
    Browser->>Browser: Dashboard fully loaded
```

**Key Points:**
- 4 independent parallel requests improve perceived performance
- Client-side Promise.all() or React.useQueries() handles parallelization
- Each endpoint uses read-only transactions for consistency
- Dashboard aggregates data from multiple sources (wallets, sessions, stats)
- Stale data refresh on 30-second interval
- Skeleton loading prevents layout shift while data loads


### Journey 10: Reviews & Ratings

```mermaid
sequenceDiagram
    participant Browser as Browser
    participant ReviewPage as ReviewPage
    participant ReviewService as reviewsService
    participant API as apiClient
    participant CTR as ReviewController
    participant SRVR as ReviewService
    participant RR as ReviewRepository
    participant UR as UserRepository
    participant DB as PostgreSQL
    
    Note over Browser: After session completed
    Browser->>ReviewPage: Navigate to "Rate & Review"
    ReviewPage->>ReviewService: reviewsService.getSession(sessionId)
    ReviewService->>API: GET /api/v1/sessions/{id}
    API->>CTR: Route to SessionController
    CTR->>SRVR: sessionQueryService.getById(sessionId, userId)
    SRVR->>DB: SELECT * FROM swap_sessions WHERE id=?
    DB-->>SRVR: Session details
    SRVR-->>API: 200 OK {mentor_id, learner_id...}
    API-->>ReviewService: Session data
    ReviewService-->>ReviewPage: Display session & form
    
    Browser->>ReviewPage: Fill review form (rating=5, comment="Great mentor!")
    ReviewPage->>ReviewService: reviewsService.submitReview(data)
    
    ReviewService->>API: POST /api/v1/reviews<br/>{sessionId, rating, comment}
    API->>API: Add Idempotency-Key header
    API->>CTR: @PostMapping /reviews
    CTR->>CTR: @Valid ReviewRequest
    CTR->>CTR: Validate rating 1-5
    CTR->>SRVR: reviewService.submitReview(userId, request)
    
    SRVR->>SRVR: @Transactional BEGIN
    SRVR->>SRVR: Verify user participated in session
    SRVR->>RR: Check not already reviewed
    RR->>DB: SELECT * FROM reviews<br/>WHERE session_id=? AND reviewer_id=?
    DB-->>RR: null (not reviewed yet)
    
    SRVR->>RR: Create review
    RR->>DB: INSERT INTO reviews<br/>(session_id, reviewer_id, reviewed_user_id,<br/>rating, comment)
    DB-->>RR: review_id generated
    
    SRVR->>SRVR: Calculate updated average rating
    SRVR->>DB: SELECT AVG(rating) as avg_rating, COUNT(*) as count<br/>FROM reviews WHERE reviewed_user_id=?
    DB-->>SRVR: avg=4.8, count=12
    
    SRVR->>UR: Update user average rating
    UR->>DB: UPDATE users SET<br/>avg_rating=4.8,<br/>review_count=12<br/>WHERE id=?
    
    SRVR->>DB: INSERT INTO point_ledger<br/>(type='REVIEW_BONUS', amount=2,<br/>user_id, session_id)
    
    SRVR->>SRVR: @Transactional COMMIT
    SRVR-->>CTR: ReviewResponse{reviewId, rating=5}
    CTR-->>API: 201 Created
    API-->>ReviewService: Review submitted
    ReviewService-->>ReviewPage: Show success + award points
    
    par Async Update
        SRVR->>SRVR: NotificationService.sendReviewNotification(reviewedUserId)
        Note over SRVR: Email: "You received a 5-star review"
    end
    
    Browser->>ReviewPage: View mentor's profile
    ReviewPage->>ReviewService: reviewsService.getMentorReviews(mentorId)
    ReviewService->>API: GET /api/v1/users/{id}/reviews
    API->>CTR: @GetMapping /{id}/reviews
    CTR->>SRVR: reviewQueryService.getUserReviews(mentorId)
    SRVR->>RR: reviewRepository.findByReviewedUserId(mentorId)
    RR->>DB: SELECT * FROM reviews<br/>WHERE reviewed_user_id=?<br/>ORDER BY created_at DESC
    DB-->>RR: List<Review>
    RR-->>SRVR: Reviews
    SRVR->>SRVR: Map to ReviewResponse DTOs
    SRVR-->>CTR: List<ReviewResponse>
    CTR-->>API: 200 OK
    API-->>ReviewService: Reviews list
    ReviewService-->>ReviewPage: Display reviews
    ReviewPage->>ReviewPage: Show avg rating, review count
```

**Key Points:**
- Reviews can only be left after session completion
- Ratings from 1-5, with written comments optional
- Reviewer gets 2 bonus points for reviewing
- Mentor's average rating updated in real-time
- Reviews immutable after submission (no edits)
- Reviewed user notified via email
- Review queries support pagination and sorting


---

## Frontend-Backend Integration

### API Client Architecture

```mermaid
graph TB
    subgraph Frontend["Frontend Layer"]
        Component["React Components"]
        Service["Service Layer"]
        ApiClient["API Client<br/>generic&lt;T&gt;"]
        TokenMgr["Token Manager"]
    end
    
    subgraph Network["HTTP"]
        Header["Auth: Bearer<br/>Idempotency-Key"]
    end
    
    subgraph Backend["Backend Layer"]
        CorsFilter["CORS Filter"]
        JwtFilter["JWT Filter"]
        Interceptor["Exception Handler"]
        Controller["@RestController"]
    end
    
    Component --> Service
    Service --> ApiClient
    ApiClient --> TokenMgr
    TokenMgr --> Header
    Header --> CorsFilter
    CorsFilter --> JwtFilter
    JwtFilter --> Interceptor
    Interceptor --> Controller
    
    style Frontend fill:#e1f5ff
    style Backend fill:#fff3e0
```

**Request Flow:**
1. Component calls Service method
2. Service calls `apiClient<T>("/endpoint")`
3. API Client retrieves token from localStorage
4. Adds `Authorization: Bearer {token}` header
5. Sends HTTP request
6. CORS validates origin
7. JWT Filter validates token, extracts userId
8. Routes to @RestController
9. Response returned with typed data

**Token Management:**
- Access tokens: 12-hour expiry
- Refresh tokens: 7-day expiry (hashed in DB)
- Automatic 401 refresh on expired token
- Refresh token family prevents replay attacks
- Concurrent requests queued during refresh

---

## Authentication Deep Dive

### JWT Token Structure

**Access Token (HS256, 12h):**
```
Payload: {
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "learner@example.com",
  "roles": ["LEARNER"],
  "iat": 1693472400,
  "exp": 1693515600
}
```

**Refresh Token (7d, hashed in DB):**
```
refresh_tokens table:
- token_hash: SHA-256 (never store plaintext)
- family_id: UUID (rotation tracking)
- user_id: UUID
- created_at, expires_at, revoked_at
```

### Refresh Flow

```mermaid
sequenceDiagram
    participant Client
    participant API as API Interceptor
    participant AuthSVC as AuthService
    participant DB
    
    Client->>API: Request with expired token
    API->>API: Decode JWT, check expiry
    API->>API: Token expired? ✗
    API->>AuthSVC: POST /auth/refresh
    AuthSVC->>DB: SELECT * FROM refresh_tokens
    DB-->>AuthSVC: Token entity
    AuthSVC->>AuthSVC: Verify family, not revoked, not expired
    AuthSVC->>AuthSVC: Generate new JWT (12h)
    AuthSVC->>AuthSVC: Generate new refresh token
    AuthSVC->>DB: INSERT new token, DELETE old
    AuthSVC-->>API: {accessToken, refreshToken}
    API->>API: Update localStorage
    API->>Client: Retry original request
```

---

## Error Handling & Exception Flow

```mermaid
graph TB
    subgraph Client["Frontend Error Handling"]
        ReqError["Request fails"]
        Check401{"Status 401?"}
        CheckNet{"Network error?"}
        ShowToast["Show error toast"]
        RetryLogic["Retry with new token"]
        Redirect["Redirect to /login"]
    end
    
    subgraph Backend["Backend Exception Handler"]
        GlobalExc["GlobalExceptionHandler"]
        ValidationExc["ValidationException"]
        AuthExc["AuthenticationException"]
        BusinessExc["BusinessException"]
    end
    
    subgraph HTTP["HTTP Response"]
        Status400["400 Bad Request"]
        Status401["401 Unauthorized"]
        Status409["409 Conflict"]
        Status500["500 Internal Error"]
    end
    
    ReqError --> Check401
    Check401 -->|Yes| CheckNet
    Check401 -->|No| ShowToast
    CheckNet -->|Yes| Redirect
    CheckNet -->|No| RetryLogic
    
    ValidationExc --> GlobalExc
    AuthExc --> GlobalExc
    BusinessExc --> GlobalExc
    
    GlobalExc --> Status400
    GlobalExc --> Status401
    GlobalExc --> Status409
    GlobalExc --> Status500
    
    style Client fill:#e1f5ff
    style Backend fill:#fff3e0
```

**Common Error Scenarios:**

| Error | HTTP | Cause | Frontend |
|-------|------|-------|----------|
| Invalid format | 400 | DTO validation fails | Show field error |
| Expired token | 401 | Token expired | Refresh & retry |
| Insufficient balance | 409 | Balance too low | Show inline error |
| Duplicate email | 409 | Email exists | Show validation error |
| Not found | 404 | Resource missing | Show 404 page |
| Server error | 500 | Uncaught exception | Show generic error + retry |

---

## Database Concurrency Control

### Pattern 1: Pessimistic Locking (Wallet Transfers)

Used when: Multiple users may update same resource simultaneously

```sql
BEGIN TRANSACTION;
  SELECT * FROM wallets 
  WHERE user_id = $1 
  FOR UPDATE NOWAIT;
  -- NOWAIT: throw error if locked by another transaction
  
  IF available_points >= amount THEN
    UPDATE wallets 
    SET available_points = available_points - amount
    WHERE user_id = $1;
  END IF;
COMMIT;

-- Behavior:
-- - Holds lock for entire transaction duration
-- - NOWAIT prevents waiting (immediate error if locked)
-- - Caller retries after brief delay
-- - Guarantees no concurrent modifications
```

### Pattern 2: Optimistic Locking (Profile Updates)

Used when: Conflicts are rare, mostly read-heavy

```sql
-- Uses version field for conflict detection
UPDATE users 
SET bio = $1, 
    updated_at = now(),
    version = version + 1
WHERE id = $2 
  AND version = $3;

-- If WHERE conditions fail (version changed):
-- - 0 rows updated
-- - Client detects: OptimisticLockException
-- - Client refetches data, shows "Data changed, retry"
-- - No locks held during user think time
```

### Pattern 3: Escrow Pattern (Session Payments)

Safe three-stage payment system:

```sql
-- Stage 1: Hold funds (on swap request)
INSERT INTO escrows (user_id, amount, session_id, status)
VALUES ($1, 50, $2, 'HELD');

UPDATE wallets 
SET available_points = available_points - 50,
    reserved_points = reserved_points + 50
WHERE user_id = $1;

-- Stage 2: Release to mentor (on completion)
UPDATE escrows SET status = 'RELEASED'
WHERE session_id = $1;

UPDATE wallets 
SET available_points = available_points + 50
WHERE user_id = $2;  -- mentor

-- Stage 3: Refund to learner (on dispute)
UPDATE escrows SET status = 'REFUNDED'
WHERE session_id = $1;

UPDATE wallets 
SET available_points = available_points + 50
WHERE user_id = $3;  -- learner
```

## Service Communication Patterns

### Inter-Service Calls & Transaction Propagation

```mermaid
graph TB
    subgraph "Command Services"
        SS["SwapService"]
        SES["SessionService"]
        ADS["AdminDisputeService"]
    end
    
    subgraph "Utility Services"
        WS["WalletService"]
        NS["NotificationService"]
        MS["MilestoneService"]
    end
    
    SS -->|holdPoints<br/>@REQUIRES_NEW| WS
    SES -->|releasePoints<br/>@REQUIRES_NEW| WS
    ADS -->|refundEscrow<br/>@REQUIRES_NEW| WS
    
    SS -->|async email| NS
    SES -->|async email| NS
    ADS -->|async email| NS
    
    SS -->|track achievement| MS
    SES -->|track achievement| MS
    
    style SS fill:#fff3e0
    style SES fill:#fff3e0
    style ADS fill:#fff3e0
    style WS fill:#e8f5e9
    style NS fill:#e8f5e9
    style MS fill:#e8f5e9
```

**Transactional Boundaries:**

```java
// SwapService - REQUIRED (default)
@Transactional
public SwapRequest createRequest(SwapRequestDTO dto) {
  swapRepository.save(request);
  
  // Delegates to WalletService which uses REQUIRES_NEW
  walletService.holdPoints(mentorId, 50);
  
  return request;
  // If any step fails: entire method rolls back
}

// WalletService - REQUIRES_NEW (isolation)
@Transactional(propagation = Propagation.REQUIRES_NEW)
public void holdPoints(UUID userId, int amount) {
  // Commits independently from caller transaction
  // Prevents deadlocks from holding wallet lock too long
  walletRepository.holdPoints(userId, amount);
  // If fails: only this transaction rolls back
}

// NotificationService - separate transaction
@Transactional(propagation = Propagation.REQUIRES_NEW)
public void sendNotification(Notification notif) {
  // Commits independently
  // Failures don't rollback main transaction (fire-and-forget)
  notificationRepository.save(notif);
  // In production: async queue (RabbitMQ, Kafka) preferred
}
```

**Key Points:**
- SwapService participates in caller's transaction (REQUIRED)
- WalletService commits independently (REQUIRES_NEW) to prevent deadlocks
- NotificationService failures don't cascade (separate transaction)
- All service calls are synchronous (blocking) by design
- In production, notifications would use async message queues

---

## Getting Started

- **Java 25:** adoptium.net
- **Node.js 20+:** nodejs.org
- **PostgreSQL 16+:** postgresql.org

### Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials

createdb skillbridge
./mvnw spring-boot:run
# Backend: http://localhost:9095
```

### Frontend Setup

```bash
npm install
echo "VITE_API_BASE_URL=http://localhost:9095" > .env
npm run dev
# Frontend: http://localhost:3000
```

### Environment Variables

**Backend (.env)**
```env
DATABASE_URL=jdbc:postgresql://localhost:5432/skillbridge
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
JWT_SECRET=your_256_bit_secret_key
SERVER_PORT=9095
REGISTRATION_BONUS_POINTS=30
ESCROW_AUTO_RELEASE_HOURS=18
```

**Frontend (.env)**
```env
VITE_API_BASE_URL=http://localhost:9095
```

---

## API Testing Examples

### Register User

```bash
curl -X POST http://localhost:9095/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "SecurePass123!",
    "firstName": "Alice",
    "lastName": "Smith"
  }'
```

### Get Wallet Balance

```bash
curl -X GET http://localhost:9095/api/v1/me/wallet \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Transfer Points

```bash
curl -X POST http://localhost:9095/api/v1/wallet/transfer \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientId": "user-uuid",
    "amount": 50,
    "reason": "Java tutoring session"
  }'
```

### Get Skills Catalog

```bash
curl -X GET http://localhost:9095/api/v1/skills
```

### Request Session

```bash
curl -X POST http://localhost:9095/api/v1/swap-requests \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "targetId": "mentor-uuid",
    "skillId": "skill-uuid",
    "scheduledStart": "2026-09-15T14:00:00Z",
    "details": "Want to learn Spring Boot"
  }'
```

---

## Production Deployment Checklist

### Security
- [ ] Change JWT_SECRET to strong 256-bit key
- [ ] Use PostgreSQL with SSL: `sslmode=require`
- [ ] Set strong database passwords (16+ chars)
- [ ] Configure CORS for production domain only
- [ ] Enable HTTPS for frontend and backend
- [ ] Set secure cookie flags (HttpOnly, Secure, SameSite)
- [ ] Implement rate limiting on API endpoints
- [ ] Enable API request logging

### Performance
- [ ] Enable database connection pooling (HikariCP)
- [ ] Configure pool sizes (min/max connections)
- [ ] Run: `npm run build` for frontend optimization
- [ ] Set up CDN for static assets
- [ ] Enable gzip compression on backend
- [ ] Configure caching headers
- [ ] Optimize database indexes

### Monitoring
- [ ] Enable Spring Boot Actuator endpoints
- [ ] Set up centralized logging (ELK, CloudWatch)
- [ ] Monitor API response times
- [ ] Track error rates
- [ ] Set up critical error alerts
- [ ] Monitor database connection usage
- [ ] Track JWT token refresh rates

### Backup & Disaster Recovery
- [ ] Configure automated database backups (daily)
- [ ] Test backup restoration
- [ ] Document disaster recovery plan
- [ ] Store backups in multiple locations

---

## System Metrics

### Key Performance Indicators

| Metric | Target | Monitor |
|--------|--------|---------|
| API Response Time | < 200ms | All endpoints |
| Auth Success Rate | > 99.9% | Login/register |
| DB Query Time | < 100ms | Common queries |
| Wallet Transfer Time | < 500ms | Point transfers |
| Session Booking Success | > 99.5% | Bookings |
| Error Rate | < 0.1% | All requests |

---

## Summary

**SkillBridge** is a complete full-stack platform connecting learners with mentors through a point-based economy system.

### Architecture Highlights

✅ **Clean Layered Design:** Controller → Service → Repository → Entity
✅ **Security:** JWT auth, role-based access, token rotation
✅ **Transaction Safety:** Optimistic & pessimistic locking, escrow patterns
✅ **Scalability:** Connection pooling, query optimization, caching
✅ **User Journeys:** 10 complete workflows from registration to reviews
✅ **API First:** RESTful design with clear separation of concerns
✅ **Database:** PostgreSQL with Flyway migrations, 35+ tables
✅ **Frontend Integration:** React service layer with automatic token refresh

### Tech Stack Summary

- **Frontend:** React 18 + TypeScript + Vite (Port 3000)
- **Backend:** Java 25 + Spring Boot 3.5 (Port 9095)
- **Database:** PostgreSQL 16 + Flyway (Port 5432)
- **Testing:** Playwright E2E + JUnit 5
- **Deployment:** Docker-ready, GitHub Actions CI/CD

### Next Steps

1. **Run locally:** Follow "Getting Started" section
2. **Test APIs:** Use curl examples provided
3. **Explore code:** Check backend/src/main/java and src/ directories
4. **Deploy:** Follow production deployment checklist
5. **Monitor:** Set up observability tools

---

**Last Updated:** September 1, 2026  
**Status:** ✅ Production Ready  
**GitHub:** github.com/loucasty-cell/UIT-Java-Final-Project

