# SkillBridge Backend — System Architecture

## 🏛️ Architectural Paradigm

**Domain-Driven Design (DDD)** with **Package-by-Feature** organization

Each business capability is isolated in its own package, reducing coupling and improving maintainability.

---

## 📐 Layered Architecture

```
API Layer (Controllers, DTOs, Mappers)
    ↓ depends on
Application Layer (Services, Commands)
    ↓ depends on
Domain Layer (Entities, Value Objects)
    ↓ depends on
Infrastructure (Repositories, Config)
```

### Dependency Flow (Correct)
```
API → Application → Domain
       ↓
    Infrastructure (DB access only)
```

---

## 📦 Module Boundaries

### Core Modules
- **auth/** - Registration, login, JWT issuance, token validation
- **user/** - User profiles, public statistics, account management
- **skill/** - Skill catalog, categories, search capabilities
- **mentor/** - Mentor profiles, teaching offerings, availability
- **swap/** - Swap proposals, escrow locking, status workflows
- **session/** - Learning session scheduling and status tracking
- **review/** - Post-session feedback and rating calculations
- **wallet/** - Point ledger, transactions, escrow operations
- **notification/** - In-app notification queue and dispatch
- **forum/** - Community posts, comments, helpful flags
- **moderation/** - Content review, user actions, audit logs
- **admin/** - System configuration, user management

### Shared Module
**shared/** - Exception handling, security config, API response wrappers

---

## 🔐 Security Architecture

```
HTTP Request
    ↓
Spring Security Filter Chain
├── CORS Processor
├── JWT Validation Filter
├── Authentication Provider (load user from JWT)
├── Authorization Check (@PreAuthorize)
└── Dispatch or 401/403 error
```

### JWT Token Structure
```
Header: { "alg": "HS256", "typ": "JWT" }
Payload: {
  "sub": "user-uuid",
  "username": "john_doe",
  "role": "ROLE_USER",
  "iat": 1693392763,
  "exp": 1693436763  // 12 hours
}
```

### Authorization Roles
- `ROLE_USER`: Standard user
- `ROLE_MENTOR`: Can create offerings
- `ROLE_MODERATOR`: Moderation tasks
- `ROLE_ADMIN`: Full system access

---

## 🔄 Request Lifecycle

1. HTTP Request arrives
2. DispatcherServlet routes to @RestController
3. @Valid annotation triggers request validation
4. Controller calls @Service method
5. @Transactional opens database transaction
6. Service calls @Repository (Spring Data JPA)
7. Repository executes JPQL via Hibernate
8. Database operations (insert/update/delete)
9. Transaction commits or rolls back
10. Service returns to controller
11. Controller wraps in ResponseEntity
12. Jackson serializes to JSON
13. HTTP Response sent (200/201/400/etc)

---

## 💾 Data Persistence

### Spring Data JPA
```java
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
  Optional<User> findByEmail(String email);
  List<User> findByRole(Role role);
}
```

Automatically generates SQL queries from method names.

### Entity Lifecycle
```
NEW (transient)
  ↓ save()
MANAGED (persistent)
  ↓ update
DIRTY (needs flush)
  ↓ commit
SYNCED (to DB)
```

### Optimistic Locking
```java
@Entity
public class SwapRequest {
  @Version
  private Long version;  // Incremented on each update
}
```

---

## 🔗 Module Interaction Patterns

### Direct Service Injection
```java
@Service
public class SwapService {
  private final WalletService walletService;
  private final NotificationService notificationService;
  
  public void acceptSwap(UUID swapId) {
    walletService.lockPoints(...);
    notificationService.send(...);
  }
}
```

### Event Publishing
```java
@Service
public class SwapService {
  private final ApplicationEventPublisher eventPublisher;
  
  public void completeSwap(UUID swapId) {
    eventPublisher.publishEvent(new SwapCompletedEvent(swapId));
  }
}

@Component
public class SwapEventListener {
  @EventListener
  public void onSwapCompleted(SwapCompletedEvent event) {
    // Release points, send notifications, update reputation
  }
}
```

---

## 🧪 Testing Approach

### Unit Tests (Mocked Dependencies)
```java
@ExtendWith(MockitoExtension.class)
class SwapServiceTest {
  @Mock private SwapRepository swapRepository;
  @InjectMocks private SwapService swapService;
}
```

### Integration Tests (Real Database)
```java
@SpringBootTest
@Testcontainers
class SwapIntegrationTest {
  @Container
  static PostgreSQLContainer<?> postgres = 
    new PostgreSQLContainer<>("postgres:16-alpine");
}
```

---

## 📊 Scalability Considerations

### Connection Pooling
```yaml
maximum-pool-size: 10
minimum-idle: 2
connection-timeout: 60000ms
idle-timeout: 3600000ms
```

### Database Indexes
- `idx_users_email` on users(email)
- `idx_swaps_learner` on swap_requests(learner_id)
- `idx_sessions_user` on learning_sessions(user_id)
- `idx_notifications_unread` on notifications(user_id, read)

### Query Optimization
Avoid N+1 problem using LEFT JOIN FETCH:
```java
@Query("""
  SELECT u FROM User u 
  LEFT JOIN FETCH u.skills
""")
List<User> findAllWithSkills();
```

---

## 🚀 Deployment Flow

```
GitHub Repo (develop/main)
    ↓
GitHub Actions Workflow
├── Checkout code
├── Setup Java 25
├── Run mvnw test
├── Build JAR
├── SonarQube analysis
├── Dependency check
└── Deploy
   ├─ develop → Staging (staging.skillbridge.dev)
   └─ main → Production (api.skillbridge.dev)
    
Neon PostgreSQL (Serverless)
```

---

## ✅ Design Patterns

| Pattern | Purpose |
|---------|---------|
| **Repository** | Data access abstraction |
| **Service** | Business logic orchestration |
| **Controller** | HTTP request handling |
| **DTO** | Request/response transfer |
| **Mapper** | Entity ↔ DTO conversion |
| **Dependency Injection** | Loose coupling |
| **Transactional** | ACID guarantees |
| **Event Publisher** | Async communication |
