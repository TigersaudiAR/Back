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

// Lessons System Types
export type LessonLevel = "beginner" | "intermediate" | "advanced";
export type LessonCategory = "aqidah" | "fiqh" | "sirah" | "tafsir" | "hadith" | "akhlaq" | "tajweed";
export type ContentType = "text" | "list" | "quote" | "image" | "video" | "audio";

export interface LessonContent {
  type: ContentType;
  title?: string;
  body?: string;
  items?: string[];
  text?: string;
  source?: string;
  url?: string;
  thumbnail?: string;
  duration?: number;
}

export interface LessonQuiz {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface Lesson {
  id: string;
  category: LessonCategory;
  title: string;
  title_en?: string;
  level: LessonLevel;
  duration: number;
  description: string;
  objectives: string[];
  content: LessonContent[];
  quiz?: LessonQuiz[];
  points: number;
  order?: number;
  thumbnail?: string;
  tags?: string[];
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
  author?: string;
}

export interface UserLessonProgress {
  userId: string;
  completedLessons: string[];
  quizResults: Array<{
    lessonId: string;
    score: number;
    maxScore: number;
    date: string;
    passed: boolean;
  }>;
  totalPoints: number;
  certificates: string[];
  lastAccessedLesson?: string;
  lastAccessedDate?: string;
}

export interface LessonNotification {
  id: string;
  lessonId: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  userId?: string;
}
