import { apiClient, type ApiResponse } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/config";

// Business interfaces
export interface Business {
  id: number;
  name: string;
  description?: string;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export interface CreateBusinessData {
  name: string;
  description?: string;
  status?: "active" | "inactive";
}

export interface UpdateBusinessData extends Partial<CreateBusinessData> {}

export interface WhatsAppConfig {
  id?: number;
  business_id: number;
  phone_number_id: string;
  access_token: string;
  verify_token: string;
  webhook_url?: string;
  status: "active" | "inactive";
}

export interface BusinessTone {
  id: number;
  business_id: number;
  name: string; // Change from 'tone_name' to 'name' to match backend
  description?: string; // Add this missing field
  tone_instructions: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBusinessToneData {
  tone_name: string;
  description?: string; // Add description field
  tone_instructions: string;
}

export interface Conversation {
  id: number;
  business_id: number;
  phone_number: string;
  contact_name?: string;
  last_message_at: string;
  message_count: number;
  status: "active" | "archived";
  created_at: string; // Add this missing property
  updated_at: string; // Add this missing property
}

export interface Message {
  id: number;
  conversation_id: number;
  message_id: string;
  direction: "inbound" | "outbound";
  message_type: "text" | "image" | "audio" | "document";
  content?: string;
  media_url?: string;
  file_name?: string;
  file_type?: string;
  timestamp: string;
  status: "sent" | "delivered" | "read" | "failed";
}

// Enhanced Business Service
export class BusinessService {
  // Business CRUD operations
  static async getBusinesses(): Promise<ApiResponse<Business[]>> {
    return apiClient.get<Business[]>(API_ENDPOINTS.BUSINESS.LIST);
  }

  static async getBusiness(id: number): Promise<ApiResponse<Business>> {
    return apiClient.get<Business>(API_ENDPOINTS.BUSINESS.GET(id));
  }

  static async createBusiness(data: CreateBusinessData): Promise<ApiResponse<Business>> {
    return apiClient.post<Business>(API_ENDPOINTS.BUSINESS.CREATE, data);
  }

  static async updateBusiness(id: number, data: UpdateBusinessData): Promise<ApiResponse<Business>> {
    return apiClient.put<Business>(API_ENDPOINTS.BUSINESS.UPDATE(id), data);
  }

  static async deleteBusiness(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(API_ENDPOINTS.BUSINESS.DELETE(id));
  }

  // WhatsApp configuration
  static async getWhatsAppConfig(businessId: number): Promise<ApiResponse<WhatsAppConfig>> {
    return apiClient.get<WhatsAppConfig>(`/basic/businesses/${businessId}/whatsapp`);
  }

  static async createWhatsAppConfig(
    businessId: number,
    data: Omit<WhatsAppConfig, "id" | "business_id">
  ): Promise<ApiResponse<WhatsAppConfig>> {
    return apiClient.post<WhatsAppConfig>(`/basic/businesses/${businessId}/whatsapp`, data);
  }

  static async updateWhatsAppConfig(
    businessId: number,
    data: Partial<Omit<WhatsAppConfig, "id" | "business_id">>
  ): Promise<ApiResponse<WhatsAppConfig>> {
    return apiClient.put<WhatsAppConfig>(`/basic/businesses/${businessId}/whatsapp`, data);
  }

  static async deleteWhatsAppConfig(businessId: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/basic/businesses/${businessId}/whatsapp`);
  }

  // Business tones
  static async getBusinessTones(businessId: number): Promise<ApiResponse<BusinessTone[]>> {
    return apiClient.get<BusinessTone[]>(`/basic/businesses/${businessId}/tones`);
  }

  static async createBusinessTone(
    businessId: number,
    data: CreateBusinessToneData
  ): Promise<ApiResponse<BusinessTone>> {
    return apiClient.post<BusinessTone>(`/basic/businesses/${businessId}/tones`, data);
  }

  static async updateBusinessTone(
    toneId: number,
    data: Partial<CreateBusinessToneData>
  ): Promise<ApiResponse<BusinessTone>> {
    return apiClient.put<BusinessTone>(`/basic/tones/${toneId}`, data);
  }

  static async deleteBusinessTone(toneId: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/basic/tones/${toneId}`);
  }

  // Conversations and messages
  static async getConversations(
    businessId: number,
    params?: {
      page?: number;
      limit?: number;
      status?: "active" | "archived";
    }
  ): Promise<ApiResponse<{ conversations: Conversation[]; total: number; page: number; limit: number }>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.status) queryParams.append("status", params.status);

    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
    
    // The API returns { success: true, data: [...], count: 1 }
    // But we need to transform it to { success: true, data: { conversations: [...], total: 1, page: 1, limit: 10 } }
    const response = await apiClient.get<Conversation[]>(
      `/basic/businesses/${businessId}/conversations${query}`
    );
    
    if (response.success && response.data) {
      // Transform the response to match expected structure
      return {
        success: true,
        data: {
          conversations: response.data,
          total: response.count || response.data.length,
          page: params?.page || 1,
          limit: params?.limit || 10
        }
      };
    }
    
    return response as any; // Return original response if not successful
  }

  static async getConversationMessages(
    conversationId: number,
    params?: {
      page?: number;
      limit?: number;
    }
  ): Promise<ApiResponse<{ messages: Message[]; total: number; page: number; limit: number }>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
    return apiClient.get<{ messages: Message[]; total: number; page: number; limit: number }>(
      `/basic/conversations/${conversationId}/messages${query}`
    );
  }

  static async archiveConversation(conversationId: number): Promise<ApiResponse<void>> {
    return apiClient.patch<void>(`/basic/conversations/${conversationId}`, { status: "archived" });
  }

  static async unarchiveConversation(conversationId: number): Promise<ApiResponse<void>> {
    return apiClient.patch<void>(`/basic/conversations/${conversationId}`, { status: "active" });
  }

  // Bulk operations
  static async bulkDeleteBusinesses(ids: number[]): Promise<ApiResponse<{ deleted: number; failed: number }>> {
    return apiClient.post<{ deleted: number; failed: number }>("/basic/businesses/bulk-delete", { ids });
  }

  static async bulkUpdateBusinessStatus(
    ids: number[],
    status: "active" | "inactive"
  ): Promise<ApiResponse<{ updated: number; failed: number }>> {
    return apiClient.post<{ updated: number; failed: number }>("/basic/businesses/bulk-update-status", { ids, status });
  }

  // Analytics and stats
  static async getBusinessStats(
    businessId: number,
    params?: {
      startDate?: string;
      endDate?: string;
    }
  ): Promise<
    ApiResponse<{
      totalConversations: number;
      totalMessages: number;
      activeConversations: number;
      messagesByType: Record<string, number>;
      conversationsByDay: Array<{ date: string; count: number }>;
    }>
  > {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);

    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
    return apiClient.get(`/basic/businesses/${businessId}/stats${query}`);
  }

  // Health check for business services
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await apiClient.get("/health", { skipAuth: true, retries: 0 });
      return response.success;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const businessService = new BusinessService();
