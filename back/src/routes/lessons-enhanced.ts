import express, { Request, Response } from "express";
import { authenticate } from "../middleware/auth.js";
import lessonsData from "../../data/seed/lessons/lessons-enhanced.json" with { type: "json" };
import categoriesData from "../../data/seed/lessons/categories.json" with { type: "json" };
import type { Lesson, LessonCategory, UserLessonProgress, UserProgress, LessonNotification } from "../types/index.js";

const router = express.Router();

// In-memory storage (in production, use a proper database)
const userProgress = new Map<string, UserProgress>();
const lessonProgress = new Map<string, UserLessonProgress[]>();
const notifications = new Map<string, LessonNotification[]>();

// Helper functions
function getUserProgress(userId: string): UserProgress {
  if (!userProgress.has(userId)) {
    userProgress.set(userId, {
      userId,
      completedLessons: [],
      inProgressLessons: [],
      totalPoints: 0,
      certificates: [],
      lastActivity: new Date(),
      stats: {
        totalLessons: lessonsData.length,
        completedCount: 0,
        averageScore: 0,
        totalTimeSpent: 0
      }
    });
  }
  return userProgress.get(userId)!;
}

function getLessonProgress(userId: string, lessonId: string): UserLessonProgress | undefined {
  const progressList = lessonProgress.get(userId) || [];
  return progressList.find(p => p.lessonId === lessonId);
}

function updateLessonProgress(userId: string, progress: UserLessonProgress) {
  const progressList = lessonProgress.get(userId) || [];
  const index = progressList.findIndex(p => p.lessonId === progress.lessonId);
  
  if (index >= 0) {
    progressList[index] = progress;
  } else {
    progressList.push(progress);
  }
  
  lessonProgress.set(userId, progressList);
}

function createNotification(userId: string, notification: Omit<LessonNotification, "id" | "createdAt" | "read">) {
  const userNotifications = notifications.get(userId) || [];
  const newNotification: LessonNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ...notification,
    read: false,
    createdAt: new Date()
  };
  userNotifications.unshift(newNotification);
  notifications.set(userId, userNotifications);
  return newNotification;
}

// ============= PUBLIC ENDPOINTS =============

// Get all categories
router.get("/categories", (_req: Request, res: Response) => {
  res.json({
    categories: categoriesData,
    total: categoriesData.length
  });
});

// Get all lessons with optional filters
router.get("/", (req: Request, res: Response) => {
  const { category, level, search, status = "published" } = req.query;
  
  let filtered = lessonsData.map(lesson => ({
    ...lesson,
    status: lesson.status || "published"
  }));
  
  // Filter by status
  if (status && status !== "all") {
    filtered = filtered.filter(l => l.status === status);
  }
  
  // Filter by category
  if (category && category !== "all") {
    filtered = filtered.filter(l => l.category === category);
  }
  
  // Filter by level
  if (level) {
    filtered = filtered.filter(l => l.level === level);
  }
  
  // Search in title and description
  if (search && typeof search === "string") {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(l => 
      l.title.toLowerCase().includes(searchLower) ||
      l.description.toLowerCase().includes(searchLower) ||
      (l.tags && l.tags.some(tag => tag.toLowerCase().includes(searchLower)))
    );
  }
  
  // Sort by order
  filtered.sort((a, b) => (a.order || 0) - (b.order || 0));
  
  res.json({
    lessons: filtered,
    total: filtered.length,
    categories: categoriesData,
    stats: {
      byCategory: categoriesData.map(cat => ({
        category: cat.id,
        count: filtered.filter(l => l.category === cat.id).length
      })),
      byLevel: {
        beginner: filtered.filter(l => l.level === "beginner").length,
        intermediate: filtered.filter(l => l.level === "intermediate").length,
        advanced: filtered.filter(l => l.level === "advanced").length
      }
    }
  });
});

// Get lessons by category
router.get("/category/:category", (req: Request, res: Response) => {
  const { category } = req.params;
  const lessons = lessonsData.filter(l => l.category === category && (l.status || "published") === "published");
  
  if (lessons.length === 0) {
    return res.status(404).json({ message: "لا توجد دروس في هذا التصنيف" });
  }
  
  const categoryInfo = categoriesData.find(c => c.id === category);
  
  res.json({ 
    category: categoryInfo,
    lessons: lessons.sort((a, b) => (a.order || 0) - (b.order || 0)),
    total: lessons.length 
  });
});

