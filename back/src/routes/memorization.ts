import express from "express";
import { v4 as uuid } from "uuid";
import tracksData from "../../data/seed/memorization/tracks.json" with { type: "json" };
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// In-memory storage for user progress (in production, use a database)
const userProgress = new Map<string, any>();

// Get all memorization tracks
router.get("/tracks", (_req, res) => {
  res.json({
    tracks: tracksData.tracks,
    total: tracksData.tracks.length
  });
});

// Get specific track by ID
router.get("/tracks/:id", (req, res) => {
  const { id } = req.params;
  const track = tracksData.tracks.find((t) => t.id === id);
  
  if (!track) {
    return res.status(404).json({ message: "المسار غير موجود" });
  }
  
  res.json(track);
});

// Get review schedules
router.get("/schedules", (_req, res) => {
  res.json({
    schedules: tracksData.review_schedules,
    total: tracksData.review_schedules.length
  });
});

// Get quiz templates
router.get("/quiz-templates", (_req, res) => {
  res.json({
    templates: tracksData.quiz_templates,
    total: tracksData.quiz_templates.length
  });
});

// Get achievements
router.get("/achievements", (_req, res) => {
  res.json({
    achievements: tracksData.achievements,
    total: tracksData.achievements.length
  });
});

// Get memorization tips
router.get("/tips", (_req, res) => {
  res.json({
    tips: tracksData.tips,
    total: tracksData.tips.length
  });
});

// Get user's memorization progress
router.get("/progress/:userId", (req, res) => {
  const { userId } = req.params;
  const progress = userProgress.get(userId);
  
  if (!progress) {
    return res.json({
      userId,
      memorized_verses: [],
      memorized_surahs: [],
      current_track: null,
      streak_days: 0,
      total_points: 0,
      achievements_unlocked: [],
      last_review: null,
      statistics: {
        total_verses_memorized: 0,
        total_surahs_memorized: 0,
        total_quizzes_taken: 0,
        total_quizzes_passed: 0,
        average_quiz_score: 0,
        perfect_quiz_count: 0
      }
    });
  }
  
  res.json(progress);
});

// Update user's memorization progress
router.post("/progress/:userId", authenticate(), (req, res) => {
  const { userId } = req.params;
  const updates = req.body;
  
  const currentProgress = userProgress.get(userId) || {
    userId,
    memorized_verses: [],
    memorized_surahs: [],
    current_track: null,
    streak_days: 0,
    total_points: 0,
    achievements_unlocked: [],
    last_review: null,
    statistics: {
      total_verses_memorized: 0,
      total_surahs_memorized: 0,
      total_quizzes_taken: 0,
      total_quizzes_passed: 0,
      average_quiz_score: 0,
      perfect_quiz_count: 0
    }
  };
  
  // Update progress
  const updatedProgress = {
    ...currentProgress,
    ...updates,
    updated_at: new Date().toISOString()
  };
  
  userProgress.set(userId, updatedProgress);
  
  res.json({
    message: "تم تحديث التقدم بنجاح",
    progress: updatedProgress
  });
});

// Add memorized verse
router.post("/progress/:userId/verse", authenticate(), (req, res) => {
  const { userId } = req.params;
  const { surah_id, ayah_number, confidence_level } = req.body;
  
  if (!surah_id || !ayah_number) {
    return res.status(400).json({ message: "يجب تحديد رقم السورة والآية" });
  }
  
  const currentProgress = userProgress.get(userId) || {
    userId,
    memorized_verses: [],
    memorized_surahs: [],
    current_track: null,
    streak_days: 0,
    total_points: 0,
    achievements_unlocked: [],
    statistics: {
      total_verses_memorized: 0,
      total_surahs_memorized: 0,
      total_quizzes_taken: 0,
      total_quizzes_passed: 0,
      average_quiz_score: 0,
      perfect_quiz_count: 0
    }
  };
  
  const verseEntry = {
    id: uuid(),
    surah_id,
    ayah_number,
    confidence_level: confidence_level || "medium",
    memorized_at: new Date().toISOString(),
    last_reviewed: new Date().toISOString(),
    review_count: 0
  };
  
  currentProgress.memorized_verses.push(verseEntry);
  currentProgress.statistics.total_verses_memorized = currentProgress.memorized_verses.length;
  currentProgress.total_points += 10; // Award points for memorizing a verse
  
  userProgress.set(userId, currentProgress);
  
  res.json({
    message: "تم إضافة الآية للحفظ بنجاح",
    verse: verseEntry,
    total_verses: currentProgress.memorized_verses.length,
    points_earned: 10
  });
});

