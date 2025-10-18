export type LearningModule = {
  id: string;
  title: string;
  description: string;
  level: "beginner" | "intermediate" | "advanced";
  badges: string[];
};

export type LearningResource = {
  label: string;
  type: "audio" | "video" | "document" | "interactive" | "guide";
  description: string;
  instructions: string[];
};

export type LearningLesson = {
  id: string;
  title: string;
  duration: string;
  objectives: string[];
  steps: string[];
  resources: LearningResource[];
};

export type LearningMap = Record<string, LearningLesson[]>;
