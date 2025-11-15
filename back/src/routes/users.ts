import express from "express";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

import { authenticate, AuthenticatedRequest } from "../middleware/auth.js";
import type { Role, User } from "../types/index.js";

const router = express.Router();

// In-memory storage (shared with auth.ts - in production use database)
const users: User[] = [
  { 
    id: "1", 
    name: "مدير المنصة", 
    email: "admin@example.com", 
    role: "admin",
    verified: true,
    createdAt: new Date()
  },
  { 
    id: "2", 
    name: "معلم الحلقات", 
    email: "teacher@example.com", 
    role: "teacher",
    verified: true,
    createdAt: new Date()
  },
  { 
    id: "3", 
    name: "محاضر التجويد", 
    email: "lecturer@example.com", 
    role: "lecturer",
    verified: true,
    createdAt: new Date()
  },
  { 
    id: "4", 
    name: "طالب", 
    email: "student@example.com", 
    role: "student",
    verified: true,
    createdAt: new Date()
  }
];

// Get all users (admin and teachers only)
router.get("/", authenticate(["admin", "teacher"]), (_req, res) => {
  // Remove passwords from response
  const safeUsers = users.map(({ password, ...user }) => user);
  res.json({ users: safeUsers });
});

// Get specific user by ID
router.get("/:id", authenticate(["admin", "teacher"]), (req, res) => {
  const { id } = req.params;
  const user = users.find((u) => u.id === id);
  
  if (!user) {
    return res.status(404).json({ message: "المستخدم غير موجود" });
  }
  
  const { password, ...safeUser } = user;
  res.json({ user: safeUser });
});

// Create new user (admin only)
router.post("/", authenticate("admin"), (req, res) => {
  const { name, email, role, password } = req.body as { 
    name: string; 
    email: string; 
    role: Role;
    password?: string;
  };
  
  // Validation
  if (!name || !email || !role) {
    return res.status(400).json({ message: "الاسم والبريد الإلكتروني والدور مطلوبة" });
  }
  
  // Check if email already exists
  if (users.find((u) => u.email === email)) {
    return res.status(409).json({ message: "البريد الإلكتروني مستخدم بالفعل" });
  }
  
  const newUser: User = { 
    id: uuidv4(),
    name,
    email,
    role,
    password: password ? bcrypt.hashSync(password, 10) : undefined,
    verified: true, // Admin-created users are auto-verified
    createdAt: new Date()
  };
  
  users.push(newUser);
  
  const { password: _, ...safeUser } = newUser;
  res.status(201).json({ message: "تمت إضافة المستخدم بنجاح", user: safeUser });
});

// Update user (admin only)
router.put("/:id", authenticate("admin"), (req, res) => {
  const { id } = req.params;
  const { name, email, role, verified } = req.body as Partial<User>;
  
  const userIndex = users.findIndex((u) => u.id === id);
  if (userIndex === -1) {
    return res.status(404).json({ message: "المستخدم غير موجود" });
  }
  
  // Check if new email already exists (excluding current user)
  if (email && users.find((u) => u.email === email && u.id !== id)) {
    return res.status(409).json({ message: "البريد الإلكتروني مستخدم بالفعل" });
  }
  
  // Update user
  const updatedUser = {
    ...users[userIndex],
    ...(name && { name }),
    ...(email && { email }),
    ...(role && { role }),
    ...(typeof verified === 'boolean' && { verified }),
    updatedAt: new Date()
  };
  
  users[userIndex] = updatedUser;
  
  const { password, ...safeUser } = updatedUser;
  res.json({ message: "تم تحديث المستخدم بنجاح", user: safeUser });
});

// Delete user (admin only)
router.delete("/:id", authenticate("admin"), (req, res) => {
  const { id } = req.params;
  const userIndex = users.findIndex((u) => u.id === id);
  
  if (userIndex === -1) {
    return res.status(404).json({ message: "المستخدم غير موجود" });
  }
  
  // Prevent deleting the last admin
  const deletingUser = users[userIndex];
  if (deletingUser.role === 'admin') {
    const adminCount = users.filter((u) => u.role === 'admin').length;
    if (adminCount <= 1) {
      return res.status(400).json({ message: "لا يمكن حذف آخر مدير في النظام" });
    }
  }
  
  users.splice(userIndex, 1);
  res.json({ message: "تم حذف المستخدم بنجاح" });
});

// Get user statistics (admin only)
router.get("/stats/overview", authenticate("admin"), (_req, res) => {
  const stats = {
    total: users.length,
    byRole: {
      admin: users.filter((u) => u.role === 'admin').length,
      teacher: users.filter((u) => u.role === 'teacher').length,
      lecturer: users.filter((u) => u.role === 'lecturer').length,
      student: users.filter((u) => u.role === 'student').length,
      guest: users.filter((u) => u.role === 'guest').length
    },
    verified: users.filter((u) => u.verified).length,
    unverified: users.filter((u) => !u.verified).length
  };
  
  res.json({ stats });
});

export const usersRouter = router;
