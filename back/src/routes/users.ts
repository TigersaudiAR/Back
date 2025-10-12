import express from "express";

import { authenticate } from "../middleware/auth.js";
import type { Role, User } from "../types/index.js";

const router = express.Router();

const users: User[] = [
  { id: "1", name: "مدير المنصة", email: "admin@example.com", role: "admin" },
  { id: "2", name: "معلم الحلقات", email: "teacher@example.com", role: "teacher" },
  { id: "3", name: "محاضر التجويد", email: "lecturer@example.com", role: "lecturer" },
  { id: "4", name: "طالب", email: "student@example.com", role: "student" }
];

router.get("/", authenticate(["admin", "teacher"]), (_req, res) => {
  res.json({ users });
});

router.post("/", authenticate("admin"), (req, res) => {
  const body = req.body as { name: string; email: string; role: Role };
  const newUser: User = { id: String(users.length + 1), ...body };
  users.push(newUser);
  res.json({ message: "تمت الإضافة", user: newUser });
});

export const usersRouter = router;
