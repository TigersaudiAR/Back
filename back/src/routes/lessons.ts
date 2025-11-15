import express, { Request, Response } from "express";
import { authenticate } from "../middleware/auth.js";
import lessonsData from "../../data/seed/lessons/lessons.json" with { type: "json" };

const router = express.Router();

// In-memory storage for user lesson progress
interface UserLessonProgress {
  userId: string;
  completedLessons: string[];
  quizResults: Array<{
    lessonId: string;
    score: number;
    maxScore: number;
    date: string;
  }>;
  totalPoints: number;
  certificates: string[];
}

const userLessonProgress = new Map<string, UserLessonProgress>();

function getDefaultProgress(userId: string): UserLessonProgress {
  return {
    userId,
    completedLessons: [],
    quizResults: [],
    totalPoints: 0,
    certificates: []
  };
}

// Get all lessons
router.get("/", (_req: Request, res: Response) => {
  res.json({
    lessons: lessonsData,
    total: lessonsData.length,
    categories: {
      aqidah: lessonsData.filter(l => l.category === "aqidah").length,
      fiqh: lessonsData.filter(l => l.category === "fiqh").length,
      sirah: lessonsData.filter(l => l.category === "sirah").length
    }
  });
});

// Get lessons by category
router.get("/category/:category", (req: Request, res: Response) => {
  const { category } = req.params;
  const lessons = lessonsData.filter(l => l.category === category);
  
  if (lessons.length === 0) {
    return res.status(404).json({ message: "لا توجد دروس في هذا التصنيف" });
  }
  
  res.json({ lessons, total: lessons.length });
});

// Get specific lesson by ID
router.get("/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const lesson = lessonsData.find(l => l.id === id);
  
  if (!lesson) {
    return res.status(404).json({ message: "الدرس غير موجود" });
  }
  
  res.json(lesson);
});

// Get user's lesson progress
router.get("/progress/me", authenticate(), (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const progress = userLessonProgress.get(userId) || getDefaultProgress(userId);
  
  res.json({
    progress,
    completionRate: (progress.completedLessons.length / lessonsData.length) * 100,
    totalLessons: lessonsData.length
  });
});

// Mark lesson as completed
router.post("/:id/complete", authenticate(), (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id } = req.params;
  
  const lesson = lessonsData.find(l => l.id === id);
  if (!lesson) {
    return res.status(404).json({ message: "الدرس غير موجود" });
  }
  
  let progress = userLessonProgress.get(userId) || getDefaultProgress(userId);
  
  if (progress.completedLessons.includes(id)) {
    return res.status(400).json({ message: "الدرس مكتمل بالفعل" });
  }
  
  progress.completedLessons.push(id);
  progress.totalPoints += lesson.points;
  
  userLessonProgress.set(userId, progress);
  
  res.json({
    message: "تم إتمام الدرس بنجاح",
    points: lesson.points,
    totalPoints: progress.totalPoints
  });
});

// Submit quiz result
router.post("/:id/quiz", authenticate(), (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id } = req.params;
  const { answers } = req.body;
  
  const lesson = lessonsData.find(l => l.id === id);
  if (!lesson || !lesson.quiz) {
    return res.status(404).json({ message: "الاختبار غير موجود" });
  }
  
  if (!Array.isArray(answers)) {
    return res.status(400).json({ message: "الإجابات يجب أن تكون مصفوفة" });
  }
  
  // Calculate score
  let correctCount = 0;
  const results = lesson.quiz.map((question, index) => {
    const userAnswer = answers[index];
    const isCorrect = userAnswer === question.correct;
    if (isCorrect) correctCount++;
    
    return {
      question: question.question,
      userAnswer,
      correctAnswer: question.correct,
      isCorrect,
      explanation: question.explanation
    };
  });
  
  const score = correctCount;
  const maxScore = lesson.quiz.length;
  const percentage = (score / maxScore) * 100;
  
  let progress = userLessonProgress.get(userId) || getDefaultProgress(userId);
  
  progress.quizResults.push({
    lessonId: id,
    score,
    maxScore,
    date: new Date().toISOString()
  });
  
  // Award points for passing (70% or higher)
  let bonusPoints = 0;
  if (percentage >= 70 && !progress.completedLessons.includes(id)) {
    bonusPoints = Math.floor(lesson.points * 0.5);
    progress.totalPoints += bonusPoints;
  }
  
  // Award certificate for perfect score
  let certificate = null;
  if (percentage === 100 && !progress.certificates.includes(id)) {
    progress.certificates.push(id);
    certificate = {
      lessonId: id,
      lessonTitle: lesson.title,
      date: new Date().toISOString(),
      score: percentage
    };
  }
  
  userLessonProgress.set(userId, progress);
  
  res.json({
    score,
    maxScore,
    percentage,
    passed: percentage >= 70,
    results,
    bonusPoints,
    certificate,
    message: percentage >= 70 
      ? "أحسنت! لقد نجحت في الاختبار" 
      : "يجب الحصول على 70% على الأقل للنجاح"
  });
});

// Get user certificates
router.get("/certificates/me", authenticate(), (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const progress = userLessonProgress.get(userId);
  
  if (!progress || progress.certificates.length === 0) {
    return res.json({ certificates: [], total: 0 });
  }
  
  const certificates = progress.certificates.map(lessonId => {
    const lesson = lessonsData.find(l => l.id === lessonId);
    const quizResult = progress.quizResults.find(r => r.lessonId === lessonId);
    
    return {
      lessonId,
      lessonTitle: lesson?.title,
      category: lesson?.category,
      date: quizResult?.date,
      score: quizResult ? (quizResult.score / quizResult.maxScore) * 100 : 100
    };
  });
  
  res.json({ certificates, total: certificates.length });
});

// Get leaderboard
router.get("/leaderboard/top", (_req: Request, res: Response) => {
  const leaderboard = Array.from(userLessonProgress.values())
    .map(p => ({
      userId: p.userId,
      totalPoints: p.totalPoints,
      completedLessons: p.completedLessons.length,
      certificates: p.certificates.length
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 10);
  
  res.json({ leaderboard });
});

export default router;
