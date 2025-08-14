import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';

export interface MediaItem {
  url: string;
  type: 'image' | 'video';
  filename: string;
  metadata?: {
    originalId: string;
    platform: string;
    timestamp?: string;
    caption?: string;
    dimensions?: {
      width: number;
      height: number;
    };
  };
}

export interface DownloadProgress {
  total: number;
  downloaded: number;
  current?: string;
  failed?: string[];
}

export interface DownloadOptions {
  outputDir: string;
  concurrency?: number;
  maxRetries?: number;
  progressCallback?: (progress: DownloadProgress) => void;
}

export class MediaDownloadService {
  private activeDownloads = new Set<string>();
  private downloadStats = {
    total: 0,
    downloaded: 0,
    failed: [] as string[]
  };

  async downloadMediaBatch(mediaItems: MediaItem[], options: DownloadOptions): Promise<void> {
    const { outputDir, concurrency = 5, maxRetries = 3, progressCallback } = options;
    
    await this.ensureDirectoryExists(outputDir);
    
    this.downloadStats = {
      total: mediaItems.length,
      downloaded: 0,
      failed: []
    };

    const downloadPromises: Promise<void>[] = [];
    const semaphore = new Array(concurrency).fill(null);
    
    for (const mediaItem of mediaItems) {
      const downloadPromise = this.acquireSemaphore(semaphore).then(async () => {
        try {
          await this.downloadSingleMedia(mediaItem, outputDir, maxRetries);
          this.downloadStats.downloaded++;
        } catch (error) {
          console.error(`Failed to download ${mediaItem.url}:`, error);
          this.downloadStats.failed.push(mediaItem.url);
        }
        
        if (progressCallback) {
          progressCallback({
            total: this.downloadStats.total,
            downloaded: this.downloadStats.downloaded,
            current: mediaItem.filename,
            failed: this.downloadStats.failed
          });
        }
      });
      
      downloadPromises.push(downloadPromise);
    }

    await Promise.all(downloadPromises);
  }

  private async acquireSemaphore(semaphore: any[]): Promise<void> {
    return new Promise((resolve) => {
      const tryAcquire = () => {
        const index = semaphore.findIndex(slot => slot === null);
        if (index !== -1) {
          semaphore[index] = true;
          resolve();
          return;
        }
        setTimeout(tryAcquire, 10);
      };
      tryAcquire();
    });
  }

  private async downloadSingleMedia(mediaItem: MediaItem, outputDir: string, maxRetries: number): Promise<void> {
    const { url, filename, type, metadata } = mediaItem;
    
    if (this.activeDownloads.has(url)) {
      return;
    }
    
    this.activeDownloads.add(url);
    
    try {
      const sanitizedFilename = this.sanitizeFilename(filename);
      const typeDir = path.join(outputDir, type === 'image' ? 'images' : 'videos');
      const platformDir = metadata?.platform ? path.join(typeDir, metadata.platform) : typeDir;
      
      await this.ensureDirectoryExists(platformDir);
      
      const filePath = path.join(platformDir, sanitizedFilename);
      
      if (fs.existsSync(filePath)) {
        console.log(`File already exists: ${sanitizedFilename}`);
        return;
      }

      let lastError: Error | null = null;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          await this.downloadFile(url, filePath);
          
          if (metadata) {
            await this.saveMetadata(filePath, metadata);
          }
          
          return;
        } catch (error) {
          lastError = error as Error;
          console.warn(`Attempt ${attempt}/${maxRetries} failed for ${url}: ${error}`);
          
          if (attempt < maxRetries) {
            await this.delay(1000 * attempt);
          }
        }
      }
      
      throw lastError || new Error('Download failed after all retries');
    } finally {
      this.activeDownloads.delete(url);
    }
  }

  private async downloadFile(url: string, filePath: string): Promise<void> {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; StarExport/1.0)'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    if (!response.body) {
      throw new Error('No response body');
    }
    
    const stream = Readable.fromWeb(response.body as any);
    const writeStream = fs.createWriteStream(filePath);
    
    await pipeline(stream, writeStream);
  }

  private async saveMetadata(filePath: string, metadata: any): Promise<void> {
    const metadataPath = filePath + '.meta.json';
    const metadataContent = JSON.stringify({
      ...metadata,
      downloadedAt: new Date().toISOString(),
      originalFilePath: filePath
    }, null, 2);
    
    await fs.promises.writeFile(metadataPath, metadataContent, 'utf8');
  }

  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[<>:"/\\|?*]/g, '_')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_')
      .substring(0, 255);
  }

  private async ensureDirectoryExists(dir: string): Promise<void> {
    try {
      await fs.promises.access(dir);
    } catch {
      await fs.promises.mkdir(dir, { recursive: true });
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getDownloadStats() {
    return { ...this.downloadStats };
  }

  generateMediaFilename(originalUrl: string, mediaId: string, type: 'image' | 'video', timestamp?: string): string {
    const urlObj = new URL(originalUrl);
    const extension = this.getFileExtension(urlObj.pathname) || (type === 'image' ? 'jpg' : 'mp4');
    const datePrefix = timestamp ? new Date(timestamp).toISOString().split('T')[0] : 'unknown';
    
    return `${datePrefix}_${mediaId}.${extension}`;
  }

  private getFileExtension(urlPath: string): string | null {
    const match = urlPath.match(/\.([a-zA-Z0-9]+)$/);
    return match ? match[1].toLowerCase() : null;
  }

  async createArchive(sourceDir: string, archivePath: string): Promise<void> {
    const archiver = require('archiver');
    
    const output = fs.createWriteStream(archivePath);
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });
    
    return new Promise((resolve, reject) => {
      output.on('close', () => {
        console.log(`Archive created: ${archive.pointer()} bytes`);
        resolve();
      });
      
      archive.on('error', reject);
      archive.pipe(output);
      archive.directory(sourceDir, false);
      archive.finalize();
    });
  }
}