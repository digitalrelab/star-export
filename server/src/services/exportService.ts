import { YouTubeService, ExportProgress } from './youtubeService';
import { FacebookService } from './facebookService';
import { InstagramService } from './instagramService';
import { UserService } from './userService';
import { MediaDownloadService } from './mediaDownloadService';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

export interface ExportJob {
  id: string;
  userId: string;
  platform: string;
  format: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  currentStep?: string;
  recordsProcessed?: number;
  totalRecords?: number;
  startedAt?: Date;
  completedAt?: Date;
  downloadUrl?: string;
  error?: string;
  includeMedia?: boolean;
  mediaDownloadPath?: string;
}

export class ExportService {
  private jobs: Map<string, ExportJob> = new Map();
  private userService: UserService;
  private mediaDownloadService: MediaDownloadService;

  constructor() {
    this.userService = new UserService();
    this.mediaDownloadService = new MediaDownloadService();
  }

  async startExport(userId: string, platform: string, format: string, includeMedia: boolean = false): Promise<string> {
    const jobId = uuidv4();
    
    const job: ExportJob = {
      id: jobId,
      userId,
      platform,
      format,
      status: 'pending',
      progress: 0,
      startedAt: new Date(),
      includeMedia
    };

    this.jobs.set(jobId, job);

    this.processExport(jobId).catch(error => {
      console.error(`Export job ${jobId} failed:`, error);
      this.updateJobStatus(jobId, {
        status: 'failed',
        error: error.message,
        completedAt: new Date()
      });
    });

    return jobId;
  }

  private async processExport(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) throw new Error('Job not found');

    this.updateJobStatus(jobId, { 
      status: 'processing',
      currentStep: 'Initializing export...'
    });

    const user = await this.userService.findUserById(job.userId);
    if (!user) throw new Error('User not found');

