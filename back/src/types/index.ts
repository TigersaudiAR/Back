export type Role = "admin" | "teacher" | "lecturer" | "student" | "guest";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  password?: string;
  verified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Surah {
  id: number;
  name_ar: string;
  name_en?: string;
  revelation_place?: "Mecca" | "Medina";
  ayah_count: number;
  bismillah_pre?: boolean;
  slug?: string;
}

export interface Ayah {
  surah_id: number;
  ayah_number: number;
  text_ar: string;
  page?: number;
  juz?: number;
  hizb?: number;
}

export interface Tafsir {
  surah_id: number;
  ayah_number: number;
  source: string;
  text_ar: string;
}

export interface ReciterConfig {
  id: string;
  name: string;
  base_url: string;
  bitrate?: number;
  style?: string;
}

export interface RecitationConfig {
  version?: number;
  url_template: string;
  reciters: ReciterConfig[];
}

export interface Dhikr {
  id: string;
  title: string;
  text: string;
  count?: number;
  tags: string[];
  reference?: string;
}

export interface DhikrSet {
  id: string;
  name: string;
  title?: string;
  description?: string;
  items: Dhikr[];
}

export interface Halaqah {
  id: string;
  title: string;
  level: "beginner" | "intermediate" | "advanced" | "kids";
  teacher: string;
  schedule: string;
  members: number;
  seats: number;
  language?: string;
}

export interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  points: number;
  rank: number;
}

export interface Hadith {
  id: string;
  title?: string;
  narrator?: string;
  source: string;
  number?: string;
  text_ar: string;
  grade?: string;
  topic?: string | string[];
}

// Enhanced Lesson System Types
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
  createdAt?: Date;
  updatedAt?: Date;
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
  lastAccessedAt?: Date;
  completedAt?: Date;
  quizResults?: Array<{
    score: number;
    maxScore: number;
    percentage: number;
    date: Date;
  }>;
}

export interface UserProgress {
  userId: string;
  completedLessons: string[];
  inProgressLessons: string[];
  totalPoints: number;
  certificates: string[];
  lastActivity?: Date;
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
  createdAt: Date;
  data?: any;
}
