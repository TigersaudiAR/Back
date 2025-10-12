import { create } from "zustand";
import type { Role, User } from "../types/user";

type AuthState = {
  token: string | null;
  user: User | null;
  role: Role;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  role: "guest",
  setAuth: (token, user) => set({ token, user, role: user.role }),
  logout: () => set({ token: null, user: null, role: "guest" })
}));
