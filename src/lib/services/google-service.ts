import { apiClient, type ApiResponse } from "@/lib/api-client";

// Google Workspace Configuration
export interface GoogleIntegrationStatus {
  success: boolean;
  isIntegrated: boolean;
  email: string;
  lastUpdated: string;
}

export interface GoogleWorkspaceConfig {
  id?: number;
  business_id: number;
  client_id: string;
  client_secret: string;
  refresh_token: string;
  access_token?: string;
  token_expiry?: string;
  scopes: string[];
  status: "active" | "inactive" | "error";
  last_sync?: string;
  error_message?: string;
}

// Google Service
export class GoogleService {
  // Google Workspace Configuration
  static async getGoogleConfig(businessId: number): Promise<ApiResponse<GoogleWorkspaceConfig>> {
    return apiClient.get<GoogleWorkspaceConfig>(`/google/config/${businessId}`);
  }

  static async createGoogleConfig(
    businessId: number,
    data: Omit<GoogleWorkspaceConfig, "id" | "business_id">
  ): Promise<ApiResponse<GoogleWorkspaceConfig>> {
    return apiClient.post<GoogleWorkspaceConfig>(`/google/config/${businessId}`, data);
  }

  static async updateGoogleConfig(
    businessId: number,
    data: Partial<Omit<GoogleWorkspaceConfig, "id" | "business_id">>
  ): Promise<ApiResponse<GoogleWorkspaceConfig>> {
    return apiClient.put<GoogleWorkspaceConfig>(`/google/config/${businessId}`, data);
  }

  static async deleteGoogleConfig(businessId: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/google/config/${businessId}`);
  }

  // OAuth Integration
  static async getAuthUrl(businessId: number): Promise<ApiResponse<{ authUrl: string }>> {
    return apiClient.get<{ authUrl: string }>(`/google/auth/${businessId}`);
  }
}

// Export singleton instance
export const googleService = new GoogleService();
