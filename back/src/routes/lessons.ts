import express from "express";
import aqeedahLessons from "../../data/seed/lessons/aqeedah.json" with { type: "json" };

const router = express.Router();

// Combine all lessons from different categories
const allLessons = [
  ...aqeedahLessons
];

// Get all lessons
router.get("/", (req, res) => {
  const category = typeof req.query.category === "string" ? req.query.category : undefined;
  const level = typeof req.query.level === "string" ? req.query.level : undefined;
  
  let filtered = allLessons;
  
  if (category) {
    filtered = filtered.filter((l) => l.category === category);
  }
  
  if (level) {
    filtered = filtered.filter((l) => l.level === level);
  }
  
  res.json({ 
    lessons: filtered,
    total: filtered.length,
    categories: [...new Set(allLessons.map(l => l.category))],
    levels: [...new Set(allLessons.map(l => l.level))]
  });
});

// Get specific lesson by ID
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const lesson = allLessons.find((l) => l.id === id);
  
  if (!lesson) {
    return res.status(404).json({ message: "الدرس غير موجود" });
  }
  
  res.json(lesson);
});

// Get quiz for a specific lesson
router.get("/:id/quiz", (req, res) => {
  const { id } = req.params;
  const lesson = allLessons.find((l) => l.id === id);
  
  if (!lesson) {
    return res.status(404).json({ message: "الدرس غير موجود" });
  }
  
  if (!lesson.quiz || lesson.quiz.length === 0) {
    return res.status(404).json({ message: "لا يوجد اختبار لهذا الدرس" });
  }
  
  res.json({ 
    quiz: lesson.quiz,
    lesson_id: lesson.id,
    lesson_title: lesson.title_ar
  });
});

// Submit quiz answers and get score
router.post("/:id/quiz/submit", (req, res) => {
  const { id } = req.params;
  const answers = req.body.answers as number[];
  
  const lesson = allLessons.find((l) => l.id === id);
  
  if (!lesson || !lesson.quiz) {
    return res.status(404).json({ message: "الدرس أو الاختبار غير موجود" });
  }
  
  let correct = 0;
  const results = lesson.quiz.map((q, index) => {
    const isCorrect = answers[index] === q.correct_answer;
    if (isCorrect) correct++;
    
    return {
      question: q.question_ar,
      user_answer: answers[index],
      correct_answer: q.correct_answer,
      is_correct: isCorrect,
      explanation: q.explanation_ar
    };
  });
  
  const score = Math.round((correct / lesson.quiz.length) * 100);
  const passed = score >= 70;
  const pointsEarned = passed ? lesson.points : 0;
  
  res.json({
    score,
    correct,
    total: lesson.quiz.length,
    passed,
    points_earned: pointsEarned,
    results
  });
});

// Get lesson categories
router.get("/meta/categories", (_req, res) => {
  const categories = [...new Set(allLessons.map(l => l.category))];
  const categoriesWithCount = categories.map(cat => ({
    name: cat,
    count: allLessons.filter(l => l.category === cat).length
  }));
  
  res.json({ categories: categoriesWithCount });
});

// Get lesson levels
router.get("/meta/levels", (_req, res) => {
  const levels = [...new Set(allLessons.map(l => l.level))];
  const levelsWithCount = levels.map(lvl => ({
    name: lvl,
    count: allLessons.filter(l => l.level === lvl).length
  }));
  
  res.json({ levels: levelsWithCount });
});

export const lessonsRouter = router;
