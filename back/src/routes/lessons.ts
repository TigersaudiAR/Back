import express from "express";
import { v4 as uuid } from "uuid";
import aqeedahData from "../../data/seed/lessons/aqeedah.json" with { type: "json" };
import fiqhData from "../../data/seed/lessons/fiqh.json" with { type: "json" };
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// All courses
const courses = [aqeedahData, fiqhData];

// In-memory storage for user progress (in production, use a database)
const userLessonProgress = new Map<string, any>();
const userCertificates = new Map<string, any[]>();

// Get all courses
router.get("/courses", (_req, res) => {
  const courseList = courses.map((course) => ({
    course_id: course.course_id,
    title: course.title,
    title_en: course.title_en,
    category: course.category,
    level: course.level,
    description: course.description,
    total_lessons: course.total_lessons,
    estimated_hours: course.estimated_hours
  }));
  
  res.json({
    courses: courseList,
    total: courseList.length
  });
});

// Get specific course
router.get("/courses/:courseId", (req, res) => {
  const { courseId } = req.params;
  const course = courses.find((c) => c.course_id === courseId);
  
  if (!course) {
    return res.status(404).json({ message: "الدورة غير موجودة" });
  }
  
  res.json(course);
});

// Get course lessons
router.get("/courses/:courseId/lessons", (req, res) => {
  const { courseId } = req.params;
  const course = courses.find((c) => c.course_id === courseId);
  
  if (!course) {
    return res.status(404).json({ message: "الدورة غير موجودة" });
  }
  
  res.json({
    course_id: course.course_id,
    lessons: course.lessons,
    total: course.lessons.length
  });
});

// Get specific lesson
router.get("/courses/:courseId/lessons/:lessonId", (req, res) => {
  const { courseId, lessonId } = req.params;
  const course = courses.find((c) => c.course_id === courseId);
  
  if (!course) {
    return res.status(404).json({ message: "الدورة غير موجودة" });
  }
  
  const lesson = course.lessons.find((l: any) => l.id === lessonId);
  
  if (!lesson) {
    return res.status(404).json({ message: "الدرس غير موجود" });
  }
  
  res.json(lesson);
});

// Get lesson quiz
router.get("/courses/:courseId/lessons/:lessonId/quiz", (req, res) => {
  const { courseId, lessonId } = req.params;
  const course = courses.find((c) => c.course_id === courseId);
  
  if (!course) {
    return res.status(404).json({ message: "الدورة غير موجودة" });
  }
  
  const lesson = course.lessons.find((l: any) => l.id === lessonId);
  
  if (!lesson || !lesson.quiz) {
    return res.status(404).json({ message: "الاختبار غير موجود" });
  }
  
  res.json({
    lesson_id: lesson.id,
    quiz: lesson.quiz
  });
});

// Submit quiz answers
router.post("/courses/:courseId/lessons/:lessonId/quiz/submit", authenticate(), (req, res) => {
  const { courseId, lessonId } = req.params;
  const { userId, answers } = req.body;
  
  const course = courses.find((c) => c.course_id === courseId);
  if (!course) {
    return res.status(404).json({ message: "الدورة غير موجودة" });
  }
  
  const lesson = course.lessons.find((l: any) => l.id === lessonId);
  if (!lesson || !lesson.quiz) {
    return res.status(404).json({ message: "الاختبار غير موجود" });
  }
  
  // Calculate score
  const questions = lesson.quiz.questions;
  let correctCount = 0;
  const results = questions.map((q: any, index: number) => {
    const userAnswer = answers[index];
    const isCorrect = userAnswer === q.correct_answer;
    if (isCorrect) correctCount++;
    
    return {
      question_id: q.id,
      user_answer: userAnswer,
      correct_answer: q.correct_answer,
      is_correct: isCorrect
    };
  });
  
  const score = (correctCount / questions.length) * 100;
  const passed = score >= 70;
  
  // Update user progress
  const progressKey = `${userId}-${courseId}`;
  const progress = userLessonProgress.get(progressKey) || {
    userId,
    courseId,
    completed_lessons: [],
    quiz_results: [],
    points: 0
  };
  
  const quizResult = {
    id: uuid(),
    lesson_id: lessonId,
    score,
    passed,
    results,
    submitted_at: new Date().toISOString()
  };
  
  progress.quiz_results.push(quizResult);
  
  if (passed && !progress.completed_lessons.includes(lessonId)) {
    progress.completed_lessons.push(lessonId);
    progress.points += 100; // Award points for completing lesson
  }
  
  userLessonProgress.set(progressKey, progress);
  
  res.json({
    message: passed ? "مبارك! اجتزت الاختبار بنجاح" : "للأسف، لم تجتز الاختبار. حاول مرة أخرى",
    quiz_result: quizResult,
    passed,
    score,
    points_earned: passed ? 100 : 0,
    total_points: progress.points
  });
});

// Get user progress for a course
router.get("/progress/:userId/:courseId", (req, res) => {
  const { userId, courseId } = req.params;
  const progressKey = `${userId}-${courseId}`;
  const progress = userLessonProgress.get(progressKey);
  
  if (!progress) {
    return res.json({
      userId,
      courseId,
      completed_lessons: [],
      quiz_results: [],
      points: 0,
      completion_percentage: 0
    });
  }
  
  const course = courses.find((c) => c.course_id === courseId);
  const completionPercentage = course 
    ? (progress.completed_lessons.length / course.total_lessons) * 100 
    : 0;
  
  res.json({
    ...progress,
    completion_percentage: completionPercentage
  });
});

// Get all user progress
router.get("/progress/:userId", (req, res) => {
  const { userId } = req.params;
  const allProgress: any[] = [];
  
  userLessonProgress.forEach((progress, key) => {
    if (key.startsWith(`${userId}-`)) {
      const course = courses.find((c) => c.course_id === progress.courseId);
      const completionPercentage = course 
        ? (progress.completed_lessons.length / course.total_lessons) * 100 
        : 0;
      
      allProgress.push({
        ...progress,
        course_title: course?.title,
        completion_percentage: completionPercentage
      });
    }
  });
  
  res.json({
    userId,
    courses: allProgress,
    total_points: allProgress.reduce((sum, p) => sum + p.points, 0)
  });
});

// Issue certificate
router.post("/certificates/:userId/:courseId", authenticate(), (req, res) => {
  const { userId, courseId } = req.params;
  const progressKey = `${userId}-${courseId}`;
  const progress = userLessonProgress.get(progressKey);
  
  const course = courses.find((c) => c.course_id === courseId);
  if (!course) {
    return res.status(404).json({ message: "الدورة غير موجودة" });
  }
  
  if (!progress || progress.completed_lessons.length < course.total_lessons) {
    return res.status(400).json({ 
      message: "يجب إكمال جميع الدروس للحصول على الشهادة" 
    });
  }
  
  const certificate = {
    id: uuid(),
    userId,
    courseId,
    course_title: course.title,
    issued_at: new Date().toISOString(),
    certificate_number: `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  };
  
  const userCerts = userCertificates.get(userId) || [];
  userCerts.push(certificate);
  userCertificates.set(userId, userCerts);
  
  res.json({
    message: "مبارك! تم إصدار الشهادة بنجاح",
    certificate
  });
});

// Get user certificates
router.get("/certificates/:userId", (req, res) => {
  const { userId } = req.params;
  const certificates = userCertificates.get(userId) || [];
  
  res.json({
    userId,
    certificates,
    total: certificates.length
  });
});

export const lessonsRouter = router;
