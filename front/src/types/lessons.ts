// Lesson System Types
export type LessonLevel = "beginner" | "intermediate" | "advanced";
export type LessonStatus = "draft" | "published" | "archived";
export type MediaType = "text" | "image" | "video" | "audio" | "document";
export type ContentBlockType = "text" | "list" | "quote" | "media" | "interactive";

export interface MediaContent {
  type: MediaType;
  url: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  duration?: number; // for video/audio in seconds
  size?: number; // file size in bytes
}

export interface ContentBlock {
  type: ContentBlockType;
  title?: string;
  body?: string;
  items?: string[];
  text?: string; // for quote
  source?: string; // for quote
  media?: MediaContent;
  interactive?: {
    type: "quiz" | "exercise" | "game";
    data: any;
  };
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  points?: number;
}

export interface LessonCategory {
  id: string;
  name: string;
  name_en?: string;
  description?: string;
  icon?: string;
  color?: string;
  order?: number;
}

export interface Lesson {
  id: string;
  category: string;
  title: string;
  title_en?: string;
  level: LessonLevel;
  status: LessonStatus;
  duration: number; // in minutes
  description: string;
  description_en?: string;
  thumbnail?: string;
  objectives: string[];
  content: ContentBlock[];
  quiz?: QuizQuestion[];
  points: number;
  order?: number;
  prerequisites?: string[]; // lesson IDs
  tags?: string[];
  author?: string;
  createdAt?: string;
  updatedAt?: string;
  viewCount?: number;
  completionCount?: number;
}

export interface UserLessonProgress {
  userId: string;
  lessonId: string;
  started: boolean;
  completed: boolean;
  score?: number;
  timeSpent?: number; // in minutes
  lastAccessedAt?: string;
  completedAt?: string;
  quizResults?: Array<{
    score: number;
    maxScore: number;
    percentage: number;
    date: string;
  }>;
}

export interface UserProgress {
  userId: string;
  completedLessons: string[];
  inProgressLessons: string[];
  totalPoints: number;
  certificates: string[];
  lastActivity?: string;
  stats?: {
    totalLessons: number;
    completedCount: number;
    averageScore: number;
    totalTimeSpent: number;
  };
}

export interface LessonNotification {
  id: string;
  userId: string;
  lessonId: string;
  type: "new_lesson" | "reminder" | "achievement" | "certificate";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: any;
}

export interface LessonStats {
  byCategory: Array<{
    category: string;
    count: number;
  }>;
  byLevel: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
}

export interface LeaderboardEntry {
  userId: string;
  totalPoints: number;
  completedLessons: number;
  certificates: number;
  averageScore: number;
}

export interface Certificate {
  lessonId: string;
  lessonTitle?: string;
  category?: string;
  date?: string;
  score: number;
}
