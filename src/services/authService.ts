import { API_URL } from "@/consts"
import axios from "axios"
import { LoginCredentials, RegisterCredentials, LoginResponse, ApiResponse, BackendError } from "@/types/types"

export default class AuthService {
    
    private handleError(error: unknown): never {
        if (axios.isAxiosError(error)) {
            const backendError = error.response?.data as BackendError
            
            // Log full error for debugging
            console.error('API Error:', {
                status: error.response?.status,
                type: backendError?.error?.type,
                message: backendError?.error?.message,
                details: backendError?.error?.details
            })
            
            // Extract user-friendly message
            if (backendError?.error) {
                const { message, details } = backendError.error
                
                if (details && details.length > 0) {
                    throw new Error(`${message}: ${details.join(', ')}`)
                }
                
                throw new Error(message)
            }
            
            throw new Error(error.response?.statusText || 'Request failed')
        }
        
        console.error('Unexpected error:', error)
        throw new Error('An unexpected error occurred')
    }
    
    async login(credentials: LoginCredentials): Promise<LoginResponse> {
        try {
            const URL = `${API_URL}/auth/login`
            const response = await axios.post<LoginResponse>(URL, credentials)
            
            console.log('Login successful:', response.data)
            
            // Store token if exists
            if (response.data.access_token) {
                localStorage.setItem('token', response.data.access_token)
            }
            
            return response.data
        } catch (error) {
            this.handleError(error)
        }
    }
    
    async register(data: RegisterCredentials): Promise<ApiResponse> {
        try {
            const URL = `${API_URL}/users`
            const response = await axios.post<ApiResponse>(URL, data)
            
            console.log('Registration successful:', response.data)
            
            return response.data
        } catch (error) {
            this.handleError(error)
        }
    }
    
    async logout(): Promise<void> {
        try {
            localStorage.removeItem('token')
            console.log('Logout successful')
        } catch (error) {
            console.error('Logout error:', error)
        }
    }
}

export const authService = new AuthService()