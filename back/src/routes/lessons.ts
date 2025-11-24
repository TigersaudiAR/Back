import express, { Request, Response } from "express";
import { authenticate } from "../middleware/auth.js";
import { Lesson, UserLessonProgress, LessonNotification } from "../types/index.js";
import { v4 as uuidv4 } from "uuid";
import lessonsData from "../../data/seed/lessons/lessons.json" with { type: "json" };

const router = express.Router();

// In-memory storage - in production, use a real database
const lessons = new Map<string, Lesson>(
  (lessonsData as Lesson[]).map(lesson => [lesson.id, lesson])
);
const userLessonProgress = new Map<string, UserLessonProgress>();
const lessonNotifications = new Map<string, LessonNotification[]>();

function getDefaultProgress(userId: string): UserLessonProgress {
  return {
    userId,
    completedLessons: [],
    quizResults: [],
    totalPoints: 0,
    certificates: [],
    lastAccessedLesson: undefined,
    lastAccessedDate: undefined
  };

function createNotification(lesson: Lesson): LessonNotification {
  return {
    id: uuidv4(),
    lessonId: lesson.id,
    title: "درس جديد متاح",
    message: `تم إضافة درس جديد: ${lesson.title}`,
    createdAt: new Date().toISOString(),
    read: false
  };
}

function notifyUsers(notification: LessonNotification) {
  // Notify all users - in production, use proper notification service
  for (const userId of userLessonProgress.keys()) {
    const userNotifs = lessonNotifications.get(userId) || [];
    userNotifs.push({ ...notification, userId });
    lessonNotifications.set(userId, userNotifs);
  }
}

// Get all lessons with advanced filtering and search
router.get("/", (req: Request, res: Response) => {
  const { 
    category, 
    level, 
    search, 
    tags, 
    isPublished = "true",
    sortBy = "order",
    sortOrder = "asc",
    page = "1",
    limit = "50"
  } = req.query;

  let filteredLessons = Array.from(lessons.values());

  // Filter by published status
  if (isPublished !== "all") {
    const pubStatus = isPublished === "true";
    filteredLessons = filteredLessons.filter(l => 
      l.isPublished === undefined ? true : l.isPublished === pubStatus
    );
  }

  // Filter by category
  if (category && typeof category === "string") {
    filteredLessons = filteredLessons.filter(l => l.category === category);
  }

  // Filter by level
  if (level && typeof level === "string") {
    filteredLessons = filteredLessons.filter(l => l.level === level);
  }

  // Search in title, description, and objectives
  if (search && typeof search === "string") {
    const searchLower = search.toLowerCase();
    filteredLessons = filteredLessons.filter(l => 
      l.title.toLowerCase().includes(searchLower) ||
      l.description.toLowerCase().includes(searchLower) ||
      l.objectives.some(obj => obj.toLowerCase().includes(searchLower)) ||
      (l.title_en && l.title_en.toLowerCase().includes(searchLower))
    );
  }

  // Filter by tags
  if (tags && typeof tags === "string") {
    const tagArray = tags.split(",");
    filteredLessons = filteredLessons.filter(l => 
      l.tags && tagArray.some(tag => l.tags!.includes(tag))
    );
  }

  // Sort lessons
  filteredLessons.sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case "order":
        comparison = (a.order || 999) - (b.order || 999);
        break;
      case "title":
        comparison = a.title.localeCompare(b.title, "ar");
        break;
      case "duration":
        comparison = a.duration - b.duration;
        break;
      case "points":
        comparison = a.points - b.points;
        break;
      case "createdAt":
        comparison = (a.createdAt || "").localeCompare(b.createdAt || "");
        break;
      default:
        comparison = (a.order || 999) - (b.order || 999);
    }
    
    return sortOrder === "desc" ? -comparison : comparison;
  });

  // Pagination
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;
  const paginatedLessons = filteredLessons.slice(startIndex, endIndex);

  // Category statistics
  const allLessons = Array.from(lessons.values());
  const categories = {
    aqidah: allLessons.filter(l => l.category === "aqidah").length,
    fiqh: allLessons.filter(l => l.category === "fiqh").length,
    sirah: allLessons.filter(l => l.category === "sirah").length,
    tafsir: allLessons.filter(l => l.category === "tafsir").length,
    hadith: allLessons.filter(l => l.category === "hadith").length,
    akhlaq: allLessons.filter(l => l.category === "akhlaq").length,
    tajweed: allLessons.filter(l => l.category === "tajweed").length
  };

  res.json({
    lessons: paginatedLessons,
    total: filteredLessons.length,
    totalAll: lessons.size,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(filteredLessons.length / limitNum),
    categories
  });
});