    if (job.platform === 'youtube') {
      await this.exportYouTubeData(jobId, user.accessToken);
    } else if (job.platform === 'facebook') {
      await this.exportFacebookData(jobId, user.accessToken);
    } else if (job.platform === 'instagram') {
      await this.exportInstagramData(jobId, user.accessToken);
    } else {
      throw new Error(`Platform ${job.platform} not supported`);
    }
  }

  private async exportYouTubeData(jobId: string, accessToken: string): Promise<void> {
    const youtubeService = new YouTubeService(accessToken);
    
    this.updateJobStatus(jobId, {
      currentStep: 'Fetching channel information...',
      progress: 10
    });

    const channelInfo = await youtubeService.getChannelInfo();
    
    this.updateJobStatus(jobId, {
      currentStep: 'Fetching videos...',
      progress: 25
    });

    const videos = await youtubeService.getVideos(1000);
    
    this.updateJobStatus(jobId, {
      currentStep: 'Fetching video statistics...',
      progress: 50,
      totalRecords: videos.length
    });

    const videoIds = videos.map(v => v.id);
    const statistics = await youtubeService.getVideoStatistics(videoIds);
    
    this.updateJobStatus(jobId, {
      currentStep: 'Fetching playlists...',
      progress: 70
    });

    const playlists = await youtubeService.getPlaylists();
    
    this.updateJobStatus(jobId, {
      currentStep: 'Fetching subscriptions...',
      progress: 85
    });

    const subscriptions = await youtubeService.getSubscriptions();

    const job = this.jobs.get(jobId);
    let mediaDownloadPath: string | undefined;

    if (job?.includeMedia) {
      this.updateJobStatus(jobId, {
        currentStep: 'Downloading media files...',
        progress: 90
      });

      const mediaItems = youtubeService.extractMediaItems(videos);
      mediaDownloadPath = path.join(process.cwd(), 'exports', jobId, 'media');
      
      await this.mediaDownloadService.downloadMediaBatch(mediaItems, {
        outputDir: mediaDownloadPath,
        concurrency: 3,
        progressCallback: (progress) => {
          const mediaProgress = 90 + Math.floor((progress.downloaded / progress.total) * 5);
          this.updateJobStatus(jobId, {
            currentStep: `Downloading media: ${progress.downloaded}/${progress.total}`,
            progress: mediaProgress
          });
        }
      });
    }

    this.updateJobStatus(jobId, {
      currentStep: 'Generating export file...',
      progress: 95
    });

    const exportData = {
      channel: channelInfo,
      videos: videos.map((video, index) => ({
        ...video,
        statistics: statistics[index]?.statistics || {}
      })),
      playlists,
      subscriptions,
      exportedAt: new Date().toISOString(),
      mediaDownloaded: !!job?.includeMedia,
      mediaPath: mediaDownloadPath
    };

    const downloadUrl = await this.generateDownloadUrl(jobId, exportData, 'youtube', mediaDownloadPath);

    this.updateJobStatus(jobId, {
      status: 'completed',
      progress: 100,
      currentStep: 'Export completed',
      recordsProcessed: videos.length,
      downloadUrl,
      completedAt: new Date(),
      mediaDownloadPath
    });
  }

  private async exportFacebookData(jobId: string, accessToken: string): Promise<void> {
    const facebookService = new FacebookService(accessToken);
    
    this.updateJobStatus(jobId, {
      currentStep: 'Fetching user information...',
      progress: 10
    });

    const userInfo = await facebookService.getUserInfo();
    
    this.updateJobStatus(jobId, {
      currentStep: 'Fetching user posts...',
      progress: 25
    });

    const posts = await facebookService.getUserPosts(1000);
    
    this.updateJobStatus(jobId, {
      currentStep: 'Fetching pages...',
      progress: 40,
      totalRecords: posts.length
    });

    const pages = await facebookService.getUserPages();
    
    this.updateJobStatus(jobId, {
      currentStep: 'Fetching liked pages...',
      progress: 60
    });

    const likedPages = await facebookService.getLikedPages(500);
    
    this.updateJobStatus(jobId, {
      currentStep: 'Fetching friends...',
      progress: 75
    });

    const friends = await facebookService.getFriends();
    
    this.updateJobStatus(jobId, {
      currentStep: 'Fetching photos...',
      progress: 85
    });

    const photos = await facebookService.getPhotos(500);

    const job = this.jobs.get(jobId);
    let mediaDownloadPath: string | undefined;

    if (job?.includeMedia) {
      this.updateJobStatus(jobId, {
        currentStep: 'Downloading media files...',
        progress: 90
      });

      const mediaItems = facebookService.extractMediaItems(posts, photos);
      mediaDownloadPath = path.join(process.cwd(), 'exports', jobId, 'media');
      
      await this.mediaDownloadService.downloadMediaBatch(mediaItems, {
        outputDir: mediaDownloadPath,
        concurrency: 3,
        progressCallback: (progress) => {
          const mediaProgress = 90 + Math.floor((progress.downloaded / progress.total) * 5);
          this.updateJobStatus(jobId, {
            currentStep: `Downloading media: ${progress.downloaded}/${progress.total}`,
            progress: mediaProgress
          });
        }
      });
    }

    this.updateJobStatus(jobId, {
      currentStep: 'Generating export file...',
      progress: 95
    });

    const exportData = {
      user: userInfo,
      posts,
      pages,
      likedPages,
      friends,
      photos,
      exportedAt: new Date().toISOString(),
      mediaDownloaded: !!job?.includeMedia,
      mediaPath: mediaDownloadPath
    };

    const downloadUrl = await this.generateDownloadUrl(jobId, exportData, 'facebook', mediaDownloadPath);

    this.updateJobStatus(jobId, {
      status: 'completed',
      progress: 100,
      currentStep: 'Export completed',
      recordsProcessed: posts.length + photos.length,
      downloadUrl,
      completedAt: new Date(),
      mediaDownloadPath
    });
  }

  private async exportInstagramData(jobId: string, accessToken: string): Promise<void> {
    const instagramService = new InstagramService(accessToken);
    
    this.updateJobStatus(jobId, {
      currentStep: 'Fetching user information...',
      progress: 10
    });

    const userInfo = await instagramService.getUserInfo();
    
    this.updateJobStatus(jobId, {
      currentStep: 'Fetching media posts...',
      progress: 25
    });

    const media = await instagramService.getUserMedia(1000);
    
    this.updateJobStatus(jobId, {
      currentStep: 'Fetching stories...',
      progress: 45,
      totalRecords: media.length
    });

    const stories = await instagramService.getStories();
    
    this.updateJobStatus(jobId, {
      currentStep: 'Fetching tagged media...',
      progress: 65
    });

    const taggedMedia = await instagramService.getTaggedMedia(500);
    
    this.updateJobStatus(jobId, {
      currentStep: 'Fetching account insights...',
      progress: 80
    });

    const insights = await instagramService.getAccountInsights();

    const job = this.jobs.get(jobId);
    let mediaDownloadPath: string | undefined;

    if (job?.includeMedia) {
      this.updateJobStatus(jobId, {
        currentStep: 'Downloading media files...',
        progress: 90
      });

      const mediaItems = instagramService.extractMediaItems(media, stories);
      mediaDownloadPath = path.join(process.cwd(), 'exports', jobId, 'media');
      
      await this.mediaDownloadService.downloadMediaBatch(mediaItems, {
        outputDir: mediaDownloadPath,
        concurrency: 3,
        progressCallback: (progress) => {
          const mediaProgress = 90 + Math.floor((progress.downloaded / progress.total) * 5);
          this.updateJobStatus(jobId, {
            currentStep: `Downloading media: ${progress.downloaded}/${progress.total}`,
            progress: mediaProgress
          });
        }
      });
    }

    this.updateJobStatus(jobId, {
      currentStep: 'Generating export file...',
      progress: 95
    });

    const exportData = {
      user: userInfo,
      media,
      stories,
      taggedMedia,
      insights,
      exportedAt: new Date().toISOString(),
      mediaDownloaded: !!job?.includeMedia,
      mediaPath: mediaDownloadPath
    };

    const downloadUrl = await this.generateDownloadUrl(jobId, exportData, 'instagram', mediaDownloadPath);

    this.updateJobStatus(jobId, {
      status: 'completed',
      progress: 100,
      currentStep: 'Export completed',
      recordsProcessed: media.length + taggedMedia.length,
      downloadUrl,
      completedAt: new Date(),
      mediaDownloadPath
    });
  }

  private async generateDownloadUrl(jobId: string, data: any, platform: string = 'youtube', mediaPath?: string): Promise<string> {
    const exportDir = path.join(process.cwd(), 'exports', jobId);
    await fs.promises.mkdir(exportDir, { recursive: true });
    
    const jsonFilename = `${platform}-export-${jobId}.json`;
    const jsonPath = path.join(exportDir, jsonFilename);
    
    const content = JSON.stringify(data, null, 2);
    await fs.promises.writeFile(jsonPath, content, 'utf8');
    
    if (mediaPath && fs.existsSync(mediaPath)) {
      const archivePath = path.join(exportDir, `${platform}-export-${jobId}.zip`);
      await this.mediaDownloadService.createArchive(exportDir, archivePath);
      
      return `/api/exports/${jobId}/${path.basename(archivePath)}`;
    }
    
    return `/api/exports/${jobId}/${jsonFilename}`;
  }

  private updateJobStatus(jobId: string, updates: Partial<ExportJob>): void {
    const job = this.jobs.get(jobId);
    if (job) {
      Object.assign(job, updates);
      this.jobs.set(jobId, job);
    }
  }

  getJobStatus(jobId: string): ExportJob | null {
    return this.jobs.get(jobId) || null;
  }

  getUserJobs(userId: string): ExportJob[] {
    return Array.from(this.jobs.values()).filter(job => job.userId === userId);
  }

  cancelJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (job && job.status === 'processing') {
      this.updateJobStatus(jobId, {
        status: 'failed',
        error: 'Cancelled by user',
        completedAt: new Date()
      });
      return true;
    }
    return false;
  }
}