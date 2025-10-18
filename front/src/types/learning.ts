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

export type LessonStage = {
  id: string;
  title: string;
  description: string;
  tip: string;
  challenge: string;
};

export type LessonQuizChoice = {
  id: string;
  label: string;
  hint?: string;
};

export type LessonQuizQuestion = {
  id: string;
  prompt: string;
  choices: LessonQuizChoice[];
  correctChoiceId: string;
  explanation: string;
};

export type LessonQuiz = {
  id: string;
  type: "checkpoint" | "final";
  title: string;
  description: string;
  questions: LessonQuizQuestion[];
};

export type LearningLesson = {
  id: string;
  title: string;
  duration: string;
  objectives: string[];
  steps: string[];
  resources: LearningResource[];
  stages: LessonStage[];
  quizzes: LessonQuiz[];
};

export type LearningMap = Record<string, LearningLesson[]>;
