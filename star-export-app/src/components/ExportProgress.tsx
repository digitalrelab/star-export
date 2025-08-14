import React, { memo, useMemo } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon, 
  DownloadIcon, 
  StopCircleIcon,
  AlertCircleIcon
} from 'lucide-react';
import { useExport } from '../hooks/useExport';
import { ExportJob } from '../types';

interface ExportProgressProps {
  job?: ExportJob;
  showFullDetails?: boolean;
  className?: string;
}

interface ProgressBarProps {
  progress: number;
  status: string;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = memo(({ progress, status, className = '' }) => {
  const progressColor = useMemo(() => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'pending':
        return 'bg-gray-400';
      default:
        return 'bg-blue-500';
    }
  }, [status]);

  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <div
        className={`h-2 rounded-full transition-all duration-300 ease-out ${progressColor}`}
        style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
      />
    </div>
  );
});

ProgressBar.displayName = 'ProgressBar';

interface StatusIconProps {
  status: string;
  className?: string;
}

const StatusIcon: React.FC<StatusIconProps> = memo(({ status, className = 'h-5 w-5' }) => {
  switch (status) {
    case 'completed':
      return <CheckCircleIcon className={`${className} text-green-500`} />;
    case 'failed':
      return <XCircleIcon className={`${className} text-red-500`} />;
    case 'pending':
      return <ClockIcon className={`${className} text-gray-500`} />;
    case 'running':
      return (
        <div className={`${className} border-2 border-blue-500 border-t-transparent rounded-full animate-spin`} />
      );
    default:
      return <AlertCircleIcon className={`${className} text-yellow-500`} />;
  }
});

StatusIcon.displayName = 'StatusIcon';

interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  variant: 'primary' | 'secondary' | 'danger';
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}

const ActionButton: React.FC<ActionButtonProps> = memo(({
  onClick,
  disabled = false,
  variant,
  icon: Icon,
  children
}) => {
  const baseClasses = "inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
      {Icon && <Icon className="h-3 w-3 mr-1.5" />}
      {children}
    </button>
  );
});

ActionButton.displayName = 'ActionButton';

export const ExportProgress: React.FC<ExportProgressProps> = memo(({ 
  job, 
  showFullDetails = false, 
  className = '' 
}) => {
  const { currentJob, progress, cancelExport, retryExport } = useExport();
  
  // Use provided job or current job
  const activeJob = job || currentJob;
  
  if (!activeJob) {
    return null;
  }

  const handleCancel = async () => {
    if (activeJob.id) {
      await cancelExport(activeJob.id);
    }
  };

  const handleRetry = async () => {
    if (activeJob.id) {
      await retryExport(activeJob.id);
    }
  };

  const handleDownload = () => {
    if (activeJob.downloadUrl) {
      window.open(activeJob.downloadUrl, '_blank');
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Queued';
      case 'running':
        return 'Exporting';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  const estimatedTimeText = progress?.estimatedTimeRemaining 
    ? formatDuration(progress.estimatedTimeRemaining)
    : null;

  const elapsedTime = activeJob.completedAt 
    ? activeJob.completedAt.getTime() - activeJob.createdAt.getTime()
    : Date.now() - activeJob.createdAt.getTime();

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <StatusIcon status={activeJob.status} />
          <div>
            <h4 className="text-sm font-medium text-gray-900">
              {activeJob.platform} Export
            </h4>
            <p className="text-xs text-gray-500">
              {getStatusText(activeJob.status)} • {activeJob.format.toUpperCase()}
            </p>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex space-x-2">
          {activeJob.status === 'running' && (
            <ActionButton
              onClick={handleCancel}
              variant="secondary"
              icon={StopCircleIcon}
            >
              Cancel
            </ActionButton>
          )}
          
          {activeJob.status === 'failed' && (
            <ActionButton
              onClick={handleRetry}
              variant="primary"
            >
              Retry
            </ActionButton>
          )}
          
          {activeJob.status === 'completed' && activeJob.downloadUrl && (
            <ActionButton
              onClick={handleDownload}
              variant="primary"
              icon={DownloadIcon}
            >
              Download
            </ActionButton>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <ProgressBar 
        progress={activeJob.progress} 
        status={activeJob.status}
        className="mb-3"
      />

      {/* Progress details */}
      <div className="flex items-center justify-between text-xs text-gray-600">
        <span>{activeJob.progress}% complete</span>
        <span>Started {formatTime(activeJob.createdAt)}</span>
      </div>

      {/* Extended details for full view */}
      {showFullDetails && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-xs">
            {/* Current step */}
            {progress?.currentStep && (
              <div>
                <span className="font-medium text-gray-700">Current step:</span>
                <p className="text-gray-600 mt-1">{progress.currentStep}</p>
              </div>
            )}

            {/* Record progress */}
            {(progress?.recordsProcessed !== undefined || progress?.totalRecords !== undefined) && (
              <div>
                <span className="font-medium text-gray-700">Records:</span>
                <p className="text-gray-600 mt-1">
                  {progress?.recordsProcessed || 0}
                  {progress?.totalRecords && ` of ${progress.totalRecords}`}
                </p>
              </div>
            )}

            {/* Time estimates */}
            <div>
              <span className="font-medium text-gray-700">Elapsed time:</span>
              <p className="text-gray-600 mt-1">{formatDuration(elapsedTime)}</p>
            </div>

            {estimatedTimeText && activeJob.status === 'running' && (
              <div>
                <span className="font-medium text-gray-700">Time remaining:</span>
                <p className="text-gray-600 mt-1">{estimatedTimeText}</p>
              </div>
            )}

            {/* File info */}
            {activeJob.recordCount && (
              <div>
                <span className="font-medium text-gray-700">Total records:</span>
                <p className="text-gray-600 mt-1">{activeJob.recordCount.toLocaleString()}</p>
              </div>
            )}

            {/* Error details */}
            {activeJob.status === 'failed' && activeJob.error && (
              <div className="col-span-2">
                <span className="font-medium text-red-700">Error:</span>
                <p className="text-red-600 mt-1 p-2 bg-red-50 rounded border border-red-200">
                  {activeJob.error}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Completion info */}
      {activeJob.status === 'completed' && activeJob.completedAt && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Completed {formatTime(activeJob.completedAt)}</span>
            <span>Duration: {formatDuration(elapsedTime)}</span>
          </div>
        </div>
      )}
    </div>
  );
});

ExportProgress.displayName = 'ExportProgress';

export default ExportProgress;