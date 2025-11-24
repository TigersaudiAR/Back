/**
 * Comprehensive Lesson Service
 * Handles all lesson-related data operations with in-memory storage
 * In production, this would be replaced with a proper database
 */

import {
  Lesson,
  LessonCategory,
  LessonLevel,
  LessonStatus,
  Topic,
  UserLessonProgress,
  QuizAttempt,
  Achievement,
  UserAchievement,
  Certificate,
  Notification,
  UserLessonStats,
  LessonSearchCriteria,
  LessonSearchResult,
  CreateLessonDTO,
  UpdateLessonDTO,
  MediaContent,
  NotificationPreferences
} from '../types/lesson.types.js';
import lessonsData from '../../data/seed/lessons/lessons.json' with { type: "json" };

// In-memory storage (replace with database in production)
class LessonStore {
  private lessons: Map<string, Lesson> = new Map();
  private topics: Map<string, Topic> = new Map();
  private userProgress: Map<string, Map<string, UserLessonProgress>> = new Map();
  private quizAttempts: Map<string, QuizAttempt[]> = new Map();
  private achievements: Map<string, Achievement> = new Map();
  private userAchievements: Map<string, UserAchievement[]> = new Map();
  private certificates: Map<string, Certificate[]> = new Map();
  private notifications: Map<string, Notification[]> = new Map();
  private userStats: Map<string, UserLessonStats> = new Map();
  private notificationPrefs: Map<string, NotificationPreferences> = new Map();

  constructor() {
    this.initializeFromSeedData();
    this.initializeAchievements();
  }

  private initializeFromSeedData() {
    // Convert legacy lesson format to new comprehensive format
    lessonsData.forEach((legacyLesson: any, index: number) => {
      const lesson: Lesson = {
        id: legacyLesson.id,
        category: legacyLesson.category as LessonCategory,
        topics: [],
        title: legacyLesson.title,
        title_en: legacyLesson.title_en,
        slug: this.generateSlug(legacyLesson.title_en || legacyLesson.title),
        level: legacyLesson.level as LessonLevel,
        duration: legacyLesson.duration,
        description: legacyLesson.description,
        objectives: legacyLesson.objectives || [],
        prerequisites: [],
        content: this.convertLegacyContent(legacyLesson.content || []),
        media: [],
        quiz: legacyLesson.quiz?.map((q: any, idx: number) => ({
          id: `${legacyLesson.id}-q${idx}`,
          question: q.question,
          options: q.options,
          correct: q.correct,
          explanation: q.explanation,
          points: 1,
          difficulty: legacyLesson.level
        })) || [],
        points: legacyLesson.points || 10,
        order: legacyLesson.order || index + 1,
        status: "published" as LessonStatus,
        featured: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        viewCount: 0,
        completionCount: 0,
        averageRating: 0
      };
      this.lessons.set(lesson.id, lesson);
    });
  }

  private convertLegacyContent(legacyContent: any[]): any[] {
    return legacyContent.map((block, idx) => ({
      id: `block-${idx}`,
      type: block.type,
      order: idx,
      title: block.title,
      body: block.body,
      items: block.items,
      text: block.text,
      source: block.source
    }));
  }

  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private initializeAchievements() {
    const achievements: Achievement[] = [
      {
        id: 'first_lesson',
        name: 'البداية الموفقة',
        description: 'أكمل درسك الأول',
        icon: '🎯',
        category: 'general',
        criteria: { type: 'lessons_completed', value: 1 },
        points: 10,
        rarity: 'common'
      },
      {
        id: 'five_lessons',
        name: 'طالب العلم',
        description: 'أكمل 5 دروس',
        icon: '📚',
        category: 'general',
        criteria: { type: 'lessons_completed', value: 5 },
        points: 25,
        rarity: 'common'
      },
      {
        id: 'perfect_quiz',
        name: 'الإتقان الكامل',
        description: 'احصل على درجة كاملة في اختبار',
        icon: '⭐',
        category: 'general',
        criteria: { type: 'perfect_score', value: 1 },
        points: 20,
        rarity: 'rare'
      },
      {
        id: 'aqidah_master',
        name: 'عالم العقيدة',
        description: 'أكمل جميع دروس العقيدة',
        icon: '🕌',
        category: 'aqidah',
        criteria: { type: 'category_mastery', value: 100, categoryFilter: 'aqidah' },
        points: 50,
        rarity: 'epic'
      },
      {
        id: 'week_streak',
        name: 'المثابر الأسبوعي',
        description: '7 أيام متتالية من التعلم',
        icon: '🔥',
        category: 'general',
        criteria: { type: 'streak', value: 7 },
        points: 30,
        rarity: 'rare'
      }
    ];

    achievements.forEach(achievement => {
      this.achievements.set(achievement.id, achievement);
    });
  }

