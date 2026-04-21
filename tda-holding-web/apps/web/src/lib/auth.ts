import { apiFetch, ApiError } from "./api";

export interface User {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: "client" | "agent" | "super_admin";
  is_active: boolean;
  created_at: string;
}

/**
 * Fetch current user profile from API
 * Throws ApiError if not authenticated
 */
export async function getCurrentUser(): Promise<User> {
  const response = await apiFetch<{ user: User }>("/api/v1/auth/profile");
  return response.user;
}

/**
 * Check if user is authenticated by attempting to fetch profile
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    await getCurrentUser();
    return true;
  } catch {
    return false;
  }
}
