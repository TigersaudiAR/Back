import api from "./api";
import { useAuthStore } from "../store/auth";
import type { Role, User } from "../types/user";

export type LoginResponse = {
  token: string;
  user: User;
};

export async function login(email: string, password: string) {
  const response = await api.post<LoginResponse>("/auth/login", {
    email,
    password
  });
  useAuthStore.getState().setAuth(response.data.token, response.data.user);
  return response.data;
}

export function hasRole(required: Role | Role[]): boolean {
  const { role } = useAuthStore.getState();
  if (Array.isArray(required)) {
    return required.includes(role);
  }
  return role === required;
}
