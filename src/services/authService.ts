const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Based on backend models/entities/User.py
export interface User {
  id: string;
  email: string;
  role: "user" | "admin";
}

// Based on backend models/token_payload.py
export interface TokenPayload {
  sub: string; // user id
  role: string;
  exp: number;
  iat: number;
}

// Based on backend auth response
export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
}

class AuthService {
  private decodeToken(token: string): TokenPayload | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replaceAll('-', '+').replaceAll('_', '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.codePointAt(0)!.toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  }

  private getUserFromToken(token: string): User | null {
    const payload = this.decodeToken(token);
    if (!payload) return null;

    // Token only contains sub (id) and role
    // Email needs to be fetched from a separate endpoint or stored separately
    return {
      id: payload.sub,
      email: "", // Not in token payload
      role: payload.role as "user" | "admin",
    };
  }

  async login(credentials: LoginCredentials): Promise<User | null> {
    try {
      // FastAPI OAuth2PasswordRequestForm expects form data
      const formData = new URLSearchParams();
      formData.append("username", credentials.email);
      formData.append("password", credentials.password);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      if (response.ok) {
        const data: AuthResponse = await response.json();
        this.setSession(data.access_token);
        return this.getUserFromToken(data.access_token);
      }
      return null;
    } catch (error) {
      console.error("Login error:", error);
      return null;
    }
  }

  async register(credentials: RegisterCredentials): Promise<boolean> {
    try {
      // Register returns only a success message, not a token
      const response = await fetch(`${API_URL}/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      return response.ok;
    } catch (error) {
      console.error("Register error:", error);
      return false;
    }
  }

  setSession(token: string): void {
    if (globalThis.window !== undefined) {
      localStorage.setItem("token", token);
    }
  }

  clearSession(): void {
    if (globalThis.window !== undefined) {
      localStorage.removeItem("token");
    }
  }

  getStoredUser(): User | null {
    if (globalThis.window === undefined) return null;
    const token = this.getToken();
    if (!token) return null;
    return this.getUserFromToken(token);
  }

  getToken(): string | null {
    if (globalThis.window === undefined) return null;
    return localStorage.getItem("token");
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    const payload = this.decodeToken(token);
    if (!payload) return false;
    
    // Check if token is expired
    const now = Date.now() / 1000;
    return payload.exp > now;
  }
}

export const authService = new AuthService();
