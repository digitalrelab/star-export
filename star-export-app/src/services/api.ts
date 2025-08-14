import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_CONFIG, getApiUrl, buildApiHeaders } from '../config/api';

// API Error class for better error handling
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Request/Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ExportRequest {
  platform: string;
  format: string;
  includeMedia?: boolean;
  options?: {
    dateRange?: {
      start: string;
      end: string;
    };
    includeMetadata?: boolean;
    maxRecords?: number;
  };
}

export interface AuthTokenRequest {
  platform: string;
  code?: string;
  token?: string;
}

// Create axios instance with default configuration
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    timeout: API_CONFIG.timeout,
    headers: buildApiHeaders(),
  });

  // Request interceptor to add auth tokens
  instance.interceptors.request.use(
    (config) => {
      // Add auth token if available
      const token = getStoredToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add request timestamp for rate limiting
      config.metadata = { requestTime: Date.now() };

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling and retries
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

      // Handle 401 Unauthorized
      if (error.response?.status === 401) {
        clearStoredToken();
        // Redirect to auth page or emit auth error event
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        return Promise.reject(new ApiError('Authentication required', 401, error.response));
      }

      // Handle 429 Rate Limited with retry
      if (error.response?.status === 429 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        const retryAfter = error.response.headers['retry-after'];
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : API_CONFIG.retryDelay;
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return instance(originalRequest);
      }

      // Handle network errors with retry
      if (!error.response && !originalRequest._retry) {
        originalRequest._retry = true;
        await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay));
        return instance(originalRequest);
      }

      // Transform error to ApiError
      const apiError = new ApiError(
        error.response?.data?.message || error.message || 'An error occurred',
        error.response?.status,
        error.response?.data
      );

      return Promise.reject(apiError);
    }
  );

  return instance;
};

// Singleton API instance
const api = createApiInstance();

// Token management functions
const getStoredToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

const setStoredToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

const clearStoredToken = (): void => {
  localStorage.removeItem('auth_token');
};

// API service class
export class ApiService {
  private static instance: ApiService;

  private constructor() {}

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  // Authentication methods
  async authenticate(platform: string, authData: AuthTokenRequest): Promise<ApiResponse<{ token: string }>> {
    try {
      const response = await api.post(
        getApiUrl(`${API_CONFIG.endpoints.auth}/${platform}`),
        authData
      );
      
      if (response.data.success && response.data.data?.token) {
        setStoredToken(response.data.data.token);
      }
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await api.post(getApiUrl(`${API_CONFIG.endpoints.auth}/logout`));
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error);
    } finally {
      clearStoredToken();
    }
  }

  // Export methods
  async startExport(exportRequest: ExportRequest): Promise<ApiResponse<{ jobId: string }>> {
    try {
      const response = await api.post(
        getApiUrl(API_CONFIG.endpoints.export),
        exportRequest
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getExportStatus(jobId: string): Promise<ApiResponse<{
    status: string;
    progress: number;
    currentStep?: string;
    recordsProcessed?: number;
    totalRecords?: number;
    estimatedTimeRemaining?: number;
    downloadUrl?: string;
  }>> {
    try {
      const response = await api.get(
        getApiUrl(`${API_CONFIG.endpoints.status}/${jobId}`)
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async cancelExport(jobId: string): Promise<ApiResponse> {
    try {
      const response = await api.delete(
        getApiUrl(`${API_CONFIG.endpoints.export}/${jobId}`)
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // History methods
  async getExportHistory(page = 1, limit = 20): Promise<ApiResponse<{
    jobs: Array<{
      id: string;
      platform: string;
      status: string;
      format: string;
      createdAt: string;
      completedAt?: string;
      recordCount?: number;
      downloadUrl?: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>> {
    try {
      const response = await api.get(
        getApiUrl(API_CONFIG.endpoints.history),
        {
          params: { page, limit }
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Platform methods
  async getPlatformStatus(platform: string): Promise<ApiResponse<{
    connected: boolean;
    rateLimit: {
      remaining: number;
      resetTime: string;
    };
    lastSync?: string;
  }>> {
    try {
      const response = await api.get(
        getApiUrl(`${API_CONFIG.endpoints.status}/platform/${platform}`)
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Generic GET method for custom endpoints
  async get<T = any>(endpoint: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await api.get(getApiUrl(endpoint), config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Generic POST method for custom endpoints
  async post<T = any>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await api.post(getApiUrl(endpoint), data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error handler
  private handleError(error: any): ApiError {
    if (error instanceof ApiError) {
      return error;
    }
    
    if (axios.isAxiosError(error)) {
      return new ApiError(
        error.response?.data?.message || error.message || 'Request failed',
        error.response?.status,
        error.response?.data
      );
    }
    
    return new ApiError(error.message || 'Unknown error occurred');
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await api.get(getApiUrl('/health'));
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const apiService = ApiService.getInstance();
export default apiService;