import { apiClient, ApiResponse } from '../api-client';

export interface AirtableConfig {
  id?: number;
  business_id: number;
  access_token: string;
  base_id: string;
  table_name: string;
  created_at?: string;
  updated_at?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  [key: string]: any; // For additional Airtable fields
}

export interface FAQSearchResult {
  id: string;
  question: string;
  answer: string;
  matchScore: number;
  [key: string]: any;
}

// Airtable Service
export class AirtableService {
  // Configuration Management
  static async getConfig(businessId: number): Promise<ApiResponse<AirtableConfig>> {
    return apiClient.get<AirtableConfig>(`/airtable/config/${businessId}`);
  }

  static async saveConfig(
    businessId: number,
    data: Omit<AirtableConfig, 'id' | 'business_id' | 'created_at' | 'updated_at'>
  ): Promise<ApiResponse<AirtableConfig>> {
    return apiClient.post<AirtableConfig>(`/airtable/config/${businessId}`, data);
  }

  static async deleteConfig(businessId: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/airtable/config/${businessId}`);
  }

  static async testConnection(businessId: number): Promise<ApiResponse<{ success: boolean; message?: string; error?: string }>> {
    return apiClient.post<{ success: boolean; message?: string; error?: string }>(`/airtable/test/${businessId}`);
  }

  // FAQ Management
  static async getFAQs(businessId: number): Promise<ApiResponse<FAQ[]>> {
    return apiClient.get<FAQ[]>(`/airtable/faqs/${businessId}`);
  }

  static async searchFAQs(businessId: number, question: string): Promise<ApiResponse<FAQSearchResult | null>> {
    return apiClient.post<FAQSearchResult | null>(`/airtable/search/${businessId}`, { question });
  }
}

// Export singleton instance
export const airtableService = new AirtableService();
