import express, { Request, Response } from "express";
import { authenticate } from "../middleware/auth.js";
import { lessonService } from "../services/lessonService.js";
import {
  CreateLessonDTO,
  UpdateLessonDTO,
  LessonSearchCriteria
} from "../types/lesson.types.js";

const router = express.Router();

// Get all lessons with advanced search and filtering
router.get("/", (req: Request, res: Response) => {
  const criteria: LessonSearchCriteria = {
    query: req.query.query as string,
    category: req.query.category as any,
    level: req.query.level as any,
    status: (req.query.status as any) || "published",
    featured: req.query.featured === "true",
    minDuration: req.query.minDuration ? parseInt(req.query.minDuration as string) : undefined,
    maxDuration: req.query.maxDuration ? parseInt(req.query.maxDuration as string) : undefined,
    sortBy: req.query.sortBy as any,
    sortOrder: req.query.sortOrder as any,
    page: req.query.page ? parseInt(req.query.page as string) : 1,
    limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
    topics: req.query.topics ? (req.query.topics as string).split(',') : undefined
  };

  const result = lessonService.getAllLessons(criteria);
  res.json(result);
});

// Get lessons by category
router.get("/category/:category", (req: Request, res: Response) => {
  const { category } = req.params;
  const result = lessonService.getAllLessons({ 
    category: category as any,
    status: "published"
  });
  
  if (result.total === 0) {
    return res.status(404).json({ message: "لا توجد دروس في هذا التصنيف" });
  }
  
  res.json(result);
});

// Create new lesson (admin/teacher only)
router.post("/", authenticate(["admin", "teacher"]), (req: Request, res: Response) => {
  try {
    const dto: CreateLessonDTO = req.body;
    const userId = (req as any).user.id;
    const lesson = lessonService.createLesson(dto, userId);
    res.status(201).json({ lesson, message: "تم إنشاء الدرس بنجاح" });
  } catch (error) {
    res.status(400).json({ message: "فشل إنشاء الدرس", error: (error as Error).message });
  }
});

// Update lesson (admin/teacher only)
router.put("/:id", authenticate(["admin", "teacher"]), (req: Request, res: Response) => {
  try {
    const dto: UpdateLessonDTO = { ...req.body, id: req.params.id };
    const lesson = lessonService.updateLesson(dto);
    
    if (!lesson) {
      return res.status(404).json({ message: "الدرس غير موجود" });
    }
    
    res.json({ lesson, message: "تم تحديث الدرس بنجاح" });
  } catch (error) {
    res.status(400).json({ message: "فشل تحديث الدرس", error: (error as Error).message });
  }
});

// Delete lesson (admin only)
router.delete("/:id", authenticate(["admin"]), (req: Request, res: Response) => {
  const { id } = req.params;
  const success = lessonService.deleteLesson(id);
  
  if (!success) {
    return res.status(404).json({ message: "الدرس غير موجود" });
  }
  
  res.json({ message: "تم حذف الدرس بنجاح" });
});

// Get specific lesson by ID
router.get("/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const lesson = lessonService.getLessonById(id);
  
  if (!lesson) {
    return res.status(404).json({ message: "الدرس غير موجود" });
  }
  
  res.json({ lesson });
});

// Get user's lesson progress
router.get("/progress/me", authenticate(), (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const stats = lessonService.getUserStats(userId);
  
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
    timeSpent,
    currentContentBlockId,
    bookmarks,
    notes
  });
  
  res.json({ progress: updatedProgress, message: "تم تحديث التقدم بنجاح" });
});

// Mark lesson as completed
router.post("/:id/complete", authenticate(), (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id } = req.params;
  
  const lesson = lessonService.getLessonById(id);
  if (!lesson) {
    return res.status(404).json({ message: "الدرس غير موجود" });
  }
  
  const progress = lessonService.completeLesson(userId, id);
  const achievements = lessonService.checkAndAwardAchievements(userId);
  
  res.json({
    message: "تم إتمام الدرس بنجاح",
    progress,
    points: lesson.points,
    newAchievements: achievements
  });
});

// Submit quiz result
router.post("/:id/quiz", authenticate(), (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id } = req.params;
  const { answers } = req.body;
  
  const lesson = lessonService.getLessonById(id);
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
    
    // Award bonus points
    let bonusPoints = 0;
    if (attempt.passed) {
      bonusPoints = Math.floor(lesson.points * 0.5);
    }
    
    // Get certificate if perfect score
    let certificate;
    if (attempt.percentage === 100) {
      const certificates = lessonService.getUserCertificates(userId);
      certificate = certificates.find(c => c.lessonId === id);
    }
    
    res.json({
      attempt,
      bonusPoints,
      certificate,
      newAchievements: achievements,
      message: attempt.passed 
        ? "أحسنت! لقد نجحت في الاختبار" 
        : "يجب الحصول على 70% على الأقل للنجاح"
    });
  } catch (error) {
    res.status(400).json({ message: "فشل إرسال الاختبار", error: (error as Error).message });
  }
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
  
  res.json({ message: "تم تحديث حالة الإشعار" });
});

// Get notification preferences
router.get("/notifications/preferences", authenticate(), (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const preferences = lessonService.getNotificationPreferences(userId);
  res.json({ preferences });
});

// Update notification preferences
router.put("/notifications/preferences", authenticate(), (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const preferences = lessonService.updateNotificationPreferences(userId, req.body);
  res.json({ preferences, message: "تم تحديث تفضيلات الإشعارات" });
});

// Get leaderboard
router.get("/leaderboard/top", (_req: Request, res: Response) => {
  // Get all user stats from the lesson service
  // Note: In production, this should be optimized with a proper database query
  // For now, we return an empty leaderboard since we don't have a way to iterate all users
  const leaderboard: any[] = [];
  
  res.json({ 
    leaderboard,
    message: "يتطلب نظام المتصدرين قاعدة بيانات للمستخدمين"
  });
});

// Get all topics
router.get("/topics/all", (_req: Request, res: Response) => {
  const topics = lessonService.getAllTopics();
  res.json({ topics, total: topics.length });
});

// Get topics by category
router.get("/topics/category/:category", (req: Request, res: Response) => {
  const { category } = req.params;
  const topics = lessonService.getTopicsByCategory(category as any);
  res.json({ topics, total: topics.length });
});

// Create topic (admin/teacher only)
router.post("/topics", authenticate(["admin", "teacher"]), (req: Request, res: Response) => {
  try {
    const topic = lessonService.createTopic(req.body);
    res.status(201).json({ topic, message: "تم إنشاء الموضوع بنجاح" });
  } catch (error) {
    res.status(400).json({ message: "فشل إنشاء الموضوع", error: (error as Error).message });
  }
});

export default router;
