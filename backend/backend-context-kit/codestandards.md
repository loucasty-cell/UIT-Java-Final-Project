# SkillBridge Backend — Code Standards

## 📦 Package Structure

```
com.skillbridge
├── {feature}/
│   ├── api/
│   │   ├── controller/    # @RestController classes
│   │   ├── dto/request/   # @RequestBody DTOs
│   │   ├── dto/response/  # Response DTOs
│   │   └── mapper/        # Entity ↔ DTO conversion
│   ├── application/       # @Service, commands, queries
│   ├── domain/            # @Entity, business logic
│   └── infrastructure/persistence/  # @Repository
└── shared/                # Config, security, error handling
```

---

## 🏷️ Naming Conventions

- **Classes**: PascalCase (UserController, UserService, User)
- **Methods**: camelCase (getUser(), registerUser(), findByEmail())
- **Constants**: UPPER_SNAKE_CASE (REGISTRATION_BONUS_POINTS = 30)
- **Packages**: lowercase, singular (com.skillbridge.user, com.skillbridge.swap)

---

## 🏗️ Entity Design

### UUID Primary Keys
```java
@Entity
public class User {
  @Id
  private UUID id = UUID.randomUUID();
}
```

### Optimistic Locking
```java
@Entity
public class SwapRequest {
  @Version
  private Long version;  // Incremented on every update
}
```

### Timestamps
```java
@Column(nullable = false)
private LocalDateTime createdAt = LocalDateTime.now();

@Column(nullable = false)
private LocalDateTime updatedAt = LocalDateTime.now();
```

---

## 📝 DTO Patterns

### Request DTO with Validation
```java
public class CreateUserRequest {
  @NotBlank(message = "Username required")
  @Size(min = 3, max = 50)
  private String username;
  
  @NotBlank @Email
  private String email;
  
  @NotBlank @Size(min = 8)
  private String password;
}
```

### Mapper Pattern
```java
@Component
public class UserMapper {
  public User toEntity(CreateUserRequest dto) {
    return User.builder()
      .username(dto.getUsername())
      .email(dto.getEmail())
      .build();
  }
  
  public UserResponse toResponse(User entity) {
    return UserResponse.builder()
      .id(entity.getId())
      .username(entity.getUsername())
      .build();
  }
}
```

---

## 🎯 Service Layer

### @Transactional Usage
```java
@Transactional  // Read-write transaction
public void acceptSwap(UUID swapId) {
  SwapRequest swap = swapRepository.findById(swapId)
    .orElseThrow(() -> new ResourceNotFoundException("Not found"));
  swap.setStatus(SwapStatus.ACCEPTED);
  walletService.lockPoints(swap.getLearnerId(), 50);
}

@Transactional(readOnly = true)  // Read-only optimization
public UserResponse getUser(UUID id) {
  return userRepository.findById(id)
    .map(userMapper::toResponse)
    .orElseThrow(() -> new ResourceNotFoundException("Not found"));
}
```

---

## 🎮 Controller Patterns

```java
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {
  
  private final UserApplicationService userService;
  
  @GetMapping("/{id}")
  public ResponseEntity<UserResponse> getUser(@PathVariable UUID id) {
    return ResponseEntity.ok(userService.getUser(id));
  }
  
  @PostMapping
  public ResponseEntity<UserResponse> createUser(
    @Valid @RequestBody CreateUserRequest request
  ) {
    UserResponse response = userService.registerUser(request);
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }
  
  @PutMapping("/{id}")
  public ResponseEntity<UserResponse> updateUser(
    @PathVariable UUID id,
    @Valid @RequestBody UpdateUserRequest request
  ) {
    return ResponseEntity.ok(userService.updateUser(id, request));
  }
  
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
    userService.deleteUser(id);
    return ResponseEntity.noContent().build();
  }
}
```

---

## ❌ Exception Handling

### Custom Exceptions
```java
public abstract class DomainException extends RuntimeException {
  public DomainException(String message) {
    super(message);
  }
}

public class ResourceNotFoundException extends DomainException { }
public class DuplicateEmailException extends DomainException { }
public class InsufficientPointsException extends DomainException { }
```

### Global Handler
```java
@ControllerAdvice
public class GlobalExceptionHandler {
  
  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<ErrorResponse> handleNotFound(
    ResourceNotFoundException ex
  ) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
      .body(ErrorResponse.builder()
        .code("RESOURCE_NOT_FOUND")
        .message(ex.getMessage())
        .timestamp(LocalDateTime.now())
        .build()
      );
  }
}
```

---

## 🧪 Testing Standards

### Test Naming
```java
class SwapServiceTest {
  @Test
  void testAcceptSwap_shouldLockPoints() { }
  
  @Test
  void testAcceptSwap_shouldThrowException_whenSwapNotFound() { }
}
```

### AAA Pattern
```java
@Test
void testAcceptSwap_shouldLockPoints() {
  // Arrange
  SwapRequest swap = new SwapRequest();
  when(swapRepository.findById(any())).thenReturn(Optional.of(swap));
  
  // Act
  swapService.acceptSwap(swap.getId());
  
  // Assert
  verify(walletService).lockPoints(any(), eq(50));
}
```

---

## ✅ Code Quality Guidelines

- **Methods**: Maximum 20 lines
- **Classes**: Single responsibility
- **Names**: Clear and intention-revealing
- **Comments**: Explain "why", not "what"
- **Null Safety**: Use Optional
- **Dependencies**: Constructor injection only
- **Logging**: SLF4J with appropriate levels
- **Testing**: Unit tests for logic, integration for DB
