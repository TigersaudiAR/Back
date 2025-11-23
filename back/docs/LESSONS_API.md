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
