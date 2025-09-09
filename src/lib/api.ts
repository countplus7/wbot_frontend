import { API_CONFIG } from '../config/environment';

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
}

export interface ApiError {
  success: false;
  error: string;
  message: string;
}

// Business Types
export interface Business {
  id: number;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface WhatsAppConfig {
  id: number;
  business_id: number;
  phone_number_id: string;
  access_token: string;
  verify_token?: string;
  webhook_url?: string;

  created_at: string;
  updated_at: string;
}

export interface BusinessTone {
  id: number;
  business_id: number;
  name: string;
  description?: string;
  tone_instructions: string;
  created_at: string;
  updated_at: string;
}

export interface BusinessWithConfigAndTones extends Business {
  whatsapp_config?: WhatsAppConfig;
  tones: BusinessTone[];
}

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
  direction: 'inbound' | 'outbound';
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

// API Client Class
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Create API client instance
export const apiClient = new ApiClient(API_CONFIG.API_BASE);

// Health check function
export const checkApiHealth = async () => {
  try {
    const response = await fetch(`${API_CONFIG.API_BASE}/health`);
    return response.ok;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
}; 
