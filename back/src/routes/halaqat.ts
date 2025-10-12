import express from "express";
import { v4 as uuid } from "uuid";

import { authenticate } from "../middleware/auth.js";
import type { Halaqah, LeaderboardEntry } from "../types/index.js";

const router = express.Router();

const halaqat: Halaqah[] = [
  {
    id: uuid(),
    title: "حلقة النور",
    level: "kids",
    teacher: "الشيخ عبد الرحمن",
    schedule: "الأحد والثلاثاء",
    members: 18,
    seats: 25,
    language: "العربية"
  }
];

const leaderboard: LeaderboardEntry[] = Array.from({ length: 40 }).map((_, index) => ({
  user_id: `user-${index + 1}`,
  display_name: `متسابق ${index + 1}`,
  points: 1000 - index * 12,
  rank: index + 1
}));

router.get("/", (_req, res) => {
  res.json({ halaqat, leaderboard });
});

router.post("/", authenticate(["admin", "teacher"]), (req, res) => {
  const body = req.body as Halaqah;
  const newHalaqah: Halaqah = { ...body, id: uuid(), members: body.members ?? 0 };
  halaqat.push(newHalaqah);
  res.json({ message: "تمت الإضافة", halaqat: newHalaqah });
});

export const halaqatRouter = router;
