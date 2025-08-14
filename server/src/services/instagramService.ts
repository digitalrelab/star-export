import { MediaItem } from './mediaDownloadService';

export interface InstagramMedia {
  id: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  permalink: string;
  caption?: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
  thumbnail_url?: string;
  children?: {
    data: InstagramMedia[];
  };
}

export interface InstagramUser {
  id: string;
  username: string;
  account_type: 'BUSINESS' | 'MEDIA_CREATOR' | 'PERSONAL';
  media_count?: number;
  followers_count?: number;
  follows_count?: number;
}

export interface InstagramStory {
  id: string;
  media_type: 'IMAGE' | 'VIDEO';
  media_url: string;
  timestamp: string;
  permalink?: string;
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

export class InstagramService {
  private accessToken: string;
  private baseUrl = 'https://graph.instagram.com';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async makeRequest(endpoint: string, params: Record<string, any> = {}): Promise<any> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    url.searchParams.append('access_token', this.accessToken);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value.toString());
      }
    });

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const error = await response.json() as any;
      throw new Error(`Instagram API Error: ${error.error?.message || 'Unknown error'}`);
    }

    return response.json();
  }

  async getUserInfo(): Promise<InstagramUser> {
    try {
      return await this.makeRequest('/me', {
        fields: 'id,username,account_type,media_count,followers_count,follows_count'
      }) as InstagramUser;
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw error;
    }
  }

  async getUserMedia(limit: number = 50): Promise<InstagramMedia[]> {
    try {
      const media: InstagramMedia[] = [];
      let after = undefined;

      while (media.length < limit) {
        const params: any = {
          fields: 'id,media_type,media_url,permalink,caption,timestamp,like_count,comments_count,thumbnail_url,children{id,media_type,media_url,thumbnail_url}',
          limit: Math.min(25, limit - media.length)
        };

        if (after) {
          params.after = after;
        }

        const response = await this.makeRequest('/me/media', params);

        if (!response.data || response.data.length === 0) {
          break;
        }

        media.push(...response.data);

        if (!response.paging?.cursors?.after) {
          break;
        }

        after = response.paging.cursors.after;
      }

      return media;
    } catch (error) {
      console.error('Error fetching user media:', error);
      throw error;
    }
  }

  async getMediaInsights(mediaId: string) {
    try {
      return await this.makeRequest(`/${mediaId}/insights`, {
        metric: 'impressions,reach,likes,comments,saves,shares'
      });
    } catch (error) {
      console.error('Error fetching media insights:', error);
      throw error;
    }
  }

  async getStories(): Promise<InstagramStory[]> {
    try {
      const response = await this.makeRequest('/me/stories', {
        fields: 'id,media_type,media_url,timestamp,permalink'
      });
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching stories:', error);
      throw error;
    }
  }

  async getTaggedMedia(limit: number = 50): Promise<InstagramMedia[]> {
    try {
      const media: InstagramMedia[] = [];
      let after = undefined;

      while (media.length < limit) {
        const params: any = {
          fields: 'id,media_type,media_url,permalink,caption,timestamp,like_count,comments_count,thumbnail_url',
          limit: Math.min(25, limit - media.length)
        };

        if (after) {
          params.after = after;
        }

        const response = await this.makeRequest('/me/tags', params);

        if (!response.data || response.data.length === 0) {
          break;
        }

        media.push(...response.data);

        if (!response.paging?.cursors?.after) {
          break;
        }

        after = response.paging.cursors.after;
      }

      return media;
    } catch (error) {
      console.error('Error fetching tagged media:', error);
      throw error;
    }
  }

  async getRecentlySearched() {
    try {
      const response = await this.makeRequest('/me/recently_searched_hashtags', {
        fields: 'id,name'
      });
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching recently searched hashtags:', error);
      throw error;
    }
  }

  async getAccountInsights(period: 'day' | 'week' | 'days_28' = 'day') {
    try {
      return await this.makeRequest('/me/insights', {
        metric: 'impressions,reach,profile_views,website_clicks',
        period
      });
    } catch (error) {
      console.error('Error fetching account insights:', error);
      throw error;
    }
  }

  async getHashtagSearch(hashtag: string) {
    try {
      return await this.makeRequest('/ig_hashtag_search', {
        q: hashtag,
        fields: 'id,name'
      });
    } catch (error) {
      console.error('Error searching hashtags:', error);
      throw error;
    }
  }

  async getMediaComments(mediaId: string, limit: number = 50) {
    try {
      const comments = [];
      let after = undefined;

      while (comments.length < limit) {
        const params: any = {
          fields: 'id,text,timestamp,username,like_count',
          limit: Math.min(25, limit - comments.length)
        };

        if (after) {
          params.after = after;
        }

        const response = await this.makeRequest(`/${mediaId}/comments`, params);

        if (!response.data || response.data.length === 0) {
          break;
        }

        comments.push(...response.data);

        if (!response.paging?.cursors?.after) {
          break;
        }

        after = response.paging.cursors.after;
      }

      return comments;
    } catch (error) {
      console.error('Error fetching media comments:', error);
      throw error;
    }
  }

  extractMediaItems(media: InstagramMedia[], stories: InstagramStory[] = []): MediaItem[] {
    const mediaItems: MediaItem[] = [];
    
    const processMedia = (item: InstagramMedia, source: 'media' | 'story' = 'media') => {
      const extension = item.media_type === 'VIDEO' ? 'mp4' : 'jpg';
      const prefix = source === 'story' ? 'story_' : '';
      
      if (item.media_url) {
        mediaItems.push({
          url: item.media_url,
          type: item.media_type === 'VIDEO' ? 'video' : 'image',
          filename: `${prefix}${item.id}.${extension}`,
          metadata: {
            originalId: item.id,
            platform: 'instagram',
            timestamp: item.timestamp,
            caption: item.caption || ''
          }
        });
      }
      
      if (item.thumbnail_url && item.media_type === 'VIDEO') {
        mediaItems.push({
          url: item.thumbnail_url,
          type: 'image',
          filename: `${prefix}${item.id}_thumbnail.jpg`,
          metadata: {
            originalId: item.id,
            platform: 'instagram',
            timestamp: item.timestamp,
            caption: item.caption || ''
          }
        });
      }
      
      if (item.children?.data) {
        for (const child of item.children.data) {
          processMedia(child, source);
        }
      }
    };
    
    for (const item of media) {
      processMedia(item);
    }
    
    for (const story of stories) {
      processMedia(story as any, 'story');
    }
    
    return mediaItems;
  }
}