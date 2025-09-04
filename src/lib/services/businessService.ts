import { apiClient } from '../api';
import type { 
  Business, 
  WhatsAppConfig, 
  BusinessTone, 
  BusinessWithConfigAndTones 
} from '../api';

export class BusinessService {
  // Business Management
  async getBusinesses(): Promise<Business[]> {
    const response = await apiClient.get<Business[]>('/businesses');
    return response.data;
  }

  async getBusiness(id: number): Promise<BusinessWithConfigAndTones> {
    const response = await apiClient.get<BusinessWithConfigAndTones>(`/businesses/${id}`);
    return response.data;
  }

  async createBusiness(businessData: {
    name: string;
    description?: string;
    status?: 'active' | 'inactive';
  }): Promise<Business> {
    const response = await apiClient.post<Business>('/businesses', businessData);
    return response.data;
  }

  async updateBusiness(
    id: number, 
    businessData: {
      name: string;
      description?: string;
      status?: 'active' | 'inactive';
    }
  ): Promise<Business> {
    const response = await apiClient.put<Business>(`/businesses/${id}`, businessData);
    return response.data;
  }

  async deleteBusiness(id: number): Promise<string> {
    const response = await apiClient.delete<{ message: string }>(`/businesses/${id}`);
    return response.message;
  }

  // WhatsApp Configuration Management
  async getWhatsAppConfig(businessId: number): Promise<WhatsAppConfig | null> {
    try {
      const response = await apiClient.get<WhatsAppConfig>(`/businesses/${businessId}/whatsapp-config`);
      return response.data ?? null;
    } catch (error) {
      return null;
    }
  }

  async createWhatsAppConfig(
    businessId: number,
    configData: {
      phone_number_id: string;
      access_token: string;
      verify_token?: string;
      webhook_url?: string;
    }
  ): Promise<WhatsAppConfig> {
    const response = await apiClient.post<WhatsAppConfig>(
      `/businesses/${businessId}/whatsapp-config`,
      configData
    );
    return response.data;
  }

  async updateWhatsAppConfig(
    id: number,
    configData: {
      phone_number_id: string;
      access_token: string;
      verify_token?: string;
      webhook_url?: string;
    }
  ): Promise<WhatsAppConfig> {
    const response = await apiClient.put<WhatsAppConfig>(`/whatsapp-config/${id}`, configData);
    return response.data;
  }

  async deleteWhatsAppConfig(id: number): Promise<string> {
    const response = await apiClient.delete<{ message: string }>(`/whatsapp-config/${id}`);
    return response.message;
  }

  // Business Tone Management (Single tone per business)
  async getBusinessTone(businessId: number): Promise<BusinessTone | null> {
    const response = await apiClient.get<BusinessTone>(`/businesses/${businessId}/tone`);
    return response.data;
  }

  async createBusinessTone(
    businessId: number,
    toneData: {
      name: string;
      description?: string;
      tone_instructions: string;
    }
  ): Promise<BusinessTone> {
    const response = await apiClient.post<BusinessTone>(
      `/businesses/${businessId}/tone`,
      toneData
    );
    return response.data;
  }

  async updateBusinessTone(
    id: number,
    toneData: {
      name: string;
      description?: string;
      tone_instructions: string;
      business_id: number;
    }
  ): Promise<BusinessTone> {
    const response = await apiClient.put<BusinessTone>(`/tones/${id}`, toneData);
    return response.data;
  }
}

// Export singleton instance
export const businessService = new BusinessService(); 
