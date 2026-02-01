const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse | null> {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const data: AuthResponse = await response.json();
        this.setSession(data);
        return data;
      }
      return null;
    } catch (error) {
      console.error("Login error:", error);
      return null;
    }
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse | null> {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const data: AuthResponse = await response.json();
        this.setSession(data);
        return data;
      }
      return null;
    } catch (error) {
      console.error("Register error:", error);
      return null;
    }
  }

  setSession(data: AuthResponse): void {
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("token", data.token);
  }

  clearSession(): void {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }

  getStoredUser(): User | null {
    if (typeof window === "undefined") return null;
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  }

  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  }

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getStoredUser();
  }
}

export const authService = new AuthService();
