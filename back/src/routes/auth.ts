import express from "express";
import bcrypt from "bcryptjs";

import { signToken } from "../middleware/auth.js";
import type { Role, User } from "../types/index.js";

const router = express.Router();

const users: User[] = [
  {
    id: "1",
    name: "مدير المنصة",
    email: "admin@example.com",
    role: "admin",
    password: bcrypt.hashSync("password", 10)
  },
  {
    id: "2",
    name: "معلم الحلقات",
    email: "teacher@example.com",
    role: "teacher",
    password: bcrypt.hashSync("password", 10)
  }
];

router.post("/login", (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  const user = users.find((u) => u.email === email);
  if (!user) {
    return res.status(401).json({ message: "بيانات الدخول غير صحيحة" });
  }
  if (!bcrypt.compareSync(password, user.password ?? "")) {
    return res.status(401).json({ message: "بيانات الدخول غير صحيحة" });
  }
  const token = signToken({ id: user.id, role: user.role as Role, name: user.name, email: user.email });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

router.get("/profile", (req, res) => {
  res.json({ message: "استخدم رمز JWT للوصول إلى الملف الشخصي" });
});

export const authRouter = router;
