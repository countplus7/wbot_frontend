import { API_CONFIG, API_ERRORS, HTTP_STATUS, type ApiErrorType } from '@/config';

// Enhanced API response interface
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
  timestamp?: string;
}

// API Error class
export class ApiError extends Error {
  public readonly status: number;
  public readonly type: ApiErrorType;
  public readonly data?: any;

  constructor(
    message: string,
    status: number,
    type: ApiErrorType,
    data?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.type = type;
    this.data = data;
  }
}

// Request configuration interface
interface RequestConfig extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  skipAuth?: boolean;
}

// Token management
class TokenManager {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  static clearTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }
}

// Enhanced API Client
export class ApiClient {
  private readonly baseURL: string;
  private readonly defaultTimeout: number;
  private requestInterceptors: Array<(config: RequestConfig) => RequestConfig> = [];
  private responseInterceptors: Array<(response: Response) => Response | Promise<Response>> = [];

  constructor(baseURL: string, timeout: number = API_CONFIG.TIMEOUT) {
    this.baseURL = baseURL;
    this.defaultTimeout = timeout;
    
    // Add default auth interceptor
    this.addRequestInterceptor((config) => {
      if (!config.skipAuth) {
        const token = TokenManager.getToken();
        if (token) {
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`,
          };
        }
      }
      return config;
    });
  }

  // Add request interceptor
  addRequestInterceptor(interceptor: (config: RequestConfig) => RequestConfig): void {
    this.requestInterceptors.push(interceptor);
  }

  // Add response interceptor
  addResponseInterceptor(interceptor: (response: Response) => Response | Promise<Response>): void {
    this.responseInterceptors.push(interceptor);
  }

  // Sleep utility for retry delays
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Enhanced request method with retry logic
  private async makeRequest<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      timeout = this.defaultTimeout,
      retries = API_CONFIG.RETRY_ATTEMPTS,
      retryDelay = API_CONFIG.RETRY_DELAY,
      ...requestConfig
    } = config;

    const url = `${this.baseURL}${endpoint}`;
    
    // Apply request interceptors
    let finalConfig = { ...requestConfig };
    for (const interceptor of this.requestInterceptors) {
      finalConfig = interceptor(finalConfig);
    }

    // Set default headers
    finalConfig.headers = {
      'Content-Type': 'application/json',
      ...finalConfig.headers,
    };

    let lastError: Error;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        finalConfig.signal = controller.signal;

        if (API_CONFIG.ENABLE_LOGGING) {
          console.log(`API Request [Attempt ${attempt + 1}]:`, {
            method: finalConfig.method || 'GET',
            url,
            headers: finalConfig.headers,
          });
        }

        let response = await fetch(url, finalConfig);
        clearTimeout(timeoutId);

        // Apply response interceptors
        for (const interceptor of this.responseInterceptors) {
          response = await interceptor(response);
        }

        const data = await response.json();

        if (API_CONFIG.ENABLE_LOGGING) {
          console.log(`API Response [${response.status}]:`, data);
        }

        if (!response.ok) {
          throw new ApiError(
            data.error || `HTTP ${response.status}`,
            response.status,
            this.getErrorType(response.status),
            data
          );
        }

        return data;
      } catch (error) {
        lastError = error as Error;

        if (error instanceof ApiError) {
          // Don't retry client errors (4xx)
          if (error.status >= 400 && error.status < 500) {
            throw error;
          }
        }

        if (error.name === 'AbortError') {
          lastError = new ApiError(
            'Request timeout',
            408,
            API_ERRORS.TIMEOUT_ERROR
          );
        }

        // If this was the last attempt, throw the error
        if (attempt === retries) {
          throw lastError;
        }

        // Wait before retrying
        await this.sleep(retryDelay * Math.pow(2, attempt)); // Exponential backoff
        
        if (API_CONFIG.ENABLE_LOGGING) {
          console.log(`Retrying request in ${retryDelay * Math.pow(2, attempt)}ms...`);
        }
      }
    }

    throw lastError!;
  }

  // Get error type based on status code
  private getErrorType(status: number): ApiErrorType {
    switch (status) {
      case HTTP_STATUS.BAD_REQUEST:
        return API_ERRORS.VALIDATION_ERROR;
      case HTTP_STATUS.UNAUTHORIZED:
        return API_ERRORS.AUTHENTICATION_ERROR;
      case HTTP_STATUS.FORBIDDEN:
        return API_ERRORS.AUTHORIZATION_ERROR;
      case HTTP_STATUS.NOT_FOUND:
        return API_ERRORS.NOT_FOUND_ERROR;
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
      case HTTP_STATUS.SERVICE_UNAVAILABLE:
        return API_ERRORS.SERVER_ERROR;
      default:
        return API_ERRORS.UNKNOWN_ERROR;
    }
  }

  // HTTP methods
  async get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...config, method: 'DELETE' });
  }

  // Authentication methods
  async login(credentials: { username: string; password: string }) {
    const response = await this.post('/auth/login', credentials, { skipAuth: true });
    if (response.success && response.data) {
      TokenManager.setToken(response.data.token);
      if (response.data.refreshToken) {
        TokenManager.setRefreshToken(response.data.refreshToken);
      }
    }
    return response;
  }

  async logout() {
    TokenManager.clearTokens();
  }

  async refreshToken() {
    const refreshToken = TokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new ApiError('No refresh token available', 401, API_ERRORS.AUTHENTICATION_ERROR);
    }

    try {
      const response = await this.post('/auth/refresh', { refreshToken }, { skipAuth: true });
      if (response.success && response.data) {
        TokenManager.setToken(response.data.token);
        return response.data.token;
      }
      throw new Error('Failed to refresh token');
    } catch (error) {
      TokenManager.clearTokens();
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.get('/health', { skipAuth: true, retries: 0 });
      return response.success;
    } catch {
      return false;
    }
  }
}

// Create singleton instance
export const apiClient = new ApiClient(API_CONFIG.API_BASE);

// Export token manager for external use
export { TokenManager };
