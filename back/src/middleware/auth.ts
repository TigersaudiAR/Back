import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { Role } from "../types/index.js";

const SECRET = process.env.JWT_SECRET || "super-secret";

export interface AuthenticatedRequest extends Request {
  user?: { id: string; role: Role; name: string; email: string };
}

export function signToken(payload: { id: string; role: Role; name: string; email: string }) {
  return jwt.sign(payload, SECRET, { expiresIn: "12h" });
}

export function authenticate(requiredRoles?: Role | Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header) {
      return res.status(401).json({ message: "الرمز مفقود" });
    }

    const [, token] = header.split(" ");

    try {
      const decoded = jwt.verify(token, SECRET) as AuthenticatedRequest["user"] | undefined;

      if (!decoded) {
        return res.status(401).json({ message: "رمز غير صالح أو غير معروف" });
      }

      req.user = decoded;

      if (requiredRoles) {
        const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
        if (!roles.includes(decoded.role)) {
          return res.status(403).json({ message: "صلاحيات غير كافية" });
        }
      }

      next();
    } catch (error) {
      console.error("JWT Error:", error);
      return res.status(401).json({ message: "فشل التحقق من الرمز" });
    }
  };
}