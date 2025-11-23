/**
 * Comprehensive Type Definitions for Interactive Lessons System
 */

// Lesson Categories
export type LessonCategory = "aqidah" | "fiqh" | "sirah" | "quran" | "hadith" | "akhlaq" | "arabic" | "tajweed";

// Lesson Difficulty Levels
export type LessonLevel = "beginner" | "intermediate" | "advanced" | "expert";

// Content Media Types
export type MediaType = "text" | "image" | "video" | "audio" | "document" | "interactive";

// Lesson Status
export type LessonStatus = "draft" | "published" | "archived";

// Notification Types
export type NotificationType = "new_lesson" | "lesson_update" | "achievement" | "reminder";

// Media Content Interface
export interface MediaContent {
  id: string;
  type: MediaType;
  url?: string;
  title?: string;
  description?: string;
  duration?: number; // in seconds for audio/video
  size?: number; // file size in bytes
  mimeType?: string;
  thumbnail?: string;
  metadata?: Record<string, any>;
}

// Lesson Content Block
export interface LessonContentBlock {
  id: string;
  type: "text" | "list" | "quote" | "media" | "quiz_reference";
  order: number;
  title?: string;
  body?: string;
  items?: string[];
  text?: string;
  source?: string;
  media?: MediaContent;
}

// Quiz Question
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  points?: number;
  difficulty?: LessonLevel;
}

// Topic/Tag
export interface Topic {
  id: string;
  name: string;
  name_en?: string;
  description?: string;
  category: LessonCategory;
  slug: string;
  lessonCount?: number;
}

// Comprehensive Lesson Interface
export interface Lesson {
  id: string;
  category: LessonCategory;
  topics?: string[]; // topic IDs
  title: string;
  title_en?: string;
  slug: string;
  level: LessonLevel;
  duration: number; // estimated duration in minutes
  description: string;
  objectives: string[];
  prerequisites?: string[]; // lesson IDs that should be completed first
  content: LessonContentBlock[];
  media?: MediaContent[];
  quiz?: QuizQuestion[];
  points: number;
  order: number;
  status: LessonStatus;
  featured?: boolean;
  thumbnail?: string;
  author?: string; // user ID
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  viewCount?: number;
  completionCount?: number;
  averageRating?: number;
  metadata?: Record<string, any>;
}

// User Lesson Progress
export interface UserLessonProgress {
  userId: string;
  lessonId: string;
  status: "not_started" | "in_progress" | "completed";
  progress: number; // percentage 0-100
  startedAt?: string;
  completedAt?: string;
  timeSpent: number; // in seconds
  lastAccessedAt: string;
  currentContentBlockId?: string;
  bookmarks?: string[]; // content block IDs
  notes?: string;
}

// Quiz Attempt/Result
export interface QuizAttempt {
  id: string;
  userId: string;
  lessonId: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  answers: number[];
  results: QuizQuestionResult[];
  attemptNumber: number;
  startedAt: string;
  completedAt: string;
  timeSpent: number;
}

export interface QuizQuestionResult {
  questionId: string;
  question: string;
  userAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  explanation: string;
  points: number;
}

// Achievement/Badge
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: LessonCategory | "general";
  criteria: {
    type: "lessons_completed" | "quiz_score" | "streak" | "category_mastery" | "perfect_score";
    value: number;
    categoryFilter?: LessonCategory;
  };
  points: number;
  rarity: "common" | "rare" | "epic" | "legendary";
}

// User Achievement
export interface UserAchievement {
  userId: string;
  achievementId: string;
  earnedAt: string;
  progress?: number;
}

// Certificate
export interface Certificate {
  id: string;
  userId: string;
  lessonId: string;
  lessonTitle: string;
  category: LessonCategory;
  score: number;
  issuedAt: string;
  certificateUrl?: string;
}

// Notification
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedLessonId?: string;
  relatedAchievementId?: string;
  read: boolean;
  createdAt: string;
  expiresAt?: string;
  actionUrl?: string;
}

// User Statistics
export interface UserLessonStats {
  userId: string;
  totalLessonsCompleted: number;
  totalPoints: number;
  totalTimeSpent: number; // in seconds
  streak: number; // consecutive days
  lastActivityDate: string;
  categoryProgress: Record<LessonCategory, {
    completed: number;
    total: number;
    percentage: number;
  }>;
  levelProgress: Record<LessonLevel, {
    completed: number;
    total: number;
  }>;
  achievements: string[]; // achievement IDs
  certificates: string[]; // certificate IDs
  averageQuizScore: number;
  perfectScores: number;
}

// Lesson Search/Filter Criteria
export interface LessonSearchCriteria {
  query?: string;
  category?: LessonCategory;
  level?: LessonLevel;
  topics?: string[];
  status?: LessonStatus;
  featured?: boolean;
  minDuration?: number;
  maxDuration?: number;
  sortBy?: "title" | "created" | "updated" | "popularity" | "rating" | "duration";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// Lesson Search Result
export interface LessonSearchResult {
  lessons: Lesson[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  facets?: {
    categories: Record<LessonCategory, number>;
    levels: Record<LessonLevel, number>;
    topics: Record<string, number>;
  };
}

// API Response Types
export interface LessonResponse {
  lesson: Lesson;
}

export interface LessonsListResponse {
  lessons: Lesson[];
  total: number;
  categories?: Record<LessonCategory, number>;
}

export interface ProgressResponse {
  progress: UserLessonProgress;
  completionRate: number;
  totalLessons: number;
}

export interface QuizSubmissionResponse {
  attempt: QuizAttempt;
  bonusPoints?: number;
  certificate?: Certificate;
  achievements?: Achievement[];
}

export interface LeaderboardResponse {
  leaderboard: Array<{
    userId: string;
    userName?: string;
    totalPoints: number;
    completedLessons: number;
    certificates: number;
    rank: number;
  }>;
  userRank?: number;
}

// Lesson Creation/Update DTO
export interface CreateLessonDTO {
  category: LessonCategory;
  topics?: string[];
  title: string;
  title_en?: string;
  level: LessonLevel;
  duration: number;
  description: string;
  objectives: string[];
  prerequisites?: string[];
  content: LessonContentBlock[];
  media?: MediaContent[];
  quiz?: QuizQuestion[];
  points: number;
  order: number;
  status?: LessonStatus;
  featured?: boolean;
  thumbnail?: string;
}

export interface UpdateLessonDTO extends Partial<CreateLessonDTO> {
  id: string;
}

// Media Upload DTO
export interface MediaUploadDTO {
  file: File | Buffer;
  type: MediaType;
  title?: string;
  description?: string;
  lessonId?: string;
}

// Notification Preferences
export interface NotificationPreferences {
  userId: string;
  newLessons: boolean;
  lessonUpdates: boolean;
  achievements: boolean;
  reminders: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}