// Get specific lesson by ID
router.get("/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const lesson = lessonsData.find(l => l.id === id);
  
  if (!lesson) {
    return res.status(404).json({ message: "الدرس غير موجود" });
  }
  
  // Increment view count (in production, track this in database)
  const enhancedLesson = {
    ...lesson,
    status: lesson.status || "published",
    viewCount: (lesson.viewCount || 0) + 1
  };
  
  res.json(enhancedLesson);
});

// Search lessons
router.get("/search/query", (req: Request, res: Response) => {
  const { q, category, level, limit = "20" } = req.query;
  
  if (!q || typeof q !== "string") {
    return res.status(400).json({ message: "يجب توفير نص البحث" });
  }
  
  const searchLower = q.toLowerCase();
  let results = lessonsData.filter(l => {
    const matchesSearch = 
      l.title.toLowerCase().includes(searchLower) ||
      l.description.toLowerCase().includes(searchLower) ||
      (l.tags && l.tags.some(tag => tag.toLowerCase().includes(searchLower))) ||
      l.objectives.some(obj => obj.toLowerCase().includes(searchLower));
    
    const matchesCategory = !category || category === "all" || l.category === category;
    const matchesLevel = !level || l.level === level;
    const matchesStatus = (l.status || "published") === "published";
    
    return matchesSearch && matchesCategory && matchesLevel && matchesStatus;
  });
  
  // Limit results
  const limitNum = parseInt(limit as string);
  results = results.slice(0, limitNum);
  
  res.json({
    query: q,
    results,
    total: results.length
  });
});

// ============= AUTHENTICATED ENDPOINTS =============

// Get user's overall progress
router.get("/progress/me", authenticate(), (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const progress = getUserProgress(userId);
  
  res.json({
    progress,
    completionRate: progress.stats ? 
      (progress.stats.completedCount / progress.stats.totalLessons) * 100 : 0,
    totalLessons: lessonsData.length
  });
});

// Get user's progress for a specific lesson
router.get("/:id/progress", authenticate(), (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id } = req.params;
  
  const lesson = lessonsData.find(l => l.id === id);
  if (!lesson) {
    return res.status(404).json({ message: "الدرس غير موجود" });
  }
  
  const progress = getLessonProgress(userId, id);
  
  res.json({
    lessonId: id,
    progress: progress || {
      userId,
      lessonId: id,
      started: false,
      completed: false
    }
  });
});

// Start a lesson
router.post("/:id/start", authenticate(), (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id } = req.params;
  
  const lesson = lessonsData.find(l => l.id === id);
  if (!lesson) {
    return res.status(404).json({ message: "الدرس غير موجود" });
  }
  
  let progress = getLessonProgress(userId, id);
  
  if (!progress) {
    progress = {
      userId,
      lessonId: id,
      started: true,
      completed: false,
      lastAccessedAt: new Date()
    };
    updateLessonProgress(userId, progress);
    
    // Update user progress
    const userProg = getUserProgress(userId);
    if (!userProg.inProgressLessons.includes(id)) {
      userProg.inProgressLessons.push(id);
      userProg.lastActivity = new Date();
    }
  } else {
    progress.lastAccessedAt = new Date();
    updateLessonProgress(userId, progress);
  }
  
  res.json({
    message: "تم بدء الدرس بنجاح",
    progress
  });
});

