// src/config/index.ts
// Detect environment
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Base URL from environment, with fallback
// Base URL from environment, with intelligent fallback

const API_BASE = import.meta.env.VITE_API_BASE_URL || (isDevelopment ? "/api" : "http://localhost:5000/api");

// General API configuration
export const API_CONFIG = {
  API_BASE,
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: isProduction ? 2 : 0,
  RETRY_DELAY: 1000,
  ENABLE_LOGGING: isDevelopment,
  ENABLE_CACHE: isProduction,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
} as const;

// Helper to build full endpoint URLs
export const getEndpoint = (path: string) => `${API_CONFIG.API_BASE}${path}`;

// Helper to build headers (multi-tenant & auth)
export const getHeaders = (token?: string, businessId?: number) => {
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (businessId) headers["X-Business-ID"] = String(businessId);
  return headers;
};

// API endpoints constants
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    SIGNUP: "/auth/signup",
    PROFILE: "/auth/profile",
    ADMIN_EXISTS: "/auth/admin-exists",
    REFRESH: "/auth/refresh",
  },

  BUSINESS: {
    LIST: "/basic/businesses",
    CREATE: "/basic/businesses",
    UPDATE: (id: number) => `/basic/businesses/${id}`,
    DELETE: (id: number) => `/basic/businesses/${id}`,
    GET: (id: number) => `/basic/businesses/${id}`,
  },

  WHATSAPP: {
    WEBHOOK: "/webhook",
    CONFIG: (businessId: number) => `/basic/businesses/${businessId}/whatsapp`,
  },

  HEALTH: "/health",
} as const;

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Error types
export const API_ERRORS = {
  NETWORK_ERROR: "NETWORK_ERROR",
  TIMEOUT_ERROR: "TIMEOUT_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  AUTHENTICATION_ERROR: "AUTHENTICATION_ERROR",
  AUTHORIZATION_ERROR: "AUTHORIZATION_ERROR",
  NOT_FOUND_ERROR: "NOT_FOUND_ERROR",
  SERVER_ERROR: "SERVER_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

export type ApiErrorType = keyof typeof API_ERRORS;
