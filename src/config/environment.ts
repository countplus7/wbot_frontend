export const ENV_CONFIG = {
  API_BASE: import.meta.env.VITE_API_BASE,
  NODE_ENV: import.meta.env.MODE,
} as const;

export const API_CONFIG = {
  API_BASE: ENV_CONFIG.API_BASE,
  TIMEOUT: 30000,
} as const;
