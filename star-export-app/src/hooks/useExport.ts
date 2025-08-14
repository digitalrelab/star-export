import { useCallback, useEffect, useRef, useState } from 'react';
import { useStore } from '../store';
import { apiService, ApiError, ExportRequest } from '../services/api';
import { ExportJob, ExportProgress } from '../types';

export interface UseExportReturn {
  // State
  currentJob: ExportJob | undefined;
  jobs: ExportJob[];
  isExporting: boolean;
  
  // Actions
  startExport: (request: ExportRequest) => Promise<string | null>;
  cancelExport: (jobId: string) => Promise<boolean>;
  retryExport: (jobId: string) => Promise<string | null>;
  clearCompletedJobs: () => void;
  
  // Real-time progress
  progress: ExportProgress | null;
  
  // Job management
  getJob: (jobId: string) => ExportJob | undefined;
  removeJob: (jobId: string) => void;
}

// Poll interval for checking export status (in milliseconds)
const POLL_INTERVAL = 2000; // 2 seconds
const MAX_POLL_DURATION = 300000; // 5 minutes max polling

export const useExport = (): UseExportReturn => {
  const {
    jobs,
    currentJob,
    addJob,
    updateJob,
    removeJob,
    setCurrentJob,
    clearCompleted,
    isExporting,
    setIsExporting,
    addNotification
  } = useStore();

  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollStartTimeRef = useRef<number | null>(null);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // Poll for export status updates
  const startPolling = useCallback((jobId: string) => {
    // Clear any existing polling
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    pollStartTimeRef.current = Date.now();

    const poll = async () => {
      try {
        // Check if we've been polling too long
        if (pollStartTimeRef.current && 
            Date.now() - pollStartTimeRef.current > MAX_POLL_DURATION) {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
          addNotification({
            type: 'warning',
            message: 'Export is taking longer than expected. You can check the status later in the history page.'
          });
          return;
        }

        const response = await apiService.getExportStatus(jobId);
        
        if (response.success && response.data) {
          const statusData = response.data;
          
          // Update progress state
          setProgress({
            jobId,
            status: statusData.status as any,
            progress: statusData.progress,
            currentStep: statusData.currentStep,
            recordsProcessed: statusData.recordsProcessed,
            totalRecords: statusData.totalRecords,
            estimatedTimeRemaining: statusData.estimatedTimeRemaining
          });

          // Update job in store
          updateJob(jobId, {
            status: statusData.status as any,
            progress: statusData.progress,
            recordCount: statusData.totalRecords,
            downloadUrl: statusData.downloadUrl
          });

          // Stop polling if job is completed or failed
          if (statusData.status === 'completed') {
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
            }
            setIsExporting(false);
            setCurrentJob(undefined);
            setProgress(null);
            
            updateJob(jobId, {
              completedAt: new Date(),
              downloadUrl: statusData.downloadUrl
            });

            addNotification({
              type: 'success',
              message: 'Export completed successfully! You can download your data now.'
            });
          } else if (statusData.status === 'failed') {
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
            }
            setIsExporting(false);
            setCurrentJob(undefined);
            setProgress(null);

            addNotification({
              type: 'error',
              message: 'Export failed. Please try again or contact support if the issue persists.'
            });
          }
        }
      } catch (err) {
        console.error('Failed to poll export status:', err);
        
        // Don't show error notification for every poll failure
        // Only stop polling if it's a 404 (job not found) or similar critical error
        if (err instanceof ApiError && err.status === 404) {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
          setIsExporting(false);
          setCurrentJob(undefined);
          setProgress(null);
          
          addNotification({
            type: 'error',
            message: 'Export job not found. It may have been cancelled or expired.'
          });
        }
      }
    };

    // Start polling immediately, then at intervals
    poll();
    pollIntervalRef.current = setInterval(poll, POLL_INTERVAL);
  }, [updateJob, setIsExporting, setCurrentJob, addNotification]);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    pollStartTimeRef.current = null;
    setProgress(null);
  }, []);

  const startExport = useCallback(async (request: ExportRequest): Promise<string | null> => {
    try {
      setIsExporting(true);
      
      const response = await apiService.startExport(request);
      
      if (response.success && response.data?.jobId) {
        const jobId = response.data.jobId;
        
        // Create job in store
        const newJob: Omit<ExportJob, 'id' | 'createdAt'> = {
          platform: request.platform,
          status: 'pending',
          progress: 0,
          format: request.format as any,
        };
        
        // Add job to store (it will generate ID and timestamp)
        addJob(newJob);
        
        // Find the job that was just added (it will be at the top of the list)
        const addedJob = jobs.find(job => 
          job.platform === request.platform && 
          job.status === 'pending' &&
          job.format === request.format
        ) || { ...newJob, id: jobId, createdAt: new Date() } as ExportJob;
        
        setCurrentJob(addedJob);
        
        // Start polling for updates
        startPolling(jobId);
        
        addNotification({
          type: 'info',
          message: `Export started for ${request.platform}. You'll be notified when it's ready.`
        });
        
        return jobId;
      } else {
        throw new Error(response.error || 'Failed to start export');
      }
    } catch (err) {
      setIsExporting(false);
      setCurrentJob(undefined);
      
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Failed to start export. Please try again.';
      
      addNotification({
        type: 'error',
        message: errorMessage
      });
      
      return null;
    }
  }, [setIsExporting, addJob, setCurrentJob, startPolling, addNotification, jobs]);

  const cancelExport = useCallback(async (jobId: string): Promise<boolean> => {
    try {
      const response = await apiService.cancelExport(jobId);
      
      if (response.success) {
        // Update job status
        updateJob(jobId, {
          status: 'failed',
          error: 'Cancelled by user'
        });
        
        // Stop polling if this is the current job
        if (currentJob?.id === jobId) {
          stopPolling();
          setCurrentJob(undefined);
          setIsExporting(false);
        }
        
        addNotification({
          type: 'info',
          message: 'Export cancelled successfully'
        });
        
        return true;
      } else {
        throw new Error(response.error || 'Failed to cancel export');
      }
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Failed to cancel export. Please try again.';
      
      addNotification({
        type: 'error',
        message: errorMessage
      });
      
      return false;
    }
  }, [updateJob, currentJob, stopPolling, setCurrentJob, setIsExporting, addNotification]);

  const retryExport = useCallback(async (jobId: string): Promise<string | null> => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) {
      addNotification({
        type: 'error',
        message: 'Job not found'
      });
      return null;
    }

    // Create new export request based on existing job
    const retryRequest: ExportRequest = {
      platform: job.platform,
      format: job.format,
      // Add any additional options that were stored with the original job
    };

    // Remove the failed job
    removeJob(jobId);
    
    // Start new export
    return startExport(retryRequest);
  }, [jobs, addNotification, removeJob, startExport]);

  const clearCompletedJobs = useCallback(() => {
    clearCompleted();
    addNotification({
      type: 'info',
      message: 'Cleared completed jobs'
    });
  }, [clearCompleted, addNotification]);

  const getJob = useCallback((jobId: string): ExportJob | undefined => {
    return jobs.find(job => job.id === jobId);
  }, [jobs]);

  return {
    // State
    currentJob,
    jobs,
    isExporting,
    progress,
    
    // Actions
    startExport,
    cancelExport,
    retryExport,
    clearCompletedJobs,
    getJob,
    removeJob
  };
};

export default useExport;