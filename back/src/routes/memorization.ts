import express from "express";
import { authenticate, AuthenticatedRequest } from "../middleware/auth.js";

const router = express.Router();

// In-memory storage for memorization tracking (would use database in production)
interface MemorizationRecord {
  user_id: string;
  surah_id: number;
  ayah_number: number;
  status: "memorizing" | "memorized" | "reviewing" | "mastered";
  last_reviewed?: string;
  review_count: number;
  created_at: string;
  updated_at: string;
}

const memorizationRecords = new Map<string, MemorizationRecord[]>();

// Get user's memorization progress
router.get("/progress", authenticate(), (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ message: "غير مصرح" });
  }
  
  const records = memorizationRecords.get(userId) || [];
  
  const stats = {
    total_ayat: records.length,
    memorizing: records.filter(r => r.status === "memorizing").length,
    memorized: records.filter(r => r.status === "memorized").length,
    reviewing: records.filter(r => r.status === "reviewing").length,
    mastered: records.filter(r => r.status === "mastered").length,
    surahs: [...new Set(records.map(r => r.surah_id))].length
  };
  
  res.json({ stats, records });
});

// Add ayah to memorization
router.post("/add", authenticate(), (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ message: "غير مصرح" });
  }
  
  const { surah_id, ayah_number } = req.body;
  
  if (!surah_id || !ayah_number) {
    return res.status(400).json({ message: "رقم السورة والآية مطلوبان" });
  }
  
  const userRecords = memorizationRecords.get(userId) || [];
  
  // Check if already exists
  const exists = userRecords.find(
    r => r.surah_id === surah_id && r.ayah_number === ayah_number
  );
  
  if (exists) {
    return res.status(400).json({ message: "هذه الآية موجودة بالفعل في قائمة الحفظ" });
  }
  
  const newRecord: MemorizationRecord = {
    user_id: userId,
    surah_id,
    ayah_number,
    status: "memorizing",
    review_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  userRecords.push(newRecord);
  memorizationRecords.set(userId, userRecords);
  
  res.json({ message: "تمت الإضافة بنجاح", record: newRecord });
});

// Update ayah status
router.put("/update/:surahId/:ayahNumber", authenticate(), (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ message: "غير مصرح" });
  }
  
  const surah_id = Number(req.params.surahId);
  const ayah_number = Number(req.params.ayahNumber);
  const { status } = req.body;
  
  const userRecords = memorizationRecords.get(userId) || [];
  const record = userRecords.find(
    r => r.surah_id === surah_id && r.ayah_number === ayah_number
  );
  
  if (!record) {
    return res.status(404).json({ message: "الآية غير موجودة في قائمة الحفظ" });
  }
  
  record.status = status;
  record.updated_at = new Date().toISOString();
  
  if (status === "reviewing" || status === "mastered") {
    record.last_reviewed = new Date().toISOString();
    record.review_count++;
  }
  
  memorizationRecords.set(userId, userRecords);
  
  res.json({ message: "تم التحديث بنجاح", record });
});

// Get review schedule
router.get("/review-schedule", authenticate(), (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ message: "غير مصرح" });
  }
  
  const userRecords = memorizationRecords.get(userId) || [];
  
  // Calculate which ayat need review based on spaced repetition
  const now = new Date();
  const needsReview = userRecords.filter(r => {
    if (r.status === "memorizing") return false;
    if (!r.last_reviewed) return true;
    
    const lastReview = new Date(r.last_reviewed);
    const daysSinceReview = Math.floor(
      (now.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // Spaced repetition intervals: 1, 3, 7, 14, 30 days
    const intervals = [1, 3, 7, 14, 30];
    const targetInterval = intervals[Math.min(r.review_count, intervals.length - 1)];
    
    return daysSinceReview >= targetInterval;
  });
  
  res.json({
    needs_review: needsReview,
    total: needsReview.length,
    message: needsReview.length > 0 
      ? `لديك ${needsReview.length} آية تحتاج للمراجعة`
      : "لا توجد آيات تحتاج للمراجعة اليوم"
  });
});

// Delete ayah from memorization
router.delete("/delete/:surahId/:ayahNumber", authenticate(), (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ message: "غير مصرح" });
  }
  
  const surah_id = Number(req.params.surahId);
  const ayah_number = Number(req.params.ayahNumber);
  
  const userRecords = memorizationRecords.get(userId) || [];
  const filtered = userRecords.filter(
    r => !(r.surah_id === surah_id && r.ayah_number === ayah_number)
  );
  
  if (filtered.length === userRecords.length) {
    return res.status(404).json({ message: "الآية غير موجودة في قائمة الحفظ" });
  }
  
  memorizationRecords.set(userId, filtered);
  
  res.json({ message: "تم الحذف بنجاح" });
});

export const memorizationRouter = router;