// Get lessons by category
router.get("/category/:category", (req: Request, res: Response) => {
  const { category } = req.params;
  const categoryLessons = Array.from(lessons.values()).filter(l => l.category === category);
  
  if (categoryLessons.length === 0) {
    return res.status(404).json({ message: "لا توجد دروس في هذا التصنيف" });
  }
  
  res.json({ lessons: categoryLessons, total: categoryLessons.length });
});

// Get lessons by level
router.get("/level/:level", (req: Request, res: Response) => {
  const { level } = req.params;
  const levelLessons = Array.from(lessons.values()).filter(l => l.level === level);
  
  if (levelLessons.length === 0) {
    return res.status(404).json({ message: "لا توجد دروس في هذا المستوى" });
  }
  
  res.json({ lessons: levelLessons, total: levelLessons.length });
});

// Create new lesson (Admin only)
router.post("/", authenticate(["admin", "teacher"]), (req: Request, res: Response) => {
  const {
    category,
    title,
    title_en,
    level,
    duration,
    description,
    objectives,
    content,
    quiz,
    points,
    thumbnail,
    tags,
    isPublished = false
  } = req.body;

  // Validation
  if (!category || !title || !level || !duration || !description || !objectives || !content) {
    return res.status(400).json({ 
      message: "الحقول المطلوبة: category, title, level, duration, description, objectives, content" 
    });
  }

  const newLesson: Lesson = {
    id: uuidv4(),
    category,
    title,
    title_en,
    level,
    duration,
    description,
    objectives,
    content,
    quiz,
    points: points || 10,
    order: lessons.size + 1,
    thumbnail,
    tags,
    isPublished,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: (req as any).user.id
  };

  lessons.set(newLesson.id, newLesson);

  // Send notification if published
  if (isPublished) {
    const notification = createNotification(newLesson);
    notifyUsers(notification);
  }

  res.status(201).json({
    message: "تم إنشاء الدرس بنجاح",
    lesson: newLesson
  });
});

// Update lesson (Admin only)
router.put("/:id", authenticate(["admin", "teacher"]), (req: Request, res: Response) => {
  const { id } = req.params;
  const lesson = lessons.get(id);

  if (!lesson) {
    return res.status(404).json({ message: "الدرس غير موجود" });
  }

  const wasPublished = lesson.isPublished;
  
  const updatedLesson: Lesson = {
    ...lesson,
    ...req.body,
    id, // Prevent ID change
    updatedAt: new Date().toISOString()
  };

  lessons.set(id, updatedLesson);

  // Send notification if newly published
  if (!wasPublished && updatedLesson.isPublished) {
    const notification = createNotification(updatedLesson);
    notifyUsers(notification);
  }

  res.json({
    message: "تم تحديث الدرس بنجاح",
    lesson: updatedLesson
  });
});

// Delete lesson (Admin only)
router.delete("/:id", authenticate(["admin"]), (req: Request, res: Response) => {
  const { id } = req.params;
  
  if (!lessons.has(id)) {
    return res.status(404).json({ message: "الدرس غير موجود" });
  }

  lessons.delete(id);

  res.json({
    message: "تم حذف الدرس بنجاح",
    deletedId: id
  });
});

// Get specific lesson by ID
router.get("/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const lesson = lessons.get(id);
  
  if (!lesson) {
    return res.status(404).json({ message: "الدرس غير موجود" });
  }
  
  res.json({ lesson });
});

