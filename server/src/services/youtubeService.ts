import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { MediaItem } from './mediaDownloadService';

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnails: {
    default: { url: string };
    medium: { url: string };
    high: { url: string };
  };
  statistics?: {
    viewCount: string;
    likeCount: string;
    commentCount: string;
  };
}

export interface ExportProgress {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  currentStep?: string;
  recordsProcessed?: number;
  totalRecords?: number;
  estimatedTimeRemaining?: number;
  downloadUrl?: string;
}

export class YouTubeService {
  private oauth2Client: OAuth2Client;
  private youtube: any;

  constructor(accessToken: string) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    
    this.oauth2Client.setCredentials({
      access_token: accessToken
    });

    this.youtube = google.youtube({
      version: 'v3',
      auth: this.oauth2Client
    });
  }

  async getChannelInfo() {
    try {
      // Return mock data if using test access token
      if (this.oauth2Client.credentials.access_token === 'test-access-token') {
        return {
          id: 'test-channel-123',
          snippet: {
            title: 'Test YouTube Channel',
            description: 'This is a test channel for media export functionality',
            customUrl: '@testchannel',
            publishedAt: '2020-01-01T00:00:00Z',
            thumbnails: {
              default: { url: 'https://picsum.photos/88/88' },
              medium: { url: 'https://picsum.photos/240/240' },
              high: { url: 'https://picsum.photos/800/800' }
            }
          },
          statistics: {
            viewCount: '12345',
            subscriberCount: '567',
            videoCount: '89'
          }
        };
      }

      const response = await this.youtube.channels.list({
        part: ['snippet', 'statistics'],
        mine: true
      });

      return response.data.items[0];
    } catch (error) {
      console.error('Error fetching channel info:', error);
      throw error;
    }
  }

  async getVideos(maxResults: number = 50): Promise<YouTubeVideo[]> {
    try {
      // Return mock data if using test access token
      if (this.oauth2Client.credentials.access_token === 'test-access-token') {
        const mockVideos: YouTubeVideo[] = [];
        const videoCount = Math.min(5, maxResults); // Generate 5 test videos
        
        for (let i = 1; i <= videoCount; i++) {
          mockVideos.push({
            id: `test-video-${i}`,
            title: `Test Video ${i} - Media Export Demo`,
            description: `This is a test video for demonstrating the media export functionality. Video ${i} of ${videoCount}.`,
            publishedAt: new Date(Date.now() - i * 86400000).toISOString(), // i days ago
            thumbnails: {
              default: { url: `https://picsum.photos/120/90?random=${i}` },
              medium: { url: `https://picsum.photos/320/180?random=${i}` },
              high: { url: `https://picsum.photos/480/360?random=${i}` }
            }
          });
        }
        
        return mockVideos;
      }

      const videos: YouTubeVideo[] = [];
      let nextPageToken = undefined;

      while (videos.length < maxResults) {
        const response: any = await this.youtube.search.list({
          part: ['snippet'],
          forMine: true,
          type: 'video',
          maxResults: Math.min(50, maxResults - videos.length),
          pageToken: nextPageToken
        });

        if (!response.data.items || response.data.items.length === 0) {
          break;
        }

        for (const item of response.data.items) {
          videos.push({
            id: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            publishedAt: item.snippet.publishedAt,
            thumbnails: item.snippet.thumbnails
          });
        }

        nextPageToken = response.data.nextPageToken;
        if (!nextPageToken) break;
      }

      return videos;
    } catch (error) {
      console.error('Error fetching videos:', error);
      throw error;
    }
  }

  async getVideoStatistics(videoIds: string[]) {
    try {
      // Return mock data if using test access token
      if (this.oauth2Client.credentials.access_token === 'test-access-token') {
        return videoIds.map((id, index) => ({
          id,
          statistics: {
            viewCount: String(Math.floor(Math.random() * 10000) + 100),
            likeCount: String(Math.floor(Math.random() * 500) + 10),
            commentCount: String(Math.floor(Math.random() * 50) + 1)
          }
        }));
      }

      const response = await this.youtube.videos.list({
        part: ['statistics'],
        id: videoIds.join(',')
      });

      return response.data.items;
    } catch (error) {
      console.error('Error fetching video statistics:', error);
      throw error;
    }
  }

  async getPlaylists() {
    try {
      // Return mock data if using test access token
      if (this.oauth2Client.credentials.access_token === 'test-access-token') {
        return [
          {
            id: 'test-playlist-1',
            snippet: {
              title: 'My Favorite Videos',
              description: 'A collection of my favorite content',
              publishedAt: '2023-01-01T00:00:00Z'
            },
            contentDetails: {
              itemCount: 15
            }
          }
        ];
      }

      const response = await this.youtube.playlists.list({
        part: ['snippet', 'contentDetails'],
        mine: true,
        maxResults: 50
      });

      return response.data.items || [];
    } catch (error) {
      console.error('Error fetching playlists:', error);
      throw error;
    }
  }

  async getSubscriptions() {
    try {
      // Return mock data if using test access token
      if (this.oauth2Client.credentials.access_token === 'test-access-token') {
        return [
          {
            id: 'test-sub-1',
            snippet: {
              title: 'Tech Channel',
              description: 'Technology reviews and tutorials',
              resourceId: {
                channelId: 'UC_test_channel_1'
              }
            }
          },
          {
            id: 'test-sub-2',
            snippet: {
              title: 'Educational Content',
              description: 'Learning and development videos',
              resourceId: {
                channelId: 'UC_test_channel_2'
              }
            }
          }
        ];
      }

      const subscriptions = [];
      let nextPageToken = undefined;

      do {
        const response: any = await this.youtube.subscriptions.list({
          part: ['snippet'],
          mine: true,
          maxResults: 50,
          pageToken: nextPageToken
        });

        if (response.data.items) {
          subscriptions.push(...response.data.items);
        }

        nextPageToken = response.data.nextPageToken;
      } while (nextPageToken);

      return subscriptions;
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      throw error;
    }
  }

  extractMediaItems(videos: YouTubeVideo[]): MediaItem[] {
    const mediaItems: MediaItem[] = [];
    
    for (const video of videos) {
      if (video.thumbnails?.high?.url) {
        mediaItems.push({
          url: video.thumbnails.high.url,
          type: 'image',
          filename: `${video.id}_thumbnail.jpg`,
          metadata: {
            originalId: video.id,
            platform: 'youtube',
            timestamp: video.publishedAt,
            caption: video.title
          }
        });
      }
      
      if (video.thumbnails?.medium?.url && video.thumbnails.medium.url !== video.thumbnails.high?.url) {
        mediaItems.push({
          url: video.thumbnails.medium.url,
          type: 'image',
          filename: `${video.id}_thumbnail_medium.jpg`,
          metadata: {
            originalId: video.id,
            platform: 'youtube',
            timestamp: video.publishedAt,
            caption: video.title
          }
        });
      }
    }
    
    return mediaItems;
  }
}