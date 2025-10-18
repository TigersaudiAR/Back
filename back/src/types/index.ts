export type Role = "admin" | "teacher" | "lecturer" | "student" | "guest";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  password?: string;
}

export interface Surah {
  id: number;
  name_ar: string;
  name_en?: string;
  revelation_place?: "Mecca" | "Medina";
  ayah_count: number;
  bismillah_pre?: boolean;
}

export interface Ayah {
  surah_id: number;
  ayah_number: number;
  text_ar: string;
}

export interface Tafsir {
  surah_id: number;
  ayah_number: number;
  source: string;
  text_ar: string;
}

export interface RecitationTimingSegment {
  ayah_number: number;
  start: number;
  end: number;
}

export type RecitationTimingMap = Record<string, Record<string, RecitationTimingSegment[]>>;

export interface Recitation {
  surah_id: number;
  url: string;
  reciter: string;
  bitrate?: number;
  reciter_id: string;
  timings?: RecitationTimingSegment[];
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
