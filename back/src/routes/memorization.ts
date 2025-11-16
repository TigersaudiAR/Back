import express, { Request, Response } from "express";
import { authenticate } from "../middleware/auth.js";
import settingsData from "../../data/seed/memorization/settings.json" with { type: "json" };

const router = express.Router();

// In-memory storage for user memorization progress
// In production, this would be stored in a database
interface MemorizationProgress {
  userId: string;
  verses: Array<{
    surahId: number;
    ayahNumber: number;
    memorizedAt: string;
    reviewCount: number;
    lastReviewAt: string;
  }>;
  schedule: string;
  statistics: {
    totalVerses: number;
    totalPages: number;
    totalJuz: number;
    currentStreak: number;
    longestStreak: number;
    perfectTests: number;
  };
  achievements: string[];
  tests: Array<{
    id: string;
    type: string;
    date: string;
    score: number;
    maxScore: number;
  }>;
}

const userProgress = new Map<string, MemorizationProgress>();

function getDefaultMemorizationProgress(userId: string): MemorizationProgress {
  return {
    userId,
    verses: [],
    schedule: "schedule-1",
    statistics: {
      totalVerses: 0,
      totalPages: 0,
      totalJuz: 0,
      currentStreak: 0,
      longestStreak: 0,
      perfectTests: 0
    },
    achievements: [],
    tests: []
  };
}

// Get memorization settings
router.get("/settings", (_req: Request, res: Response) => {
  res.json(settingsData);
});

// Get user's memorization progress
router.get("/progress", authenticate(), (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const progress = userProgress.get(userId) || getDefaultMemorizationProgress(userId);
  
  res.json(progress);
});

// Mark verse as memorized
router.post("/memorize", authenticate(), (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { surahId, ayahNumber } = req.body;
  
  if (!surahId || !ayahNumber) {
    return res.status(400).json({ message: "معرف السورة ورقم الآية مطلوبان" });
  }
  
  let progress = userProgress.get(userId) || getDefaultMemorizationProgress(userId);
  
  // Check if already memorized
  const existing = progress.verses.find(
    v => v.surahId === surahId && v.ayahNumber === ayahNumber
  );
  
  if (existing) {
    return res.status(400).json({ message: "هذه الآية محفوظة بالفعل" });
  }
  
  // Add new verse
  progress.verses.push({
    surahId,
    ayahNumber,
    memorizedAt: new Date().toISOString(),
    reviewCount: 0,
    lastReviewAt: new Date().toISOString()
  });
  
  progress.statistics.totalVerses = progress.verses.length;
  
  userProgress.set(userId, progress);
  
  res.json({
    message: "تم حفظ الآية بنجاح",
    progress: progress.statistics
  });
});

// Mark verse as reviewed
router.post("/review", authenticate(), (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { surahId, ayahNumber } = req.body;
  
  const progress = userProgress.get(userId);
  if (!progress) {
    return res.status(404).json({ message: "لا يوجد تقدم محفوظ" });
  }
  
  const verse = progress.verses.find(
    v => v.surahId === surahId && v.ayahNumber === ayahNumber
  );
  
  if (!verse) {
    return res.status(404).json({ message: "الآية غير محفوظة" });
  }
  
  verse.reviewCount += 1;
  verse.lastReviewAt = new Date().toISOString();
  
  userProgress.set(userId, progress);
  
  res.json({
    message: "تم تسجيل المراجعة",
    reviewCount: verse.reviewCount
  });
});

// Submit test result
router.post("/test", authenticate(), (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { type, score, maxScore } = req.body;
  
  if (!type || score === undefined || !maxScore) {
    return res.status(400).json({ message: "بيانات الاختبار غير كاملة" });
  }
  
  let progress = userProgress.get(userId) || getDefaultMemorizationProgress(userId);
  
  const test = {
    id: `test-${Date.now()}`,
    type,
    date: new Date().toISOString(),
    score,
    maxScore
  };
  
  progress.tests.push(test);
  
  // Check for perfect score
  if (score === maxScore) {
    progress.statistics.perfectTests += 1;
    
    // Check for achievement
    if (!progress.achievements.includes("achievement-perfect-test")) {
      progress.achievements.push("achievement-perfect-test");
    }
  }
  
  userProgress.set(userId, progress);
  
  const newAchievements = score === maxScore && !progress.achievements.includes("achievement-perfect-test") 
    ? ["achievement-perfect-test"] 
    : [];
  
  res.json({
    message: "تم حفظ نتيجة الاختبار",
    test,
    newAchievements
  });
});

// Get review schedule
router.get("/schedule", authenticate(), (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const progress = userProgress.get(userId);
  
  if (!progress || progress.verses.length === 0) {
    return res.json({
      message: "لم تبدأ بالحفظ بعد",
      schedule: []
    });
  }
  
  // Simple review algorithm - review verses that haven't been reviewed in the last 24 hours
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const needsReview = progress.verses.filter(v => v.lastReviewAt < oneDayAgo);
  
  res.json({
    schedule: needsReview,
    total: needsReview.length,
    message: needsReview.length > 0 
      ? `لديك ${needsReview.length} آية تحتاج للمراجعة اليوم`
      : "لا توجد آيات تحتاج للمراجعة اليوم"
  });
});

// Get achievements
router.get("/achievements", authenticate(), (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const progress = userProgress.get(userId);
  
  const allAchievements = settingsData.achievements;
  const unlockedIds = progress?.achievements || [];
  
  const unlocked = allAchievements.filter(a => unlockedIds.includes(a.id));
  const locked = allAchievements.filter(a => !unlockedIds.includes(a.id));
  
  res.json({
    unlocked,
    locked,
    totalPoints: unlocked.reduce((sum, a) => sum + a.points, 0)
  });
});

// Get leaderboard
router.get("/leaderboard", (_req: Request, res: Response) => {
  const leaderboard = Array.from(userProgress.values())
    .map(p => ({
      userId: p.userId,
      totalVerses: p.statistics.totalVerses,
      achievements: p.achievements.length,
      perfectTests: p.statistics.perfectTests
    }))
    .sort((a, b) => b.totalVerses - a.totalVerses)
    .slice(0, 10);
  
  res.json({ leaderboard });
});

export default router;