// Submit quiz result
router.post("/progress/:userId/quiz", authenticate(), (req, res) => {
  const { userId } = req.params;
  const { quiz_type, score, total_questions, time_taken, verses_tested } = req.body;
  
  if (typeof score === "undefined" || !total_questions) {
    return res.status(400).json({ message: "يجب تحديد النتيجة والأسئلة" });
  }
  
  const currentProgress = userProgress.get(userId) || {
    userId,
    memorized_verses: [],
    memorized_surahs: [],
    current_track: null,
    streak_days: 0,
    total_points: 0,
    achievements_unlocked: [],
    quiz_history: [],
    statistics: {
      total_verses_memorized: 0,
      total_surahs_memorized: 0,
      total_quizzes_taken: 0,
      total_quizzes_passed: 0,
      average_quiz_score: 0,
      perfect_quiz_count: 0
    }
  };
  
  const quizResult = {
    id: uuid(),
    quiz_type,
    score,
    total_questions,
    percentage: (score / total_questions) * 100,
    time_taken,
    verses_tested: verses_tested || [],
    completed_at: new Date().toISOString()
  };
  
  if (!currentProgress.quiz_history) {
    currentProgress.quiz_history = [];
  }
  
  currentProgress.quiz_history.push(quizResult);
  currentProgress.statistics.total_quizzes_taken += 1;
  
  // Update statistics
  const passed = quizResult.percentage >= 70;
  if (passed) {
    currentProgress.statistics.total_quizzes_passed += 1;
    currentProgress.total_points += 50; // Award points for passing quiz
  }
  
  if (quizResult.percentage === 100) {
    currentProgress.statistics.perfect_quiz_count += 1;
    currentProgress.total_points += 50; // Bonus for perfect score
  }
  
  // Calculate average score
  const totalScores = currentProgress.quiz_history.reduce((sum: number, q: any) => sum + q.percentage, 0);
  currentProgress.statistics.average_quiz_score = totalScores / currentProgress.quiz_history.length;
  
  userProgress.set(userId, currentProgress);
  
  res.json({
    message: passed ? "مبارك! اجتزت الاختبار بنجاح" : "حاول مرة أخرى",
    quiz: quizResult,
    passed,
    points_earned: passed ? (quizResult.percentage === 100 ? 100 : 50) : 0,
    total_points: currentProgress.total_points
  });
});

// Get user's statistics
router.get("/statistics/:userId", (req, res) => {
  const { userId } = req.params;
  const progress = userProgress.get(userId);
  
  if (!progress) {
    return res.json({
      statistics: {
        total_verses_memorized: 0,
        total_surahs_memorized: 0,
        total_quizzes_taken: 0,
        total_quizzes_passed: 0,
        average_quiz_score: 0,
        perfect_quiz_count: 0,
        streak_days: 0,
        total_points: 0
      }
    });
  }
  
  res.json({
    statistics: {
      ...progress.statistics,
      streak_days: progress.streak_days,
      total_points: progress.total_points,
      achievements_count: progress.achievements_unlocked?.length || 0
    }
  });
});

// Check and unlock achievements
router.post("/achievements/:userId/check", authenticate(), (req, res) => {
  const { userId } = req.params;
  const progress = userProgress.get(userId);
  
  if (!progress) {
    return res.json({ unlocked: [] });
  }
  
  const newlyUnlocked: any[] = [];
  const alreadyUnlocked = progress.achievements_unlocked || [];
  
  tracksData.achievements.forEach((achievement) => {
    // Check if already unlocked
    if (alreadyUnlocked.some((a: any) => a.id === achievement.id)) {
      return;
    }
    
    // Check requirements
    let requirementMet = false;
    const req = achievement.requirement as any;
    
    switch (req.type) {
      case "surahs_memorized":
        requirementMet = (progress.memorized_surahs?.length || 0) >= (req.count || 0);
        break;
      case "streak_days":
        requirementMet = progress.streak_days >= (req.count || 0);
        break;
      case "quizzes_passed":
        requirementMet = progress.statistics.total_quizzes_passed >= (req.count || 0);
        break;
      case "perfect_quizzes":
        requirementMet = progress.statistics.perfect_quiz_count >= (req.count || 0);
        break;
    }
    
    if (requirementMet) {
      newlyUnlocked.push(achievement);
      progress.achievements_unlocked.push({
        ...achievement,
        unlocked_at: new Date().toISOString()
      });
      progress.total_points += achievement.points;
    }
  });
  
  if (newlyUnlocked.length > 0) {
    userProgress.set(userId, progress);
  }
  
  res.json({
    unlocked: newlyUnlocked,
    total_unlocked: progress.achievements_unlocked.length,
    points_earned: newlyUnlocked.reduce((sum, a) => sum + a.points, 0)
  });
});

export const memorizationRouter = router;
