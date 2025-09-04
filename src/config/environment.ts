// Environment Configuration
export const ENV_CONFIG = {
  API_URL: import.meta.env.VITE_API_URL || "", // '' for production
  API_BASE: import.meta.env.VITE_API_BASE || "/api", // relative path in production
  NODE_ENV: import.meta.env.MODE || "development",
} as const;

// API Configuration
export const API_CONFIG = {
  BASE_URL: ENV_CONFIG.API_URL,
  API_BASE: ENV_CONFIG.API_BASE,
  TIMEOUT: 30000,
} as const;