// Get user's lesson progress with analytics
router.get("/progress/me", authenticate(), (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const stats = lessonService.getUserStats(userId);
  
  // Calculate detailed analytics
  const totalLessons = lessons.size;
  const completionRate = (progress.completedLessons.length / totalLessons) * 100;
  
  // Calculate average quiz score
  const avgQuizScore = progress.quizResults.length > 0
    ? progress.quizResults.reduce((sum, r) => sum + (r.score / r.maxScore) * 100, 0) / progress.quizResults.length
    : 0;

  // Get progress by category
  const progressByCategory: Record<string, number> = {};
  for (const lesson of lessons.values()) {
    if (!progressByCategory[lesson.category]) {
      progressByCategory[lesson.category] = 0;
    }
    if (progress.completedLessons.includes(lesson.id)) {
      progressByCategory[lesson.category]++;
    }
  }

  res.json({
    stats,
    completionRate: (stats.totalLessonsCompleted / lessonService.getAllLessons().total) * 100
  });
});

// Get progress for specific lesson
router.get("/progress/lesson/:lessonId", authenticate(), (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { lessonId } = req.params;
  const progress = lessonService.getUserProgress(userId, lessonId);
  
  res.json({ progress });
});

// Update lesson progress
router.post("/progress/:lessonId", authenticate(), (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { lessonId } = req.params;
  const { progress, timeSpent, currentContentBlockId, bookmarks, notes } = req.body;
  
  const updatedProgress = lessonService.updateProgress({
    userId,
    lessonId,
    status: progress >= 100 ? 'completed' : progress > 0 ? 'in_progress' : 'not_started',
    progress,
    analytics: {
      completionRate,
      totalLessons,
      completedLessons: progress.completedLessons.length,
      totalPoints: progress.totalPoints,
      certificates: progress.certificates.length,
      quizzesTaken: progress.quizResults.length,
      averageQuizScore: Math.round(avgQuizScore),
      progressByCategory
    }
  });
  
  res.json({ progress: updatedProgress, message: "تم تحديث التقدم بنجاح" });
});

// Mark lesson as completed
router.post("/:id/complete", authenticate(), (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id } = req.params;
  
  const lesson = lessons.get(id);
  if (!lesson) {
    return res.status(404).json({ message: "الدرس غير موجود" });
  }
  
  let progress = userLessonProgress.get(userId) || getDefaultProgress(userId);
  
  if (progress.completedLessons.includes(id)) {
    return res.status(400).json({ message: "الدرس مكتمل بالفعل" });
  }
  
  progress.completedLessons.push(id);
  progress.totalPoints += lesson.points;
  progress.lastAccessedLesson = id;
  progress.lastAccessedDate = new Date().toISOString();
  
  userLessonProgress.set(userId, progress);
  
  res.json({
    message: "تم إتمام الدرس بنجاح",
    progress,
    points: lesson.points,
    totalPoints: progress.totalPoints,
    completedLessons: progress.completedLessons.length
  });
});

