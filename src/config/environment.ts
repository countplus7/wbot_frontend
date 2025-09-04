// Environment Configuration
export const ENV_CONFIG = {
  API_URL: import.meta.env.VITE_API_URL || "http://localhost:8080",
  API_BASE: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  NODE_ENV: import.meta.env.MODE || "development",
} as const;

// API Configuration
export const API_CONFIG = {
  BASE_URL: ENV_CONFIG.API_URL,
  API_BASE: ENV_CONFIG.API_BASE,
  TIMEOUT: 30000,
} as const;
