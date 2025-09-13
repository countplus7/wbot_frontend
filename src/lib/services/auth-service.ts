import { apiClient, type ApiResponse } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config";

// Auth interfaces
export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface SignupCredentials {
  username: string;
  email: string;
  password: string;
}

export interface ProfileUpdateData {
  username?: string;
  email?: string;
  password?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface AdminExistsResponse {
  adminExists: boolean;
}

// Auth Service Class
export class AuthService {
  // Check if admin exists
  async checkAdminExists(): Promise<ApiResponse<AdminExistsResponse>> {
    return apiClient.get<AdminExistsResponse>(API_ENDPOINTS.AUTH.ADMIN_EXISTS, { skipAuth: true });
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials, { skipAuth: true });
  }

  // Signup user
  async signup(credentials: SignupCredentials): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.SIGNUP, credentials, { skipAuth: true });
  }

  // Get user profile
  async getProfile(): Promise<ApiResponse<User>> {
    return apiClient.get<User>(API_ENDPOINTS.AUTH.PROFILE);
  }

  // Update user profile
  async updateProfile(data: ProfileUpdateData): Promise<ApiResponse<User>> {
    return apiClient.put<User>(API_ENDPOINTS.AUTH.PROFILE, data);
  }
}

// Export singleton instance
export const authService = new AuthService();
