"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser, type User } from "./auth";
import { initCsrf } from "./api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
  refetch: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      return true;
    } catch (err) {
      console.error("Failed to fetch user:", err);
      setUser(null);
      return false;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      // Initialize CSRF first
      await initCsrf().catch(() => {
        console.warn("CSRF init failed, continuing anyway");
      });
      // Try to fetch user, but don't fail if not authenticated
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch {
        // User not authenticated, that's ok
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const logout = () => {
    setUser(null);
    window.location.href = "/profil";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        logout,
        refetch: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
