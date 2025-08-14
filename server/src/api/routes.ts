import { Router, Request, Response } from 'express';
import { ExportService } from '../services/exportService';
import { createError } from '../utils/errorHandler';
import path from 'path';
import fs from 'fs';

const router = Router();
const exportService = new ExportService();

const requireAuth = (req: Request, res: Response, next: any) => {
  // In development mode, bypass auth for testing
  if (process.env.NODE_ENV === 'development') {
    // Create a mock user for testing
    req.user = {
      id: 'test-user-123',
      accessToken: 'test-access-token',
      name: 'Test User',
      email: 'test@example.com'
    };
    return next();
  }
  
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }
  next();
};

router.post('/export', requireAuth, async (req: Request, res: Response, next) => {
  try {
    const { platform, format, includeMedia = false } = req.body;
    const user = req.user as any;

    if (!platform) {
      throw createError('Platform is required', 400);
    }

    if (!format) {
      throw createError('Format is required', 400);
    }

    const jobId = await exportService.startExport(user.id, platform, format, includeMedia);

    res.json({
      success: true,
      data: { jobId }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/status/:jobId', requireAuth, (req: Request, res: Response, next) => {
  try {
    const { jobId } = req.params;
    const user = req.user as any;

    const job = exportService.getJobStatus(jobId);
    
    if (!job) {
      throw createError('Job not found', 404);
    }

    if (job.userId !== user.id) {
      throw createError('Access denied', 403);
    }

    res.json({
      success: true,
      data: {
        status: job.status,
        progress: job.progress,
        currentStep: job.currentStep,
        recordsProcessed: job.recordsProcessed,
        totalRecords: job.totalRecords,
        downloadUrl: job.downloadUrl,
        error: job.error,
        includeMedia: job.includeMedia,
        mediaDownloadPath: job.mediaDownloadPath
      }
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/export/:jobId', requireAuth, (req: Request, res: Response, next) => {
  try {
    const { jobId } = req.params;
    const user = req.user as any;

    const job = exportService.getJobStatus(jobId);
    
    if (!job) {
      throw createError('Job not found', 404);
    }

    if (job.userId !== user.id) {
      throw createError('Access denied', 403);
    }

    const cancelled = exportService.cancelJob(jobId);

    res.json({
      success: cancelled,
      message: cancelled ? 'Job cancelled' : 'Job could not be cancelled'
    });
  } catch (error) {
    next(error);
  }
});

router.get('/history', requireAuth, (req: Request, res: Response, next) => {
  try {
    const user = req.user as any;
    const jobs = exportService.getUserJobs(user.id);

    const formattedJobs = jobs.map(job => ({
      id: job.id,
      platform: job.platform,
      status: job.status,
      format: job.format,
      createdAt: job.startedAt?.toISOString(),
      completedAt: job.completedAt?.toISOString(),
      recordCount: job.recordsProcessed,
      downloadUrl: job.downloadUrl
    }));

    res.json({
      success: true,
      data: {
        jobs: formattedJobs,
        pagination: {
          page: 1,
          limit: 20,
          total: formattedJobs.length,
          totalPages: 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/status/platform/:platform', requireAuth, (req: Request, res: Response, next) => {
  try {
    const { platform } = req.params;
    const user = req.user as any;

    const connected = platform === 'youtube' && user.accessToken;

    res.json({
      success: true,
      data: {
        connected,
        rateLimit: {
          remaining: 1000,
          resetTime: new Date(Date.now() + 60 * 60 * 1000).toISOString()
        },
        lastSync: user.updatedAt?.toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/exports/:jobId/:filename', requireAuth, (req: Request, res: Response, next) => {
  try {
    const { jobId, filename } = req.params;
    const user = req.user as any;

    const job = exportService.getJobStatus(jobId);
    
    if (!job) {
      throw createError('Job not found', 404);
    }

    if (job.userId !== user.id) {
      throw createError('Access denied', 403);
    }

    const filePath = path.join(process.cwd(), 'exports', jobId, filename);
    
    if (!fs.existsSync(filePath)) {
      throw createError('File not found', 404);
    }

    const isArchive = filename.endsWith('.zip');
    const contentType = isArchive ? 'application/zip' : 'application/json';
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    next(error);
  }
});

export { router as apiRoutes };