export type Role = "admin" | "teacher" | "lecturer" | "student" | "guest";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  locale?: "ar" | "en";
};
