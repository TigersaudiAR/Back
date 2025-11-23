# Lessons System API Documentation

## Overview
This document describes the RESTful API endpoints for the comprehensive interactive lessons system.

## Base URL
```
http://localhost:4000/api/lessons
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Get All Lessons
Get a paginated list of lessons with filtering and search.

**Endpoint:** `GET /api/lessons`

**Query Parameters:**
- `category` (optional): Filter by category (aqidah, fiqh, sirah, tafsir, hadith, akhlaq, tajweed)
- `level` (optional): Filter by level (beginner, intermediate, advanced)
- `search` (optional): Search in title, description, and objectives
- `tags` (optional): Comma-separated list of tags
- `isPublished` (optional): Filter by publish status (true, false, all). Default: "true"
- `sortBy` (optional): Sort field (order, title, duration, points, createdAt). Default: "order"
- `sortOrder` (optional): Sort direction (asc, desc). Default: "asc"
- `page` (optional): Page number for pagination. Default: 1
- `limit` (optional): Items per page. Default: 50

**Response:**
```json
{
  "lessons": [...],
  "total": 5,
  "totalAll": 10,
  "page": 1,
  "limit": 50,
  "totalPages": 1,
  "categories": {
    "aqidah": 2,
    "fiqh": 2,
    "sirah": 1,
    "tafsir": 0,
    "hadith": 0,
    "akhlaq": 0,
    "tajweed": 0
  }
}
```

**Example:**
```bash
curl "http://localhost:4000/api/lessons?category=aqidah&level=beginner"
```

---

### 2. Get Lesson by ID
Get a specific lesson by its ID.

**Endpoint:** `GET /api/lessons/:id`

**Response:**
```json
{
  "id": "aqidah-1",
  "category": "aqidah",
  "title": "أركان الإيمان الستة",
  "title_en": "The Six Pillars of Faith",
  "level": "beginner",
  "duration": 15,
  "description": "تعرف على أركان الإيمان الستة...",
  "objectives": [...],
  "content": [...],
  "quiz": [...],
  "points": 10,
  "order": 1
}
```

---

### 3. Get Lessons by Category
Get all lessons in a specific category.

**Endpoint:** `GET /api/lessons/category/:category`

**Response:**
```json
{
  "lessons": [...],
  "total": 2
}
```

---

### 4. Get Lessons by Level
Get all lessons of a specific level.

**Endpoint:** `GET /api/lessons/level/:level`

**Response:**
```json
{
  "lessons": [...],
  "total": 3
}
```

---

### 5. Create Lesson (Admin/Teacher Only)
Create a new lesson.

**Endpoint:** `POST /api/lessons`

**Authentication:** Required (admin or teacher role)

**Request Body:**
```json
{
  "category": "aqidah",
  "title": "درس جديد",
  "title_en": "New Lesson",
  "level": "beginner",
  "duration": 20,
  "description": "وصف الدرس",
  "objectives": ["هدف 1", "هدف 2"],
  "content": [
    {
      "type": "text",
      "title": "المقدمة",
      "body": "نص المقدمة"
    }
  ],
  "quiz": [
    {
      "question": "السؤال؟",
      "options": ["خيار 1", "خيار 2", "خيار 3", "خيار 4"],
      "correct": 0,
      "explanation": "الشرح"
    }
  ],
  "points": 10,
  "thumbnail": "https://example.com/image.jpg",
  "tags": ["tag1", "tag2"],
  "isPublished": true
}
```

**Response:**
```json
{
  "message": "تم إنشاء الدرس بنجاح",
  "lesson": { ... }
}
```

---

### 6. Update Lesson (Admin/Teacher Only)
Update an existing lesson.

**Endpoint:** `PUT /api/lessons/:id`

**Authentication:** Required (admin or teacher role)

**Request Body:** Same as Create Lesson (partial updates allowed)

**Response:**
```json
{
  "message": "تم تحديث الدرس بنجاح",
  "lesson": { ... }
}
```

---

### 7. Delete Lesson (Admin Only)
Delete a lesson.

**Endpoint:** `DELETE /api/lessons/:id`

**Authentication:** Required (admin role only)

**Response:**
```json
{
  "message": "تم حذف الدرس بنجاح",
  "deletedId": "lesson-id"
}
```

---

### 8. Complete Lesson
Mark a lesson as completed for the authenticated user.

**Endpoint:** `POST /api/lessons/:id/complete`

**Authentication:** Required

**Response:**
```json
{
  "message": "تم إتمام الدرس بنجاح",
  "points": 10,
  "totalPoints": 50,
  "completedLessons": 5
}
```

---

### 9. Submit Quiz
Submit quiz answers for a lesson.

**Endpoint:** `POST /api/lessons/:id/quiz`

**Authentication:** Required

**Request Body:**
```json
{
  "answers": [0, 2, 1, 3]
}
```

**Response:**
```json
{
  "score": 3,
  "maxScore": 4,
  "percentage": 75,
  "passed": true,
  "results": [
    {
      "question": "السؤال 1؟",
      "userAnswer": 0,
      "correctAnswer": 0,
      "isCorrect": true,
      "explanation": "الشرح"
    }
  ],
  "bonusPoints": 5,
  "certificate": null,
  "message": "أحسنت! لقد نجحت في الاختبار"
}
```

---

### 10. Get User Progress
Get detailed progress analytics for the authenticated user.

**Endpoint:** `GET /api/lessons/progress/me`

**Authentication:** Required

**Response:**
```json
{
  "progress": {
    "userId": "user-id",
    "completedLessons": ["lesson-1", "lesson-2"],
    "quizResults": [...],
    "totalPoints": 50,
    "certificates": ["lesson-1"],
    "lastAccessedLesson": "lesson-2",
    "lastAccessedDate": "2024-01-01T00:00:00.000Z"
  },
  "analytics": {
    "completionRate": 40,
    "totalLessons": 5,
    "completedLessons": 2,
    "totalPoints": 50,
    "certificates": 1,
    "quizzesTaken": 3,
    "averageQuizScore": 85,
    "progressByCategory": {
      "aqidah": 2,
      "fiqh": 0
    }
  }
}
```

---

### 11. Get User Certificates
Get all certificates earned by the authenticated user.

**Endpoint:** `GET /api/lessons/certificates/me`

**Authentication:** Required

**Response:**
```json
{
  "certificates": [
    {
      "lessonId": "lesson-1",
      "lessonTitle": "أركان الإيمان الستة",
      "category": "aqidah",
      "date": "2024-01-01T00:00:00.000Z",
      "score": 100
    }
  ],
  "total": 1
}
```

---

### 12. Get Leaderboard
Get top learners by points.

**Endpoint:** `GET /api/lessons/leaderboard/top`

**Response:**
```json
{
  "leaderboard": [
    {
      "userId": "user-1",
      "totalPoints": 150,
      "completedLessons": 10,
      "certificates": 5
    }
  ],
  "total": 10
}
```

---

### 13. Get User Notifications
Get notifications for the authenticated user.

**Endpoint:** `GET /api/lessons/notifications/me`

**Authentication:** Required

**Response:**
```json
{
  "notifications": [
    {
      "id": "notif-1",
      "lessonId": "lesson-1",
      "title": "درس جديد متاح",
      "message": "تم إضافة درس جديد: أركان الإيمان",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "read": false,
      "userId": "user-1"
    }
  ],
  "total": 5,
  "unread": 2
}
```

---

### 14. Mark Notification as Read
Mark a specific notification as read.

**Endpoint:** `PUT /api/lessons/notifications/:notificationId/read`

**Authentication:** Required

**Response:**
```json
{
  "message": "تم تحديث حالة الإشعار",
  "notification": { ... }
}
```

---

### 15. Mark All Notifications as Read
Mark all notifications as read for the authenticated user.

**Endpoint:** `PUT /api/lessons/notifications/read-all`

**Authentication:** Required

**Response:**
```json
{
  "message": "تم تحديث جميع الإشعارات",
  "updated": 5
}
```

---

### 16. Get Statistics (Admin/Teacher Only)
Get comprehensive statistics about the lessons system.

**Endpoint:** `GET /api/lessons/stats/overview`

**Authentication:** Required (admin or teacher role)

**Response:**
```json
{
  "totalLessons": 10,
  "publishedLessons": 8,
  "totalStudents": 50,
  "totalCompletions": 200,
  "totalQuizzesTaken": 150,
  "totalCertificatesIssued": 75,
  "averageCompletionRate": 40,
  "lessonsByCategory": {
    "aqidah": 3,
    "fiqh": 2,
    "sirah": 2,
    "tafsir": 1,
    "hadith": 1,
    "akhlaq": 1,
    "tajweed": 0
  }
}
```

---

## Content Types

### Lesson Content Types
Lessons support the following content types:

1. **Text**
```json
{
  "type": "text",
  "title": "العنوان",
  "body": "النص"
}
```

2. **List**
```json
{
  "type": "list",
  "title": "العنوان",
  "items": ["عنصر 1", "عنصر 2"]
}
```

3. **Quote**
```json
{
  "type": "quote",
  "text": "الاقتباس",
  "source": "المصدر"
}
```

4. **Image**
```json
{
  "type": "image",
  "title": "العنوان",
  "url": "https://example.com/image.jpg"
}
```

5. **Video**
```json
{
  "type": "video",
  "title": "العنوان",
  "url": "https://example.com/video.mp4",
  "thumbnail": "https://example.com/thumb.jpg",
  "duration": 300
}
```

6. **Audio**
```json
{
  "type": "audio",
  "title": "العنوان",
  "url": "https://example.com/audio.mp3",
  "duration": 180
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "الحقول المطلوبة مفقودة"
}
```

### 401 Unauthorized
```json
{
  "message": "الرمز مفقود"
}
```

### 403 Forbidden
```json
{
  "message": "صلاحيات غير كافية"
}
```

### 404 Not Found
```json
{
  "message": "الدرس غير موجود"
}
```

---

## Notes

- All dates are in ISO 8601 format
- Pagination starts at page 1
- Default page size is 50 items
- Maximum page size is 100 items
- Quiz passing score is 70%
- Perfect score (100%) awards a certificate
- Only admins can delete lessons
- Teachers and admins can create and update lessons
- Notifications are sent when lessons are published

## Security Considerations

⚠️ **Rate Limiting**: The current implementation does not include rate limiting on authenticated endpoints. For production deployment, it is recommended to add rate limiting middleware to prevent abuse. Example:
```javascript
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

router.post('/:id/complete', apiLimiter, authenticate(), ...);
```

This will be addressed in a future update.
