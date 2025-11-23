# Lessons API Documentation

## Overview
Comprehensive API for managing interactive Islamic educational lessons with multimedia support, progress tracking, achievements, and notifications.

## Base URL
```
/api/lessons
```

## Authentication
Most endpoints require JWT authentication in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/lessons | No | Get all lessons with filtering |
| GET | /api/lessons/:id | No | Get specific lesson |
| GET | /api/lessons/category/:category | No | Get lessons by category |
| POST | /api/lessons | Yes (admin/teacher) | Create new lesson |
| PUT | /api/lessons/:id | Yes (admin/teacher) | Update lesson |
| DELETE | /api/lessons/:id | Yes (admin) | Delete lesson |
| GET | /api/lessons/progress/me | Yes | Get user statistics |
| GET | /api/lessons/progress/lesson/:id | Yes | Get lesson progress |
| POST | /api/lessons/progress/:id | Yes | Update progress |
| POST | /api/lessons/:id/complete | Yes | Complete lesson |
| POST | /api/lessons/:id/quiz | Yes | Submit quiz |
| GET | /api/lessons/certificates/me | Yes | Get certificates |
| GET | /api/lessons/achievements/me | Yes | Get achievements |
| GET | /api/lessons/notifications/me | Yes | Get notifications |
| POST | /api/lessons/notifications/:id/read | Yes | Mark notification read |
| GET | /api/lessons/notifications/preferences | Yes | Get preferences |
| PUT | /api/lessons/notifications/preferences | Yes | Update preferences |
| GET | /api/lessons/leaderboard/top | No | Get leaderboard |
| GET | /api/lessons/topics/all | No | Get all topics |
| GET | /api/lessons/topics/category/:category | No | Get topics by category |
| POST | /api/lessons/topics | Yes (admin/teacher) | Create topic |

See full documentation for detailed request/response examples.

## Security Considerations

### Rate Limiting
⚠️ **Important**: Rate limiting is not currently implemented but is **required for production** to prevent abuse.

**Recommendations:**
- Public endpoints: 100 requests per 15 minutes per IP
- Authenticated endpoints: 200 requests per 15 minutes per user
- Admin/teacher endpoints: 500 requests per 15 minutes per user
- Quiz submission: 10 attempts per hour per user per lesson
- Lesson creation: 20 lessons per day per teacher

**Implementation:** Use `express-rate-limit` middleware

### Authentication Security
- JWT tokens expire after 12 hours
- Tokens should be stored securely (httpOnly cookies recommended)
- Implement token refresh mechanism for production
- Use HTTPS in production

### Input Validation
- All user inputs should be validated and sanitized
- Implement proper error handling to avoid information leakage
- Use TypeScript types for compile-time validation

### Database Security
- Current implementation uses in-memory storage
- For production, migrate to proper database with:
  - Prepared statements to prevent SQL injection
  - Encryption at rest for sensitive data
  - Regular backups
  - Access control and audit logging
