import { apiClient, type ApiResponse } from '../api-client';

export interface OdooIntegrationStatus {
  success: boolean;
  isIntegrated: boolean;
  instance_url: string;
  db: string;
  username: string;
  lastUpdated: string;
}

export interface OdooConfig {
  id?: number;
  business_id: number;
  instance_url: string;
  db: string;
  username: string;
  api_key: string;
  status: "active" | "inactive" | "error";
  error_message?: string;
}

export class OdooService {
  static async getConfig(businessId: number): Promise<ApiResponse<OdooIntegrationStatus>> {
    return apiClient.get<OdooIntegrationStatus>(`/odoo/config/${businessId}`);
  }

  static async saveConfig(businessId: number, config: Omit<OdooConfig, 'id' | 'business_id' | 'status'>): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`/odoo/config/${businessId}`, config);
  }

  static async deleteConfig(businessId: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/odoo/config/${businessId}`);
  }

  static async testConnection(businessId: number): Promise<ApiResponse<{ userId: number }>> {
    return apiClient.post<{ userId: number }>(`/odoo/test/${businessId}`);
  }
}

export const odooService = new OdooService();
