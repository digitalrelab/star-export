// TypeScript Type Definitions
// Export all types and interfaces from this directory

// Re-export types from config
export type { PlatformConfig } from '../config/platforms';
export type { ExportFormat } from '../config/api';

// Re-export types from store
export type { ExportJob, AuthState, ExportState, UIState, AppStore } from '../store';

// Example additional type exports (will be created later):
// export type { User, UserProfile, UserPreferences } from './user';
// export type { ApiResponse, ApiError, PaginatedResponse } from './api';
// export type { ExportOptions, ExportResult, ExportProgress } from './export';
// export type { NotificationSettings, Theme, Language } from './settings';

// Common utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// API-related types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Export-related types
export interface ExportOptions {
  format: ExportFormat;
  dateRange?: {
    start: Date;
    end: Date;
  };
  includeMetadata?: boolean;
  maxRecords?: number;
}

export interface ExportProgress {
  jobId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  currentStep?: string;
  recordsProcessed?: number;
  totalRecords?: number;
  estimatedTimeRemaining?: number;
}