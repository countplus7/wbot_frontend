import { apiClient, type ApiResponse } from '../api-client';

export interface HubSpotIntegrationStatus {
  success: boolean;
  isIntegrated: boolean;
  email?: string;
  user_id?: string;
  lastUpdated?: string;
  error_message?: string;
}

export interface HubSpotConfig {
  id?: number;
  business_id: number;
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: string;
  user_id?: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
}

export interface HubSpotContact {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
}

export interface HubSpotCompany {
  name: string;
  domain?: string;
  industry?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface HubSpotDeal {
  name: string;
  amount?: number;
  stage?: string;
  closeDate?: string;
  description?: string;
  pipeline?: string;
}

export class HubSpotService {
  // Configuration Management
  static async getConfig(businessId: number): Promise<ApiResponse<HubSpotIntegrationStatus>> {
    return apiClient.get<HubSpotIntegrationStatus>(`/hubspot/config/${businessId}`);
  }

  static async deleteConfig(businessId: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/hubspot/config/${businessId}`);
  }

  // OAuth
  static async getAuthUrl(businessId: number): Promise<ApiResponse<{ authUrl: string }>> {
    return apiClient.get<{ authUrl: string }>(`/hubspot/auth/${businessId}`);
  }

  // CRM Operations
  static async createContact(businessId: number, contactData: HubSpotContact): Promise<ApiResponse<any>> {
    return apiClient.post<any>(`/hubspot/contacts/${businessId}`, contactData);
  }

  static async createCompany(businessId: number, companyData: HubSpotCompany): Promise<ApiResponse<any>> {
    return apiClient.post<any>(`/hubspot/companies/${businessId}`, companyData);
  }

  static async createDeal(businessId: number, dealData: HubSpotDeal): Promise<ApiResponse<any>> {
    return apiClient.post<any>(`/hubspot/deals/${businessId}`, dealData);
  }

  static async searchContacts(businessId: number, searchTerm: string): Promise<ApiResponse<any>> {
    return apiClient.post<any>(`/hubspot/contacts/search/${businessId}`, { searchTerm });
  }
}

// Export singleton instance
export const hubspotService = new HubSpotService();