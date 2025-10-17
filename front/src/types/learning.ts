export type LearningModule = {
  id: string;
  title: string;
  description: string;
  level: "beginner" | "intermediate" | "advanced";
  badges: string[];
};

export type LearningLesson = {
  id: string;
  title: string;
  duration: string;
  objectives: string[];
  steps: string[];
  resources: { label: string; type: "audio" | "video" | "document" | "interactive"; url: string }[];
};

export type LearningMap = Record<string, LearningLesson[]>;