// Mark lesson as completed
router.post("/:id/complete", authenticate(), (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id } = req.params;
  const { timeSpent } = req.body;
  
  const lesson = lessonsData.find(l => l.id === id);
  if (!lesson) {
    return res.status(404).json({ message: "الدرس غير موجود" });
  }
  
  let progress: UserLessonProgress = getLessonProgress(userId, id) || {
    userId,
    lessonId: id,
    started: true,
    completed: false
  };
  
  if (progress.completed) {
    return res.status(400).json({ message: "الدرس مكتمل بالفعل" });
  }
  
  progress.completed = true;
  progress.completedAt = new Date();
  if (timeSpent) progress.timeSpent = timeSpent;
  updateLessonProgress(userId, progress);
  
  // Update user progress
  const userProg = getUserProgress(userId);
  if (!userProg.completedLessons.includes(id)) {
    userProg.completedLessons.push(id);
    userProg.totalPoints += lesson.points;
    userProg.inProgressLessons = userProg.inProgressLessons.filter(l => l !== id);
    userProg.lastActivity = new Date();
    
    if (userProg.stats) {
      userProg.stats.completedCount++;
      userProg.stats.totalTimeSpent += timeSpent || 0;
    }
  }
  
  // Create achievement notification
  createNotification(userId, {
    userId,
    lessonId: id,
    type: "achievement",
    title: "إنجاز جديد!",
    message: `تهانينا! لقد أكملت درس "${lesson.title}" وحصلت على ${lesson.points} نقطة`,
    data: { points: lesson.points }
  });
  
  res.json({
    message: "تم إتمام الدرس بنجاح",
    points: lesson.points,
    totalPoints: userProg.totalPoints,
    progress
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
  
  // Update lesson progress
  let progress: UserLessonProgress = getLessonProgress(userId, id) || {
    userId,
    lessonId: id,
    started: true,
    completed: false
  };
  
  if (!progress.quizResults) {
    progress.quizResults = [];
  }
  
  progress.quizResults.push({
    score,
    maxScore,
    percentage,
    date: new Date()
  });
  
  progress.score = percentage;
  updateLessonProgress(userId, progress);
  
  // Update user stats
  const userProg = getUserProgress(userId);
  if (userProg.stats) {
    const allScores = lessonProgress.get(userId)
      ?.filter(p => p.score !== undefined)
      .map(p => p.score!) || [];
    userProg.stats.averageScore = allScores.length > 0
      ? allScores.reduce((a, b) => a + b, 0) / allScores.length
      : 0;
  }
  
  // Award points for passing (70% or higher)
  let bonusPoints = 0;
  if (percentage >= 70) {
    bonusPoints = Math.floor(lesson.points * 0.5);
    userProg.totalPoints += bonusPoints;
  }
  
  // Award certificate for perfect score
  let certificate = null;
  if (percentage === 100 && !userProg.certificates.includes(id)) {
    userProg.certificates.push(id);
    certificate = {
      lessonId: id,
      lessonTitle: lesson.title,
      date: new Date().toISOString(),
      score: percentage
    };
    
    createNotification(userId, {
      userId,
      lessonId: id,
      type: "certificate",
      title: "شهادة جديدة!",
      message: `تهانينا! حصلت على شهادة إتمام درس "${lesson.title}" بدرجة كاملة`,
      data: certificate
    });
  }
  
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
  const userProg = getUserProgress(userId);
  
  if (userProg.certificates.length === 0) {
    return res.json({ certificates: [], total: 0 });
  }
  
  const certificates = userProg.certificates.map(lessonId => {
    const lesson = lessonsData.find(l => l.id === lessonId);
    const progress = getLessonProgress(userId, lessonId);
    
    return {
      lessonId,
      lessonTitle: lesson?.title,
      category: lesson?.category,
      date: progress?.completedAt,
      score: progress?.score || 100
    };
  });
  
  res.json({ certificates, total: certificates.length });
});

// Get leaderboard
router.get("/leaderboard/top", (_req: Request, res: Response) => {
  const leaderboard = Array.from(userProgress.values())
    .map(p => ({
      userId: p.userId,
      totalPoints: p.totalPoints,
      completedLessons: p.completedLessons.length,
      certificates: p.certificates.length,
      averageScore: p.stats?.averageScore || 0
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 10);
  
  res.json({ leaderboard });
});

// Get user notifications
router.get("/notifications/me", authenticate(), (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { unreadOnly = "false" } = req.query;
  
  let userNotifications = notifications.get(userId) || [];
  
  if (unreadOnly === "true") {
    userNotifications = userNotifications.filter(n => !n.read);
  }
  
  res.json({
    notifications: userNotifications,
    total: userNotifications.length,
    unreadCount: userNotifications.filter(n => !n.read).length
  });
});

// Mark notification as read
router.put("/notifications/:notificationId/read", authenticate(), (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { notificationId } = req.params;
  
  const userNotifications = notifications.get(userId) || [];
  const notification = userNotifications.find(n => n.id === notificationId);
  
  if (!notification) {
    return res.status(404).json({ message: "الإشعار غير موجود" });
  }
  
  notification.read = true;
  notifications.set(userId, userNotifications);
  
  res.json({ message: "تم تحديث الإشعار", notification });
});

// Mark all notifications as read
router.put("/notifications/read-all", authenticate(), (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const userNotifications = notifications.get(userId) || [];
  
  userNotifications.forEach(n => n.read = true);
  notifications.set(userId, userNotifications);
  
  res.json({ message: "تم تحديث جميع الإشعارات" });
});

// ============= ADMIN ENDPOINTS =============

// Create new lesson (admin only)
router.post("/", authenticate(), (req: Request, res: Response) => {
  const user = (req as any).user;
  
  if (user.role !== "admin" && user.role !== "teacher") {
    return res.status(403).json({ message: "غير مصرح لك بإضافة دروس" });
  }
  
  const lessonData = req.body;
  
  // Validate required fields
  if (!lessonData.title || !lessonData.category || !lessonData.level) {
    return res.status(400).json({ message: "البيانات الأساسية مفقودة" });
  }
  
  const newLesson = {
    id: `lesson-${Date.now()}`,
    status: "draft",
    createdAt: new Date(),
    updatedAt: new Date(),
    author: user.id,
    viewCount: 0,
    completionCount: 0,
    ...lessonData
  };
  
  // TODO: In production, save to a proper database (MongoDB, PostgreSQL, etc.)
  // Currently using in-memory storage - new lessons will NOT persist after server restart
  // Uncomment the following line and implement database save:
  // await lessonsRepository.save(newLesson);
  
  res.status(201).json({
    message: "تم إنشاء الدرس بنجاح",
    lesson: newLesson
  });
});

// Update lesson (admin only)
router.put("/:id", authenticate(), (req: Request, res: Response) => {
  const user = (req as any).user;
  const { id } = req.params;
  
  if (user.role !== "admin" && user.role !== "teacher") {
    return res.status(403).json({ message: "غير مصرح لك بتعديل الدروس" });
  }
  
  const lesson = lessonsData.find(l => l.id === id);
  if (!lesson) {
    return res.status(404).json({ message: "الدرس غير موجود" });
  }
  
  const updatedLesson = {
    ...lesson,
    ...req.body,
    id, // Preserve ID
    updatedAt: new Date()
  };
  
  // In production, update in database
  
  res.json({
    message: "تم تحديث الدرس بنجاح",
    lesson: updatedLesson
  });
});

// Delete lesson (admin only)
router.delete("/:id", authenticate(), (req: Request, res: Response) => {
  const user = (req as any).user;
  const { id } = req.params;
  
  if (user.role !== "admin") {
    return res.status(403).json({ message: "غير مصرح لك بحذف الدروس" });
  }
  
  const lesson = lessonsData.find(l => l.id === id);
  if (!lesson) {
    return res.status(404).json({ message: "الدرس غير موجود" });
  }
  
  // In production, delete from database or mark as deleted
  
  res.json({ message: "تم حذف الدرس بنجاح" });
});

// Get statistics (admin only)
router.get("/admin/statistics", authenticate(), (req: Request, res: Response) => {
  const user = (req as any).user;
  
  if (user.role !== "admin" && user.role !== "teacher") {
    return res.status(403).json({ message: "غير مصرح لك بعرض الإحصائيات" });
  }
  
  const totalUsers = userProgress.size;
  const totalLessons = lessonsData.length;
  const totalCompletions = Array.from(userProgress.values())
    .reduce((sum, p) => sum + p.completedLessons.length, 0);
  
  const categoryStats = categoriesData.map(cat => ({
    category: cat.name,
    lessonsCount: lessonsData.filter(l => l.category === cat.id).length,
    completions: Array.from(userProgress.values())
      .reduce((sum, p) => sum + p.completedLessons.filter(id => {
        const lesson = lessonsData.find(l => l.id === id);
        return lesson?.category === cat.id;
      }).length, 0)
  }));
  
  res.json({
    totalUsers,
    totalLessons,
    totalCompletions,
    averageCompletionRate: totalUsers > 0 ? (totalCompletions / (totalUsers * totalLessons)) * 100 : 0,
    categoryStats,
    recentActivity: Array.from(userProgress.values())
      .sort((a, b) => (b.lastActivity?.getTime() || 0) - (a.lastActivity?.getTime() || 0))
      .slice(0, 10)
  });
});

export default router;
