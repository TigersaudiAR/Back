# Lessons System - Entity Relationship Diagram (ERD)

## Overview
This document describes the database schema for the comprehensive interactive lessons system.

## Entities

### 1. Lesson
Primary entity for educational content.

**Attributes:**
- `id` (PK, string): Unique identifier
- `category` (string): Lesson category (aqidah, fiqh, sirah, quran, hadith, akhlaq, arabic, tajweed)
- `topics` (string[]): Array of topic IDs
- `title` (string): Arabic title
- `title_en` (string, optional): English title
- `slug` (string, unique): URL-friendly identifier
- `level` (string): Difficulty level (beginner, intermediate, advanced, expert)
- `duration` (number): Estimated duration in minutes
- `description` (string): Lesson description
- `objectives` (string[]): Learning objectives
- `prerequisites` (string[]): Required lesson IDs
- `content` (ContentBlock[]): Lesson content blocks
- `media` (MediaContent[]): Associated media files
- `quiz` (QuizQuestion[]): Assessment questions
- `points` (number): Points awarded for completion
- `order` (number): Display order
- `status` (string): Publication status (draft, published, archived)
- `featured` (boolean): Featured flag
- `thumbnail` (string, optional): Thumbnail image URL
- `author` (string, optional): Author user ID
- `createdAt` (timestamp): Creation timestamp
- `updatedAt` (timestamp): Last update timestamp
- `publishedAt` (timestamp, optional): Publication timestamp
- `viewCount` (number): View counter
- `completionCount` (number): Completion counter
- `averageRating` (number): Average user rating

**Relationships:**
- Has many Content Blocks (1:N)
- Has many Quiz Questions (1:N)
- Has many Media Content (1:N)
- Belongs to many Topics (N:M)
- Has many User Progress records (1:N)
- Has many Quiz Attempts (1:N)
- Has many Certificates (1:N)

### 2. Topic
Categorization and organization of lessons.

**Attributes:**
- `id` (PK, string): Unique identifier
- `name` (string): Arabic name
- `name_en` (string, optional): English name
- `description` (string, optional): Topic description
- `category` (string): Parent category
- `slug` (string, unique): URL-friendly identifier
- `lessonCount` (number): Number of associated lessons

**Relationships:**
- Belongs to many Lessons (N:M)

### 3. ContentBlock
Individual content sections within a lesson.

**Attributes:**
- `id` (PK, string): Unique identifier
- `lessonId` (FK, string): Parent lesson ID
- `type` (string): Block type (text, list, quote, media, quiz_reference)
- `order` (number): Display order
- `title` (string, optional): Block title
- `body` (string, optional): Text content
- `items` (string[], optional): List items
- `text` (string, optional): Quote text
- `source` (string, optional): Quote source
- `media` (MediaContent, optional): Embedded media

**Relationships:**
- Belongs to Lesson (N:1)
- May have embedded Media Content (1:1)

### 4. MediaContent
Multimedia resources associated with lessons.

**Attributes:**
- `id` (PK, string): Unique identifier
- `type` (string): Media type (text, image, video, audio, document, interactive)
- `url` (string, optional): Resource URL
- `title` (string, optional): Media title
- `description` (string, optional): Media description
- `duration` (number, optional): Duration in seconds (for audio/video)
- `size` (number, optional): File size in bytes
- `mimeType` (string, optional): MIME type
- `thumbnail` (string, optional): Thumbnail URL
- `metadata` (JSON, optional): Additional metadata

**Relationships:**
- Belongs to Lesson (N:1)
- May be embedded in Content Block (1:1)

### 5. QuizQuestion
Assessment questions for lessons.

**Attributes:**
- `id` (PK, string): Unique identifier
- `lessonId` (FK, string): Parent lesson ID
- `question` (string): Question text
- `options` (string[]): Answer options
- `correct` (number): Index of correct answer
- `explanation` (string): Answer explanation
- `points` (number, optional): Points for correct answer
- `difficulty` (string, optional): Question difficulty level

