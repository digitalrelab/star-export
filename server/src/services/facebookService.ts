import { MediaItem } from './mediaDownloadService';

export interface FacebookPost {
  id: string;
  message?: string;
  story?: string;
  created_time: string;
  type: string;
  likes?: {
    data: any[];
    summary: {
      total_count: number;
    };
  };
  comments?: {
    data: any[];
    summary: {
      total_count: number;
    };
  };
  shares?: {
    count: number;
  };
  attachments?: {
    data: any[];
  };
}

export interface FacebookPage {
  id: string;
  name: string;
  category: string;
  fan_count?: number;
  followers_count?: number;
  link?: string;
  picture?: {
    data: {
      url: string;
    };
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

export class FacebookService {
  private accessToken: string;
  private baseUrl = 'https://graph.facebook.com/v18.0';

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
      throw new Error(`Facebook API Error: ${error.error?.message || 'Unknown error'}`);
    }

    return response.json();
  }

  async getUserInfo() {
    try {
      return await this.makeRequest('/me', {
        fields: 'id,name,email,picture'
      });
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw error;
    }
  }

  async getUserPages(): Promise<FacebookPage[]> {
    try {
      const response = await this.makeRequest('/me/accounts', {
        fields: 'id,name,category,fan_count,followers_count,link,picture'
      });
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching user pages:', error);
      throw error;
    }
  }

  async getUserPosts(limit: number = 50): Promise<FacebookPost[]> {
    try {
      const posts: FacebookPost[] = [];
      let after = undefined;

      while (posts.length < limit) {
        const params: any = {
          fields: 'id,message,story,created_time,type,likes.summary(true),comments.summary(true),shares,attachments',
          limit: Math.min(25, limit - posts.length)
        };

        if (after) {
          params.after = after;
        }

        const response = await this.makeRequest('/me/posts', params);

        if (!response.data || response.data.length === 0) {
          break;
        }

        posts.push(...response.data);

        if (!response.paging?.cursors?.after) {
          break;
        }

        after = response.paging.cursors.after;
      }

      return posts;
    } catch (error) {
      console.error('Error fetching user posts:', error);
      throw error;
    }
  }

  async getPagePosts(pageId: string, limit: number = 50): Promise<FacebookPost[]> {
    try {
      const posts: FacebookPost[] = [];
      let after = undefined;

      while (posts.length < limit) {
        const params: any = {
          fields: 'id,message,story,created_time,type,likes.summary(true),comments.summary(true),shares,attachments',
          limit: Math.min(25, limit - posts.length)
        };

        if (after) {
          params.after = after;
        }

        const response = await this.makeRequest(`/${pageId}/posts`, params);

        if (!response.data || response.data.length === 0) {
          break;
        }

        posts.push(...response.data);

        if (!response.paging?.cursors?.after) {
          break;
        }

        after = response.paging.cursors.after;
      }

      return posts;
    } catch (error) {
      console.error('Error fetching page posts:', error);
      throw error;
    }
  }

  async getLikedPages(limit: number = 50) {
    try {
      const pages = [];
      let after = undefined;

      while (pages.length < limit) {
        const params: any = {
          fields: 'id,name,category,fan_count,link,picture',
          limit: Math.min(25, limit - pages.length)
        };

        if (after) {
          params.after = after;
        }

        const response = await this.makeRequest('/me/likes', params);

        if (!response.data || response.data.length === 0) {
          break;
        }

        pages.push(...response.data);

        if (!response.paging?.cursors?.after) {
          break;
        }

        after = response.paging.cursors.after;
      }

      return pages;
    } catch (error) {
      console.error('Error fetching liked pages:', error);
      throw error;
    }
  }

  async getFriends() {
    try {
      const response = await this.makeRequest('/me/friends', {
        fields: 'id,name,picture'
      });
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching friends:', error);
      throw error;
    }
  }

  async getPhotos(limit: number = 50) {
    try {
      const photos = [];
      let after = undefined;

      while (photos.length < limit) {
        const params: any = {
          fields: 'id,name,source,created_time,likes.summary(true),comments.summary(true)',
          limit: Math.min(25, limit - photos.length)
        };

        if (after) {
          params.after = after;
        }

        const response = await this.makeRequest('/me/photos/uploaded', params);

        if (!response.data || response.data.length === 0) {
          break;
        }

        photos.push(...response.data);

        if (!response.paging?.cursors?.after) {
          break;
        }

        after = response.paging.cursors.after;
      }

      return photos;
    } catch (error) {
      console.error('Error fetching photos:', error);
      throw error;
    }
  }

  extractMediaItems(posts: FacebookPost[], photos: any[]): MediaItem[] {
    const mediaItems: MediaItem[] = [];
    
    for (const post of posts) {
      if (post.attachments?.data) {
        for (const attachment of post.attachments.data) {
          if (attachment.type === 'photo' && attachment.media?.image?.src) {
            mediaItems.push({
              url: attachment.media.image.src,
              type: 'image',
              filename: `post_${post.id}_${attachment.target?.id || 'attachment'}.jpg`,
              metadata: {
                originalId: post.id,
                platform: 'facebook',
                timestamp: post.created_time,
                caption: post.message || post.story || ''
              }
            });
          } else if (attachment.type === 'video_inline' && attachment.media?.source) {
            mediaItems.push({
              url: attachment.media.source,
              type: 'video',
              filename: `post_${post.id}_${attachment.target?.id || 'video'}.mp4`,
              metadata: {
                originalId: post.id,
                platform: 'facebook',
                timestamp: post.created_time,
                caption: post.message || post.story || ''
              }
            });
          }
        }
      }
    }
    
    for (const photo of photos) {
      if (photo.source) {
        mediaItems.push({
          url: photo.source,
          type: 'image',
          filename: `photo_${photo.id}.jpg`,
          metadata: {
            originalId: photo.id,
            platform: 'facebook',
            timestamp: photo.created_time,
            caption: photo.name || ''
          }
        });
      }
    }
    
    return mediaItems;
  }
}