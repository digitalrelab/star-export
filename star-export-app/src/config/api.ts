export const API_CONFIG = {
  // Base configuration
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second

  // Environment-specific settings
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,

  // API endpoints
  endpoints: {
    auth: '/auth',
    export: '/export',
    status: '/status',
    history: '/history',
  },

  // Headers
  defaultHeaders: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },

  // Rate limiting
  rateLimitDefaults: {
    requests: 100,
    window: 60000, // 1 minute
  },

  // File size limits
  maxFileSize: 100 * 1024 * 1024, // 100MB
  
  // Export settings
  export: {
    maxRecords: 10000,
    batchSize: 100,
    formats: ['json', 'csv', 'xlsx'] as const,
  },
} as const;

export type ExportFormat = typeof API_CONFIG.export.formats[number];

export const getApiUrl = (endpoint: string): string => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
  return `${baseUrl}${endpoint}`;
};

export const buildApiHeaders = (additionalHeaders: Record<string, string> = {}): Record<string, string> => {
  return {
    ...API_CONFIG.defaultHeaders,
    ...additionalHeaders,
  };
};