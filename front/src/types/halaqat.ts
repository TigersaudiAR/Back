export type Halaqah = {
  id: string;
  title: string;
  level: "beginner" | "intermediate" | "advanced" | "kids";
  teacher: string;
  schedule: string;
  members: number;
  seats: number;
  language?: string;
};

export type LeaderboardEntry = {
  user_id: string;
  display_name: string;
  points: number;
  rank: number;
  avatar?: string;
};