**Relationships:**
- Belongs to Lesson (N:1)
- Has many Quiz Question Results (1:N)

### 6. UserLessonProgress
Tracks individual user progress on lessons.

**Attributes:**
- `userId` (FK, string): User ID
- `lessonId` (FK, string): Lesson ID
- `status` (string): Progress status (not_started, in_progress, completed)
- `progress` (number): Percentage complete (0-100)
- `startedAt` (timestamp, optional): Start timestamp
- `completedAt` (timestamp, optional): Completion timestamp
- `timeSpent` (number): Time spent in seconds
- `lastAccessedAt` (timestamp): Last access timestamp
- `currentContentBlockId` (string, optional): Current position
- `bookmarks` (string[], optional): Bookmarked content blocks
- `notes` (string, optional): User notes

**Primary Key:** Composite (userId, lessonId)

**Relationships:**
- Belongs to User (N:1)
- Belongs to Lesson (N:1)

### 7. QuizAttempt
Records of quiz submissions.

**Attributes:**
- `id` (PK, string): Unique identifier
- `userId` (FK, string): User ID
- `lessonId` (FK, string): Lesson ID
- `score` (number): Number of correct answers
- `maxScore` (number): Total questions
- `percentage` (number): Score percentage
- `passed` (boolean): Pass/fail status
- `answers` (number[]): User answers
- `results` (QuizQuestionResult[]): Detailed results
- `attemptNumber` (number): Attempt sequence number
- `startedAt` (timestamp): Start timestamp
- `completedAt` (timestamp): Completion timestamp
- `timeSpent` (number): Time spent in seconds

**Relationships:**
- Belongs to User (N:1)
- Belongs to Lesson (N:1)
- Has many Quiz Question Results (1:N)

### 8. QuizQuestionResult
Individual question results within a quiz attempt.

**Attributes:**
- `attemptId` (FK, string): Parent quiz attempt ID
- `questionId` (FK, string): Question ID
- `question` (string): Question text (denormalized)
- `userAnswer` (number): User's answer index
- `correctAnswer` (number): Correct answer index
- `isCorrect` (boolean): Correctness flag
- `explanation` (string): Answer explanation
- `points` (number): Points awarded

**Relationships:**
- Belongs to Quiz Attempt (N:1)
- References Quiz Question (N:1)

### 9. Achievement
Gamification achievements/badges.

**Attributes:**
- `id` (PK, string): Unique identifier
- `name` (string): Achievement name
- `description` (string): Achievement description
- `icon` (string): Icon/emoji
- `category` (string): Category or "general"
- `criteria` (JSON): Achievement criteria
  - `type` (string): Criteria type
  - `value` (number): Target value
  - `categoryFilter` (string, optional): Category filter
- `points` (number): Points awarded
- `rarity` (string): Rarity level (common, rare, epic, legendary)

**Relationships:**
- Has many User Achievements (1:N)

### 10. UserAchievement
User-earned achievements.

**Attributes:**
- `userId` (FK, string): User ID
- `achievementId` (FK, string): Achievement ID
- `earnedAt` (timestamp): Timestamp when earned
- `progress` (number, optional): Current progress toward achievement

**Primary Key:** Composite (userId, achievementId)

**Relationships:**
- Belongs to User (N:1)
- Belongs to Achievement (N:1)

### 11. Certificate
Certificates awarded for perfect quiz scores.

**Attributes:**
- `id` (PK, string): Unique identifier
- `userId` (FK, string): User ID
- `lessonId` (FK, string): Lesson ID
- `lessonTitle` (string): Lesson title (denormalized)
- `category` (string): Lesson category (denormalized)
- `score` (number): Score percentage
- `issuedAt` (timestamp): Issuance timestamp
- `certificateUrl` (string, optional): Certificate file URL

