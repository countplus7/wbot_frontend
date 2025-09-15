import { apiClient, type ApiResponse } from '../api-client';

export interface SalesforceIntegrationStatus {
  success: boolean;
  isIntegrated: boolean;
  email: string;
  username: string;
  instance_url: string;
  lastUpdated: string;
}

export interface SalesforceConfig {
  id?: number;
  business_id: number;
  client_id: string;
  client_secret: string;
  instance_url: string;
  username: string;
  email: string;
  refresh_token: string;
  access_token?: string;
  token_expiry?: string;
  scopes: string[];
  status: "active" | "inactive" | "error";
  error_message?: string;
}

export class SalesforceService {
  static async getAuthUrl(businessId: number): Promise<ApiResponse<{ authUrl: string }>> {
    return apiClient.get<{ authUrl: string }>(`/salesforce/auth/${businessId}`);
  }

  static async deleteSalesforceConfig(businessId: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/salesforce/config/${businessId}`);
  }
}

export const salesforceService = new SalesforceService();