// Submit quiz result
router.post("/:id/quiz", authenticate(), (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id } = req.params;
  const { answers } = req.body;
  
  const lesson = lessons.get(id);
  if (!lesson || !lesson.quiz) {
    return res.status(404).json({ message: "الاختبار غير موجود" });
  }
  
  if (!Array.isArray(answers)) {
    return res.status(400).json({ message: "الإجابات يجب أن تكون مصفوفة" });
  }
  
  try {
    const attempt = lessonService.submitQuiz(userId, id, answers);
    const achievements = lessonService.checkAndAwardAchievements(userId);
    const stats = lessonService.getUserStats(userId);
    
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
  const passed = percentage >= 70;
  
  let progress = userLessonProgress.get(userId) || getDefaultProgress(userId);
  
  progress.quizResults.push({
    lessonId: id,
    score,
    maxScore,
    date: new Date().toISOString(),
    passed
  });
  
  // Award points for passing (70% or higher)
  let bonusPoints = 0;
  if (passed && !progress.completedLessons.includes(id)) {
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
  
  progress.lastAccessedLesson = id;
  progress.lastAccessedDate = new Date().toISOString();
  
  userLessonProgress.set(userId, progress);
  
  res.json({
    score,
    maxScore,
    percentage,
    passed,
    results,
    bonusPoints,
    certificate,
    message: passed 
      ? "أحسنت! لقد نجحت في الاختبار" 
      : "يجب الحصول على 70% على الأقل للنجاح"
  });
});

// Get user certificates
router.get("/certificates/me", authenticate(), (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const certificates = lessonService.getUserCertificates(userId);
  res.json({ certificates, total: certificates.length });
});

// Get user achievements
router.get("/achievements/me", authenticate(), (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const achievements = lessonService.getUserAchievements(userId);
  res.json({ achievements, total: achievements.length });
});

// Get user notifications
router.get("/notifications/me", authenticate(), (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const unreadOnly = req.query.unread === 'true';
  const notifications = lessonService.getUserNotifications(userId, unreadOnly);
  res.json({ notifications, total: notifications.length });
});

// Mark notification as read
router.post("/notifications/:notificationId/read", authenticate(), (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { notificationId } = req.params;
  const success = lessonService.markNotificationAsRead(userId, notificationId);
  
  if (!success) {
    return res.status(404).json({ message: "الإشعار غير موجود" });
  }
  
  const certificates = progress.certificates.map(lessonId => {
    const lesson = lessons.get(lessonId);
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
  
  res.json({ leaderboard, total: leaderboard.length });
});

// Get user notifications
router.get("/notifications/me", authenticate(), (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const userNotifs = lessonNotifications.get(userId) || [];
  
  res.json({ 
    notifications: userNotifs.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ),
    total: userNotifs.length,
    unread: userNotifs.filter(n => !n.read).length
  });
});

// Mark notification as read
router.put("/notifications/:notificationId/read", authenticate(), (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { notificationId } = req.params;
  
  const userNotifs = lessonNotifications.get(userId) || [];
  const notification = userNotifs.find(n => n.id === notificationId);
  
  if (!notification) {
    return res.status(404).json({ message: "الإشعار غير موجود" });
  }
  
  notification.read = true;
  lessonNotifications.set(userId, userNotifs);
  
  res.json({ message: "تم تحديث حالة الإشعار", notification });
});

// Mark all notifications as read
router.put("/notifications/read-all", authenticate(), (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const userNotifs = lessonNotifications.get(userId) || [];
  
  userNotifs.forEach(n => n.read = true);
  lessonNotifications.set(userId, userNotifs);
  
  res.json({ message: "تم تحديث جميع الإشعارات", updated: userNotifs.length });
});

// Get lesson statistics (Admin)
router.get("/stats/overview", authenticate(["admin", "teacher"]), (_req: Request, res: Response) => {
  const allLessons = Array.from(lessons.values());
  const allProgress = Array.from(userLessonProgress.values());
  
  const stats = {
    totalLessons: lessons.size,
    publishedLessons: allLessons.filter(l => l.isPublished).length,
    totalStudents: allProgress.length,
    totalCompletions: allProgress.reduce((sum, p) => sum + p.completedLessons.length, 0),
    totalQuizzesTaken: allProgress.reduce((sum, p) => sum + p.quizResults.length, 0),
    totalCertificatesIssued: allProgress.reduce((sum, p) => sum + p.certificates.length, 0),
    averageCompletionRate: allProgress.length > 0 && lessons.size > 0
      ? (allProgress.reduce((sum, p) => sum + p.completedLessons.length, 0) / (allProgress.length * lessons.size)) * 100
      : 0,
    lessonsByCategory: {
      aqidah: allLessons.filter(l => l.category === "aqidah").length,
      fiqh: allLessons.filter(l => l.category === "fiqh").length,
      sirah: allLessons.filter(l => l.category === "sirah").length,
      tafsir: allLessons.filter(l => l.category === "tafsir").length,
      hadith: allLessons.filter(l => l.category === "hadith").length,
      akhlaq: allLessons.filter(l => l.category === "akhlaq").length,
      tajweed: allLessons.filter(l => l.category === "tajweed").length
    }
  };
  
  res.json(stats);
});

export default router;
