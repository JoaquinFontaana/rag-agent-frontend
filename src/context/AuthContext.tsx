"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from "react";
import { authService, User } from "@/services/authService";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initialize user state from localStorage (runs once on mount)
function getInitialUser(): User | null {
  if (globalThis.window === undefined) return null;
  return authService.getStoredUser();
}

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<User | null>(getInitialUser);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string): Promise<boolean> => {
    const response = await authService.login({ email, password });
    if (response) {
      setUser(response.user);
      return true;
    }
    return false;
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    const response = await authService.register({ email, password, name });
    if (response) {
      setUser(response.user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    authService.clearSession();
  };

  const isAdmin = user?.role === "admin";

  const value = useMemo(
    () => ({ user, isLoading, login, register, logout, isAdmin }),
    [user, isLoading, isAdmin]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
