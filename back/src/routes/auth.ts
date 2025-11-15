import express from "express";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

import { signToken } from "../middleware/auth.js";
import type { Role, User } from "../types/index.js";

const router = express.Router();

// In-memory storage (in production, use a database)
const users: User[] = [
  {
    id: "1",
    name: "مدير المنصة",
    email: "admin@example.com",
    role: "admin",
    password: bcrypt.hashSync("password", 10),
    verified: true
  },
  {
    id: "2",
    name: "معلم الحلقات",
    email: "teacher@example.com",
    role: "teacher",
    password: bcrypt.hashSync("password", 10),
    verified: true
  }
];

// Password reset tokens (in production, use Redis or database with TTL)
const resetTokens = new Map<string, { userId: string; expiresAt: number }>();

// Email verification tokens
const verificationTokens = new Map<string, { userId: string; expiresAt: number }>();

router.post("/login", (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  const user = users.find((u) => u.email === email);
  if (!user) {
    return res.status(401).json({ message: "بيانات الدخول غير صحيحة" });
  }
  if (!bcrypt.compareSync(password, user.password ?? "")) {
    return res.status(401).json({ message: "بيانات الدخول غير صحيحة" });
  }
  if (!user.verified) {
    return res.status(403).json({ message: "يرجى تفعيل حسابك أولاً. تحقق من بريدك الإلكتروني." });
  }
  const token = signToken({ id: user.id, role: user.role as Role, name: user.name, email: user.email });
  res.json({ 
    token, 
    user: { 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      role: user.role,
      verified: user.verified 
    } 
  });
});

// Registration endpoint
router.post("/register", (req, res) => {
  const { name, email, password } = req.body as { name: string; email: string; password: string };
  
  // Validation
  if (!name || !email || !password) {
    return res.status(400).json({ message: "جميع الحقول مطلوبة" });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" });
  }
  
  // Check if user already exists
  if (users.find((u) => u.email === email)) {
    return res.status(409).json({ message: "البريد الإلكتروني مستخدم بالفعل" });
  }
  
  // Create new user
  const newUser: User = {
    id: uuidv4(),
    name,
    email,
    password: bcrypt.hashSync(password, 10),
    role: "student", // Default role
    verified: false
  };
  
  users.push(newUser);
  
  // Generate verification token
  const verificationToken = uuidv4();
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  verificationTokens.set(verificationToken, { userId: newUser.id, expiresAt });
  
  // In production, send email with verification link
  // For now, just return the token in response (for testing)
  res.status(201).json({ 
    message: "تم إنشاء الحساب بنجاح. يرجى تفعيل حسابك عبر الرابط المرسل إلى بريدك الإلكتروني.",
    userId: newUser.id,
    verificationToken // Remove this in production
  });
});

// Email verification endpoint
router.get("/verify-email/:token", (req, res) => {
  const { token } = req.params;
  const verification = verificationTokens.get(token);
  
  if (!verification) {
    return res.status(400).json({ message: "رمز التفعيل غير صالح" });
  }
  
  if (Date.now() > verification.expiresAt) {
    verificationTokens.delete(token);
    return res.status(400).json({ message: "رمز التفعيل منتهي الصلاحية" });
  }
  
  const user = users.find((u) => u.id === verification.userId);
  if (!user) {
    return res.status(404).json({ message: "المستخدم غير موجود" });
  }
  
  user.verified = true;
  verificationTokens.delete(token);
  
  res.json({ message: "تم تفعيل حسابك بنجاح. يمكنك الآن تسجيل الدخول." });
});

// Request password reset
router.post("/request-reset", (req, res) => {
  const { email } = req.body as { email: string };
  const user = users.find((u) => u.email === email);
  
  if (!user) {
    // Don't reveal if email exists for security
    return res.json({ message: "إذا كان البريد الإلكتروني موجودًا، سيتم إرسال رابط إعادة تعيين كلمة المرور" });
  }
  
  // Generate reset token
  const resetToken = uuidv4();
  const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour
  resetTokens.set(resetToken, { userId: user.id, expiresAt });
  
  // In production, send email with reset link
  // For now, just return success (and token for testing)
  res.json({ 
    message: "إذا كان البريد الإلكتروني موجودًا، سيتم إرسال رابط إعادة تعيين كلمة المرور",
    resetToken // Remove this in production
  });
});

// Reset password with token
router.post("/reset-password", (req, res) => {
  const { token, newPassword } = req.body as { token: string; newPassword: string };
  
  const reset = resetTokens.get(token);
  if (!reset) {
    return res.status(400).json({ message: "رمز إعادة التعيين غير صالح" });
  }
  
  if (Date.now() > reset.expiresAt) {
    resetTokens.delete(token);
    return res.status(400).json({ message: "رمز إعادة التعيين منتهي الصلاحية" });
  }
  
  if (newPassword.length < 6) {
    return res.status(400).json({ message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" });
  }
  
  const user = users.find((u) => u.id === reset.userId);
  if (!user) {
    return res.status(404).json({ message: "المستخدم غير موجود" });
  }
  
  user.password = bcrypt.hashSync(newPassword, 10);
  resetTokens.delete(token);
  
  res.json({ message: "تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول." });
});

router.get("/profile", (req, res) => {
  res.json({ message: "استخدم رمز JWT للوصول إلى الملف الشخصي" });
});

export const authRouter = router;
