import { apiClient } from "../api";
import type { Business, WhatsAppConfig, BusinessTone, BusinessWithConfigAndTones } from "../api";

// Chat History Types
export interface Conversation {
  id: number;
  phone_number: string;
  status: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  last_message_at: string | null;
}

export interface Message {
  id: number;
  message_id: string;
  from_number: string;
  to_number: string;
  message_type: string;
  content: string | null;
  media_url: string | null;
  direction: "inbound" | "outbound";
  status: string;
  created_at: string;
  file_name?: string;
  file_path?: string;
  file_type?: string;
}

export interface ConversationDetails {
  id: number;
  business_id: number;
  phone_number: string;
  status: string;
  created_at: string;
  updated_at: string;
  business_name: string;
}

export interface ConversationWithMessages {
  conversation: ConversationDetails;
  messages: Message[];
  pagination: {
    limit: number;
    offset: number;
    count: number;
  };
}

export class BusinessService {
  // Business Management
  async getBusinesses(): Promise<Business[]> {
    const response = await apiClient.get<Business[]>("/businesses");
    return response.data;
  }

  async getBusiness(id: number): Promise<BusinessWithConfigAndTones> {
    const response = await apiClient.get<BusinessWithConfigAndTones>(`/businesses/${id}`);
    return response.data;
  }

  async createBusiness(businessData: {
    name: string;
    description?: string;
    status?: "active" | "inactive";
  }): Promise<Business> {
    const response = await apiClient.post<Business>("/businesses", businessData);
    return response.data;
  }

  async updateBusiness(
    id: number,
    businessData: {
      name: string;
      description?: string;
      status?: "active" | "inactive";
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
    const response = await apiClient.post<WhatsAppConfig>(`/businesses/${businessId}/whatsapp-config`, configData);
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
    const response = await apiClient.post<BusinessTone>(`/businesses/${businessId}/tone`, toneData);
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

  async deleteBusinessTone(id: number): Promise<BusinessTone> {
    const response = await apiClient.delete<BusinessTone>(`/tones/${id}`);
    return response.data;
  }

  // Chat History Management
  async getBusinessConversations(businessId: number): Promise<Conversation[]> {
    const response = await apiClient.get<Conversation[]>(`/businesses/${businessId}/conversations`);
    return response.data;
  }

  async getConversationMessages(
    conversationId: number,
    limit: number = 50,
    offset: number = 0
  ): Promise<ConversationWithMessages> {
    const response = await apiClient.get<ConversationWithMessages>(
      `/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`
    );
    return response.data;
  }

  // Delete a conversation
  async deleteConversation(conversationId: number): Promise<ConversationDetails> {
    const response = await apiClient.delete<ConversationDetails>(`/conversations/${conversationId}`);
    return response.data;
  }
}

// Export singleton instance
export const businessService = new BusinessService();
