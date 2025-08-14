import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { PlatformConfig } from '../config/platforms';
import { ExportFormat } from '../config/api';

export interface ExportJob {
  id: string;
  platform: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  createdAt: Date;
  completedAt?: Date;
  error?: string;
  downloadUrl?: string;
  format: ExportFormat;
  recordCount?: number;
}

export interface AuthState {
  tokens: Record<string, string>;
  isAuthenticated: (platform: string) => boolean;
  setToken: (platform: string, token: string) => void;
  removeToken: (platform: string) => void;
  clearAll: () => void;
}

export interface ExportState {
  jobs: ExportJob[];
  currentJob?: ExportJob;
  addJob: (job: Omit<ExportJob, 'id' | 'createdAt'>) => void;
  updateJob: (id: string, updates: Partial<ExportJob>) => void;
  removeJob: (id: string) => void;
  setCurrentJob: (job: ExportJob | undefined) => void;
  clearCompleted: () => void;
}

export interface UIState {
  selectedPlatform?: PlatformConfig;
  exportFormat: ExportFormat;
  isExporting: boolean;
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    timestamp: Date;
  }>;
  setSelectedPlatform: (platform: PlatformConfig | undefined) => void;
  setExportFormat: (format: ExportFormat) => void;
  setIsExporting: (isExporting: boolean) => void;
  addNotification: (notification: Omit<UIState['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export interface AppStore extends AuthState, ExportState, UIState {}

export const useStore = create<AppStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Auth state
        tokens: {},
        isAuthenticated: (platform: string) => {
          return Boolean(get().tokens[platform]);
        },
        setToken: (platform: string, token: string) => {
          set((state) => ({
            tokens: { ...state.tokens, [platform]: token },
          }));
        },
        removeToken: (platform: string) => {
          set((state) => {
            const { [platform]: removed, ...rest } = state.tokens;
            return { tokens: rest };
          });
        },
        clearAll: () => {
          set({ tokens: {} });
        },

        // Export state
        jobs: [],
        currentJob: undefined,
        addJob: (job) => {
          const newJob: ExportJob = {
            ...job,
            id: crypto.randomUUID(),
            createdAt: new Date(),
          };
          set((state) => ({
            jobs: [newJob, ...state.jobs],
          }));
          return newJob.id;
        },
        updateJob: (id, updates) => {
          set((state) => ({
            jobs: state.jobs.map((job) =>
              job.id === id ? { ...job, ...updates } : job
            ),
            currentJob: state.currentJob?.id === id 
              ? { ...state.currentJob, ...updates }
              : state.currentJob,
          }));
        },
        removeJob: (id) => {
          set((state) => ({
            jobs: state.jobs.filter((job) => job.id !== id),
            currentJob: state.currentJob?.id === id ? undefined : state.currentJob,
          }));
        },
        setCurrentJob: (job) => {
          set({ currentJob: job });
        },
        clearCompleted: () => {
          set((state) => ({
            jobs: state.jobs.filter((job) => job.status !== 'completed'),
          }));
        },

        // UI state
        selectedPlatform: undefined,
        exportFormat: 'json',
        isExporting: false,
        notifications: [],
        setSelectedPlatform: (platform) => {
          set({ selectedPlatform: platform });
        },
        setExportFormat: (format) => {
          set({ exportFormat: format });
        },
        setIsExporting: (isExporting) => {
          set({ isExporting });
        },
        addNotification: (notification) => {
          const newNotification = {
            ...notification,
            id: crypto.randomUUID(),
            timestamp: new Date(),
          };
          set((state) => ({
            notifications: [newNotification, ...state.notifications].slice(0, 10), // Keep only latest 10
          }));
        },
        removeNotification: (id) => {
          set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
          }));
        },
        clearNotifications: () => {
          set({ notifications: [] });
        },
      }),
      {
        name: 'star-export-store',
        partialize: (state) => ({
          tokens: state.tokens,
          jobs: state.jobs,
          exportFormat: state.exportFormat,
        }),
      }
    ),
    {
      name: 'star-export-store',
    }
  )
);