**Relationships:**
- Belongs to User (N:1)
- Belongs to Lesson (N:1)

### 12. Notification
User notifications for events.

**Attributes:**
- `id` (PK, string): Unique identifier
- `userId` (FK, string): User ID
- `type` (string): Notification type (new_lesson, lesson_update, achievement, reminder)
- `title` (string): Notification title
- `message` (string): Notification message
- `relatedLessonId` (string, optional): Related lesson ID
- `relatedAchievementId` (string, optional): Related achievement ID
- `read` (boolean): Read status
- `createdAt` (timestamp): Creation timestamp
- `expiresAt` (timestamp, optional): Expiration timestamp
- `actionUrl` (string, optional): Action URL

**Relationships:**
- Belongs to User (N:1)

### 13. UserLessonStats
Aggregated user statistics.

**Attributes:**
- `userId` (PK, FK, string): User ID
- `totalLessonsCompleted` (number): Total completed lessons
- `totalPoints` (number): Total points earned
- `totalTimeSpent` (number): Total time in seconds
- `streak` (number): Consecutive learning days
- `lastActivityDate` (timestamp): Last activity timestamp
- `categoryProgress` (JSON): Progress by category
- `levelProgress` (JSON): Progress by level
- `achievements` (string[]): Achievement IDs
- `certificates` (string[]): Certificate IDs
- `averageQuizScore` (number): Average quiz score
- `perfectScores` (number): Number of perfect scores

**Relationships:**
- Belongs to User (1:1)

### 14. NotificationPreferences
User notification preferences.

**Attributes:**
- `userId` (PK, FK, string): User ID
- `newLessons` (boolean): New lesson notifications
- `lessonUpdates` (boolean): Lesson update notifications
- `achievements` (boolean): Achievement notifications
- `reminders` (boolean): Reminder notifications
- `emailNotifications` (boolean): Email notification flag
- `pushNotifications` (boolean): Push notification flag

**Relationships:**
- Belongs to User (1:1)

## Relationships Summary

```
User (1) ----< (N) UserLessonProgress >---- (1) Lesson
User (1) ----< (N) QuizAttempt >---- (1) Lesson
User (1) ----< (N) UserAchievement >---- (1) Achievement
User (1) ----< (N) Certificate >---- (1) Lesson
User (1) ----< (N) Notification
User (1) ---- (1) UserLessonStats
User (1) ---- (1) NotificationPreferences

Lesson (1) ----< (N) ContentBlock
Lesson (1) ----< (N) QuizQuestion
Lesson (1) ----< (N) MediaContent
Lesson (N) ----< (N) Topic

QuizAttempt (1) ----< (N) QuizQuestionResult >---- (1) QuizQuestion
```

## Indexes

For optimal performance, consider these indexes:

**Lesson:**
- `category` (for category filtering)
- `level` (for level filtering)
- `status` (for published/draft filtering)
- `slug` (unique, for URL lookups)
- `featured` (for featured lesson queries)
- `createdAt`, `updatedAt` (for sorting)

**UserLessonProgress:**
- Composite: `(userId, status)` (for user's active lessons)
- Composite: `(lessonId, status)` (for lesson completion stats)

**QuizAttempt:**
- Composite: `(userId, lessonId)` (for user quiz history)

**UserAchievement:**
- `userId` (for user achievements)
- `achievementId` (for achievement statistics)

**Notification:**
- Composite: `(userId, read)` (for unread notifications)
- `createdAt` (for sorting)

## Implementation Notes

1. **Current Implementation:** Using in-memory Map storage in TypeScript
2. **Production Recommendation:** Migrate to PostgreSQL, MongoDB, or similar
3. **Caching:** Consider Redis for frequently accessed data
4. **Search:** Implement full-text search with Elasticsearch or similar
5. **File Storage:** Use S3, Cloudinary, or similar for media files
6. **Denormalization:** Some fields are denormalized for performance (e.g., lessonTitle in Certificate)