  // Lesson CRUD Operations
  getAllLessons(criteria?: LessonSearchCriteria): LessonSearchResult {
    let filtered = Array.from(this.lessons.values());

    // Apply filters
    if (criteria?.category) {
      filtered = filtered.filter(l => l.category === criteria.category);
    }
    if (criteria?.level) {
      filtered = filtered.filter(l => l.level === criteria.level);
    }
    if (criteria?.status) {
      filtered = filtered.filter(l => l.status === criteria.status);
    }
    if (criteria?.featured !== undefined) {
      filtered = filtered.filter(l => l.featured === criteria.featured);
    }
    if (criteria?.minDuration) {
      filtered = filtered.filter(l => l.duration >= criteria.minDuration!);
    }
    if (criteria?.maxDuration) {
      filtered = filtered.filter(l => l.duration <= criteria.maxDuration!);
    }
    if (criteria?.topics && criteria.topics.length > 0) {
      filtered = filtered.filter(l => 
        l.topics?.some(t => criteria.topics!.includes(t))
      );
    }
    if (criteria?.query) {
      const query = criteria.query.toLowerCase();
      filtered = filtered.filter(l =>
        l.title.toLowerCase().includes(query) ||
        l.description.toLowerCase().includes(query) ||
        l.title_en?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    const sortBy = criteria?.sortBy || 'order';
    const sortOrder = criteria?.sortOrder || 'asc';
    filtered.sort((a, b) => {
      let aVal: any, bVal: any;
      switch (sortBy) {
        case 'title':
          aVal = a.title;
          bVal = b.title;
          break;
        case 'created':
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
          break;
        case 'updated':
          aVal = new Date(a.updatedAt).getTime();
          bVal = new Date(b.updatedAt).getTime();
          break;
        case 'popularity':
          aVal = a.viewCount || 0;
          bVal = b.viewCount || 0;
          break;
        case 'rating':
          aVal = a.averageRating || 0;
          bVal = b.averageRating || 0;
          break;
        case 'duration':
          aVal = a.duration;
          bVal = b.duration;
          break;
        default:
          aVal = a.order;
          bVal = b.order;
      }
      
      if (typeof aVal === 'string') {
        return sortOrder === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    // Pagination
    const page = criteria?.page || 1;
    const limit = criteria?.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedLessons = filtered.slice(startIndex, endIndex);

    // Calculate facets
    const facets = {
      categories: {} as Record<LessonCategory, number>,
      levels: {} as Record<LessonLevel, number>,
      topics: {} as Record<string, number>
    };

    filtered.forEach(lesson => {
      facets.categories[lesson.category] = (facets.categories[lesson.category] || 0) + 1;
      facets.levels[lesson.level] = (facets.levels[lesson.level] || 0) + 1;
      lesson.topics?.forEach(topicId => {
        facets.topics[topicId] = (facets.topics[topicId] || 0) + 1;
      });
    });

    return {
      lessons: paginatedLessons,
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit),
      facets
    };
  }

  getLessonById(id: string): Lesson | undefined {
    const lesson = this.lessons.get(id);
    if (lesson) {
      // Increment view count
      lesson.viewCount = (lesson.viewCount || 0) + 1;
    }
    return lesson;
  }

  createLesson(dto: CreateLessonDTO, authorId?: string): Lesson {
    const id = `lesson-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const lesson: Lesson = {
      ...dto,
      id,
      slug: this.generateSlug(dto.title_en || dto.title),
      status: dto.status || 'draft',
      featured: dto.featured || false,
      createdAt: now,
      updatedAt: now,
      publishedAt: dto.status === 'published' ? now : undefined,
      author: authorId,
      viewCount: 0,
      completionCount: 0,
      averageRating: 0
    };

    this.lessons.set(id, lesson);
    return lesson;
  }

  updateLesson(dto: UpdateLessonDTO): Lesson | undefined {
    const existing = this.lessons.get(dto.id);
    if (!existing) return undefined;

    const updated: Lesson = {
      ...existing,
      ...dto,
      updatedAt: new Date().toISOString(),
      publishedAt: dto.status === 'published' && !existing.publishedAt 
        ? new Date().toISOString() 
        : existing.publishedAt
    };

    this.lessons.set(dto.id, updated);
    return updated;
  }

  deleteLesson(id: string): boolean {
    return this.lessons.delete(id);
  }

  // Progress Tracking
  getUserProgress(userId: string, lessonId?: string): UserLessonProgress | Map<string, UserLessonProgress> {
    const userProgressMap = this.userProgress.get(userId) || new Map();
    
    if (lessonId) {
      return userProgressMap.get(lessonId) || this.createDefaultProgress(userId, lessonId);
    }
    
    return userProgressMap;
  }

  private createDefaultProgress(userId: string, lessonId: string): UserLessonProgress {
    return {
      userId,
      lessonId,
      status: 'not_started',
      progress: 0,
      timeSpent: 0,
      lastAccessedAt: new Date().toISOString()
    };
  }

  updateProgress(progress: Partial<UserLessonProgress> & { userId: string; lessonId: string }): UserLessonProgress {
    const { userId, lessonId } = progress;
    
    if (!this.userProgress.has(userId)) {
      this.userProgress.set(userId, new Map());
    }
    
    const userProgressMap = this.userProgress.get(userId)!;
    const existing = userProgressMap.get(lessonId) || this.createDefaultProgress(userId, lessonId);
    
    const updated: UserLessonProgress = {
      ...existing,
      ...progress,
      lastAccessedAt: new Date().toISOString()
    };
    
    userProgressMap.set(lessonId, updated);
    
    // Update user stats
    this.updateUserStats(userId);
    
    return updated;
  }

  completeLesson(userId: string, lessonId: string): UserLessonProgress {
    const lesson = this.lessons.get(lessonId);
    if (lesson) {
      lesson.completionCount = (lesson.completionCount || 0) + 1;
    }

    return this.updateProgress({
      userId,
      lessonId,
      status: 'completed',
      progress: 100,
      completedAt: new Date().toISOString()
    });
  }

  // Quiz Management
  submitQuiz(userId: string, lessonId: string, answers: number[]): QuizAttempt {
    const lesson = this.getLessonById(lessonId);
    if (!lesson || !lesson.quiz) {
      throw new Error('Quiz not found');
    }

    const userAttempts = this.quizAttempts.get(`${userId}-${lessonId}`) || [];
    const attemptNumber = userAttempts.length + 1;

    let correctCount = 0;
    const results = lesson.quiz.map((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correct;
      if (isCorrect) correctCount++;

      return {
        questionId: question.id,
        question: question.question,
        userAnswer,
        correctAnswer: question.correct,
        isCorrect,
        explanation: question.explanation,
        points: isCorrect ? (question.points || 1) : 0
      };
    });

    const score = correctCount;
    const maxScore = lesson.quiz.length;
    const percentage = (score / maxScore) * 100;
    const passed = percentage >= 70;

    const attempt: QuizAttempt = {
      id: `attempt-${Date.now()}`,
      userId,
      lessonId,
      score,
      maxScore,
      percentage,
      passed,
      answers,
      results,
      attemptNumber,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      timeSpent: 0
    };

    userAttempts.push(attempt);
    this.quizAttempts.set(`${userId}-${lessonId}`, userAttempts);

    // Award certificate for perfect score
    if (percentage === 100) {
      this.awardCertificate(userId, lessonId, lesson.title, lesson.category, percentage);
    }

    // Check for achievements
    this.checkAndAwardAchievements(userId);

    return attempt;
  }

  // Certificate Management
  awardCertificate(userId: string, lessonId: string, lessonTitle: string, category: LessonCategory, score: number): Certificate {
    const certificate: Certificate = {
      id: `cert-${Date.now()}`,
      userId,
      lessonId,
      lessonTitle,
      category,
      score,
      issuedAt: new Date().toISOString()
    };

    if (!this.certificates.has(userId)) {
      this.certificates.set(userId, []);
    }
    this.certificates.get(userId)!.push(certificate);

    return certificate;
  }

  getUserCertificates(userId: string): Certificate[] {
    return this.certificates.get(userId) || [];
  }

  // Achievement Management
  checkAndAwardAchievements(userId: string): Achievement[] {
    const stats = this.getUserStats(userId);
    const userAchievements = this.userAchievements.get(userId) || [];
    const earnedIds = new Set(userAchievements.map(a => a.achievementId));
    const newAchievements: Achievement[] = [];

    this.achievements.forEach(achievement => {
      if (earnedIds.has(achievement.id)) return;

      let eligible = false;
      switch (achievement.criteria.type) {
        case 'lessons_completed':
          eligible = stats.totalLessonsCompleted >= achievement.criteria.value;
          break;
        case 'perfect_score':
          eligible = stats.perfectScores >= achievement.criteria.value;
          break;
        case 'streak':
          eligible = stats.streak >= achievement.criteria.value;
          break;
        case 'category_mastery':
          if (achievement.criteria.categoryFilter) {
            const categoryProgress = stats.categoryProgress[achievement.criteria.categoryFilter];
            eligible = categoryProgress && categoryProgress.percentage >= achievement.criteria.value;
          }
          break;
      }

      if (eligible) {
        const userAchievement: UserAchievement = {
          userId,
          achievementId: achievement.id,
          earnedAt: new Date().toISOString()
        };
        userAchievements.push(userAchievement);
        newAchievements.push(achievement);
        
        // Create notification
        this.createNotification(userId, {
          type: 'achievement',
          title: 'إنجاز جديد!',
          message: `تهانينا! حصلت على إنجاز "${achievement.name}"`,
          relatedAchievementId: achievement.id
        });
      }
    });

    if (newAchievements.length > 0) {
      this.userAchievements.set(userId, userAchievements);
    }

    return newAchievements;
  }

  getUserAchievements(userId: string): Achievement[] {
    const userAchievements = this.userAchievements.get(userId) || [];
    return userAchievements
      .map(ua => this.achievements.get(ua.achievementId))
      .filter(a => a !== undefined) as Achievement[];
  }

  // Statistics
  getUserStats(userId: string): UserLessonStats {
    if (this.userStats.has(userId)) {
      return this.userStats.get(userId)!;
    }

    const stats = this.calculateUserStats(userId);
    this.userStats.set(userId, stats);
    return stats;
  }

  private calculateUserStats(userId: string): UserLessonStats {
    const progressMap = this.userProgress.get(userId) || new Map();
    const completedLessons = Array.from(progressMap.values()).filter(p => p.status === 'completed');
    
    const categoryProgress: Record<LessonCategory, any> = {} as any;
    const levelProgress: Record<LessonLevel, any> = {} as any;
    
    let totalPoints = 0;
    let totalTimeSpent = 0;
    
    completedLessons.forEach(progress => {
      const lesson = this.lessons.get(progress.lessonId);
      if (lesson) {
        totalPoints += lesson.points;
        totalTimeSpent += progress.timeSpent;
        
        if (!categoryProgress[lesson.category]) {
          categoryProgress[lesson.category] = { completed: 0, total: 0, percentage: 0 };
        }
        categoryProgress[lesson.category].completed++;
        
        if (!levelProgress[lesson.level]) {
          levelProgress[lesson.level] = { completed: 0, total: 0 };
        }
        levelProgress[lesson.level].completed++;
      }
    });

    // Calculate totals for categories and levels
    this.lessons.forEach(lesson => {
      if (!categoryProgress[lesson.category]) {
        categoryProgress[lesson.category] = { completed: 0, total: 0, percentage: 0 };
      }
      categoryProgress[lesson.category].total++;
      categoryProgress[lesson.category].percentage = 
        (categoryProgress[lesson.category].completed / categoryProgress[lesson.category].total) * 100;
      
      if (!levelProgress[lesson.level]) {
        levelProgress[lesson.level] = { completed: 0, total: 0 };
      }
      levelProgress[lesson.level].total++;
    });

    const achievements = this.userAchievements.get(userId) || [];
    const certificates = this.certificates.get(userId) || [];
    
    // Calculate quiz stats
    const allAttempts = Array.from(this.quizAttempts.keys())
      .filter(key => key.startsWith(userId))
      .flatMap(key => this.quizAttempts.get(key) || []);
    
    const averageQuizScore = allAttempts.length > 0
      ? allAttempts.reduce((sum, a) => sum + a.percentage, 0) / allAttempts.length
      : 0;
    
    const perfectScores = allAttempts.filter(a => a.percentage === 100).length;

    // Calculate streak based on completion dates
    let streak = 0;
    if (completedLessons.length > 0) {
      const sortedLessons = completedLessons
        .filter(p => p.completedAt)
        .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());
      
      if (sortedLessons.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let currentDate = new Date(sortedLessons[0].completedAt!);
        currentDate.setHours(0, 0, 0, 0);
        
        // Check if last activity was today or yesterday
        const dayDiff = Math.floor((today.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
        if (dayDiff <= 1) {
          streak = 1;
          let prevDate = currentDate;
          
          for (let i = 1; i < sortedLessons.length; i++) {
            const lessonDate = new Date(sortedLessons[i].completedAt!);
            lessonDate.setHours(0, 0, 0, 0);
            const diff = Math.floor((prevDate.getTime() - lessonDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (diff === 1) {
              streak++;
              prevDate = lessonDate;
            } else if (diff > 1) {
              break;
            }
          }
        }
      }
    }

    return {
      userId,
      totalLessonsCompleted: completedLessons.length,
      totalPoints,
      totalTimeSpent,
      streak,
      lastActivityDate: new Date().toISOString(),
      categoryProgress,
      levelProgress,
      achievements: achievements.map(a => a.achievementId),
      certificates: certificates.map(c => c.id),
      averageQuizScore,
      perfectScores
    };
  }

  private updateUserStats(userId: string) {
    const stats = this.calculateUserStats(userId);
    this.userStats.set(userId, stats);
  }

  // Notification Management
  createNotification(userId: string, notification: Omit<Notification, 'id' | 'userId' | 'read' | 'createdAt'>): Notification {
    const newNotification: Notification = {
      id: `notif-${Date.now()}`,
      userId,
      read: false,
      createdAt: new Date().toISOString(),
      ...notification
    };

    if (!this.notifications.has(userId)) {
      this.notifications.set(userId, []);
    }
    this.notifications.get(userId)!.push(newNotification);

    return newNotification;
  }

  getUserNotifications(userId: string, unreadOnly = false): Notification[] {
    const userNotifications = this.notifications.get(userId) || [];
    return unreadOnly 
      ? userNotifications.filter(n => !n.read)
      : userNotifications;
  }

  markNotificationAsRead(userId: string, notificationId: string): boolean {
    const userNotifications = this.notifications.get(userId);
    if (!userNotifications) return false;

    const notification = userNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      return true;
    }
    return false;
  }

  // Topic Management
  getAllTopics(): Topic[] {
    return Array.from(this.topics.values());
  }

  getTopicsByCategory(category: LessonCategory): Topic[] {
    return Array.from(this.topics.values()).filter(t => t.category === category);
  }

  createTopic(topic: Omit<Topic, 'id' | 'slug' | 'lessonCount'>): Topic {
    const id = `topic-${Date.now()}`;
    const newTopic: Topic = {
      ...topic,
      id,
      slug: this.generateSlug(topic.name_en || topic.name),
      lessonCount: 0
    };
    this.topics.set(id, newTopic);
    return newTopic;
  }

  // Notification Preferences
  getNotificationPreferences(userId: string): NotificationPreferences {
    return this.notificationPrefs.get(userId) || {
      userId,
      newLessons: true,
      lessonUpdates: true,
      achievements: true,
      reminders: true,
      emailNotifications: true,
      pushNotifications: true
    };
  }

  updateNotificationPreferences(userId: string, preferences: Partial<NotificationPreferences>): NotificationPreferences {
    const current = this.getNotificationPreferences(userId);
    const updated = { ...current, ...preferences };
    this.notificationPrefs.set(userId, updated);
    return updated;
  }
}

// Singleton instance
export const lessonService = new LessonStore();
