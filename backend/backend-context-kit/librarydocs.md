# SkillBridge Backend — Library & Framework Documentation

## 📚 Spring Boot 3.5.16

**Auto-configuration** with sensible defaults
**Embedded Tomcat** - runs as standalone JAR
**Starters** - simplified dependency management
**Actuator** - production endpoints (`/actuator/health`, `/actuator/metrics`)

Configuration via `application.yml`:
```yaml
spring:
  application:
    name: skillbridge-backend
  datasource:
    url: ${DATABASE_URL}
    username: ${DATABASE_USERNAME}
    password: ${DATABASE_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: validate
```

**Profiles**: dev, staging, production

---

## 🔐 Spring Security 6

### JWT Authentication Flow
```
Client sends credentials → Server validates → JWT issued
Client stores JWT → Includes in Authorization header
Server validates signature and expiration
If valid, request proceeds; if expired, returns 401
Client calls /api/v1/auth/refresh for new token
```

### SecurityFilterChain
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) {
    http
      .csrf().disable()
      .authorizeHttpRequests(authz -> authz
        .requestMatchers("/api/v1/auth/**").permitAll()
        .anyRequest().authenticated()
      )
      .sessionManagement().sessionCreationPolicy(STATELESS);
    return http.build();
  }
}
```

### Authorization Annotations
```java
@PreAuthorize("hasRole('ROLE_USER')")
public ResponseEntity<?> getUserProfile() { }

@PreAuthorize("hasRole('ROLE_ADMIN')")
public ResponseEntity<?> suspendUser() { }
```

---

## 💾 Spring Data JPA & Hibernate 6

### Repository Pattern
```java
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
  Optional<User> findByEmail(String email);
  List<User> findByRole(Role role);
}
```

### Entity with Optimistic Locking
```java
@Entity
public class SwapRequest {
  @Version
  private Long version;  // Incremented on each update
}
```

### Query Methods
- Automatic query generation from method names
- JPQL for complex queries: `@Query("SELECT u FROM User u WHERE...")`
- Lazy loading (collections), Eager loading (references)

---

## 🗄️ Flyway Migrations

### Version Format
```
V<number>__<description>.sql

Examples:
V1__init_schema.sql
V4.1__create_skills_table.sql (out-of-order)
```

### Configuration
```yaml
spring:
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true
    out-of-order: true  # Allows V4.1 after V5
```

### Best Practices
- Idempotent: `CREATE TABLE IF NOT EXISTS`
- Backward compatible: Don't drop columns, mark unused
- Transaction safe: Entire migration rolls back if any statement fails

---

## 🔌 PostgreSQL JDBC

### Connection URL
```
jdbc:postgresql://host:port/database?options

localhost: jdbc:postgresql://localhost:5432/skillbridge?sslmode=disable
Neon: jdbc:postgresql://db.neon.tech/skillbridge?sslmode=require
```

### SSL Modes
- `disable`: No SSL
- `require`: SSL mandatory
- `verify-ca`: Verify CA certificate
- `verify-full`: Verify hostname + CA

### HikariCP Connection Pool
```yaml
datasource:
  hikari:
    maximum-pool-size: 10
    minimum-idle: 2
    connection-timeout: 60000ms
    idle-timeout: 3600000ms
```

---

## 📦 Lombok 1.18.46

### Annotations
```java
@Data               // @Getter + @Setter + @ToString + @EqualsAndHashCode
@Builder           // Fluent builder pattern
@NoArgsConstructor // Default constructor
@AllArgsConstructor // All fields constructor
```

### Entity Example
```java
@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
  @Id
  private UUID id;
  
  @Column(unique = true, nullable = false)
  private String email;
  
  @Version
  private Long version;
}
```

**JDK 25 Compatible**: Requires explicit annotation processor in pom.xml

---

## 📖 SpringDoc OpenAPI 2.6.0

### Access Points
```
Swagger UI: http://localhost:9095/swagger-ui.html
OpenAPI Spec: http://localhost:9095/v3/api-docs
```

### Controller Documentation
```java
@RestController
@Tag(name = "Users", description = "User API")
public class UserController {
  
  @GetMapping("/{id}")
  @Operation(summary = "Get user by ID")
  @ApiResponse(responseCode = "200", description = "Found")
  @ApiResponse(responseCode = "404", description = "Not found")
  public ResponseEntity<UserResponse> getUser(@PathVariable UUID id) { }
}
```

---

## 🧪 JUnit 5 & TestContainers

### Unit Tests (Mocked)
```java
@ExtendWith(MockitoExtension.class)
class SwapServiceTest {
  @Mock private SwapRepository swapRepository;
  @InjectMocks private SwapService swapService;
  
  @Test
  void testAcceptSwap() {
    when(swapRepository.findById(any())).thenReturn(Optional.of(swap));
    swapService.acceptSwap(id);
    verify(swapRepository).save(any());
  }
}
```

### Integration Tests (Real DB)
```java
@SpringBootTest
@Testcontainers
class SwapIntegrationTest {
  @Container
  static PostgreSQLContainer<?> postgres = 
    new PostgreSQLContainer<>("postgres:16-alpine");
  
  @Autowired private SwapService swapService;
}
```

### Slice Tests
```java
@WebMvcTest(UserController.class)  // Controller + Security
@DataJpaTest                        // JPA + DataSource
```
