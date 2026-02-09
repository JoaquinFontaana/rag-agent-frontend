'use client'
import { LoginCredentials, RegisterCredentials, User, JWTPayload } from "@/types/types";
import { createContext, useState, useContext, ReactNode, useEffect, useMemo } from "react";
import { authService } from "@/services/authService";
import { jwtDecode } from "jwt-decode";

interface AuthContextType {
    user: User | null
    login: (credentials: LoginCredentials) => Promise<void>
    logout: () => void
    register: (data: RegisterCredentials) => Promise<void>
    isAuthenticated: boolean
    isLoading: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider Component
export function AuthProvider({ children }: { readonly children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing token on mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode<JWTPayload>(token);
                setUser({
                    id: Number(decoded.sub),
                    email: decoded.email,
                    role: decoded.role
                });
            } catch (error) {
                console.error('Invalid token:', error);
                localStorage.removeItem('token');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (credentials: LoginCredentials): Promise<void> => {
        try {
            setIsLoading(true);
            const response = await authService.login(credentials);
            
            // Decode JWT to get user data
            const decoded = jwtDecode<JWTPayload>(response.access_token);
            const userData: User = {
                id: Number(decoded.sub),
                email: decoded.email,
                role: decoded.role
            };
            
            setUser(userData);
        } catch (error) {
            console.error('Login error:', error);
            throw error; // Re-throw to component
        } finally {
            setIsLoading(false);
        }
    };

    const logout = (): void => {
        authService.logout();
        setUser(null);
    };

    const register = async (data: RegisterCredentials): Promise<void> => {
        try {
            setIsLoading(true);
            await authService.register(data);
        } catch (error) {
            console.error('Register error:', error);
            throw error; // Re-throw to component
        } finally {
            setIsLoading(false);
        }
    };

    const value = useMemo(() => ({
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isLoading
    }), [user, isLoading]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 4. Hook Personalizado (con validación)
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}