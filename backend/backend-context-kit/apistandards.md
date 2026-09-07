# SkillBridge Backend — API Standards

## 📋 REST API Design Principles

### 1. Resource-Oriented Design

All endpoints represent resources accessed via nouns, not verbs:

```
✅ GOOD:
GET    /api/v1/users/{id}
POST   /api/v1/swaps
PUT    /api/v1/users/{id}
DELETE /api/v1/notifications/{id}

❌ WRONG:
GET    /api/v1/getUser/{id}
POST   /api/v1/createSwap
PUT    /api/v1/updateUser/{id}
DELETE /api/v1/deleteNotification/{id}
```

### 2. URL Structure & Naming

- **Base Path**: `/api/v1/`
- **Resources**: Plural nouns in kebab-case
- **Sub-resources**: `/api/v1/{resource}/{id}/{sub-resource}`
- **Query Parameters**: CamelCase for filters and pagination

```
GET    /api/v1/users                          # List users
GET    /api/v1/users?page=0&size=20&sort=name
GET    /api/v1/users/{id}                     # Get user
POST   /api/v1/users                          # Create user
PUT    /api/v1/users/{id}                     # Update user
DELETE /api/v1/users/{id}                     # Delete user

GET    /api/v1/users/{id}/skills              # User's skills
POST   /api/v1/users/{id}/skills              # Add skill
DELETE /api/v1/users/{id}/skills/{skillId}    # Remove skill
```

### 3. HTTP Methods & Status Codes

| Method | Purpose | Status Codes |
|--------|---------|--------------|
| **GET** | Retrieve resource | 200 OK, 404 Not Found |
| **POST** | Create resource | 201 Created, 400 Bad Request, 409 Conflict |
| **PUT** | Replace resource | 200 OK, 204 No Content, 400 Bad Request |
| **PATCH** | Partial update | 200 OK, 204 No Content, 400 Bad Request |
| **DELETE** | Remove resource | 204 No Content, 404 Not Found |

**Common Status Codes**:
- `200 OK`: Successful GET/PUT/PATCH
- `201 Created`: Resource created via POST
- `204 No Content`: Successful operation with no response body
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing/invalid authentication
- `403 Forbidden`: Authenticated but not authorized
- `404 Not Found`: Resource doesn't exist
- `409 Conflict`: State conflict (e.g., duplicate email)
- `422 Unprocessable Entity`: Validation failed
- `500 Internal Server Error`: Server-side error

### 4. Request/Response Format

**Successful Response**:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2026-08-31T03:32:43.638Z"
  },
  "message": "User retrieved successfully",
  "timestamp": "2026-08-31T03:32:43.638Z"
}
```

**Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email must be a valid email address",
    "field": "email",
    "details": [
      {
        "field": "email",
        "message": "must be a valid email address"
      }
    ]
  },
  "timestamp": "2026-08-31T03:32:43.638Z"
}
```

**List Response with Pagination**:
```json
{
  "success": true,
  "data": [
    { "id": "uuid1", "name": "User1" },
    { "id": "uuid2", "name": "User2" }
  ],
  "pagination": {
    "page": 0,
    "size": 20,
    "totalElements": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrevious": false
  },
  "timestamp": "2026-08-31T03:32:43.638Z"
}
```

### 5. Authentication & Authorization

**Authorization Header**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**JWT Token Structure**:
- Algorithm: HS256
- Secret: 256-bit key (env: `JWT_SECRET`)
- Access Token TTL: 12 hours (env: `ACCESS_TOKEN_MINUTES`)
- Refresh Token TTL: 7 days (env: `REFRESH_TOKEN_DAYS`)

**Role-Based Access Control**:
```
ROLE_USER:       Standard user, can create swaps and forum posts
ROLE_MENTOR:     Can create offerings and respond to requests
ROLE_MODERATOR:  Can flag/action moderation tasks
ROLE_ADMIN:      Full system access, user management
```

### 6. Pagination Standards

**Query Parameters**:
```
GET /api/v1/users?page=0&size=20&sort=createdAt,desc

page:   0-based page number (default: 0)
size:   Items per page (default: 20, max: 100)
sort:   field name and direction (asc|desc, default: asc)
```

### 7. CORS Configuration

**Development**:
```
Allowed Origins: http://localhost:*
                 http://127.0.0.1:*
                 (All localhost ports: 3000, 5173, 8080, 8081, etc.)
```

**Production**:
```
Allowed Origins: https://app.skillbridge.dev
                 https://www.skillbridge.dev
                 (Set via FRONTEND_ORIGINS env var)
```

**Allowed Headers**: Content-Type, Authorization, X-Requested-With  
**Allowed Methods**: GET, POST, PUT, DELETE, PATCH, OPTIONS

### 8. Error Codes

| Code | HTTP | Meaning | Resolution |
|------|------|---------|-----------|
| `INVALID_CREDENTIALS` | 401 | Username/password incorrect | Verify credentials |
| `TOKEN_EXPIRED` | 401 | JWT token expired | Refresh token |
| `UNAUTHORIZED` | 403 | User lacks permission | Check role |
| `RESOURCE_NOT_FOUND` | 404 | Entity doesn't exist | Verify ID |
| `VALIDATION_ERROR` | 422 | Request data invalid | Fix field values |
| `DUPLICATE_EMAIL` | 409 | Email already registered | Use different email |
| `INSUFFICIENT_POINTS` | 422 | User out of points | Insufficient balance |
| `INVALID_STATE` | 422 | Resource in wrong state | Check current status |
| `INTERNAL_ERROR` | 500 | Unexpected server error | Contact support |

### 9. Versioning Strategy

**URI-based Versioning**:
```
Current:  /api/v1/...
Future:   /api/v2/... (when major breaking changes needed)
```

**Deprecation Policy**:
1. Announce deprecation 6 months in advance
2. Add deprecation headers: `Deprecation: true`, `Sunset: date`
3. Maintain two versions for 12 months
4. Remove old version after warning period

### 10. API Documentation

**Location**: `http://localhost:9095/swagger-ui.html`  
**OpenAPI Spec**: `http://localhost:9095/v3/api-docs`

Each endpoint includes:
- Description and purpose
- Request/response schema
- Example values
- Required parameters and headers
- Possible status codes and error responses
