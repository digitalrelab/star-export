import React from 'react';
import { 
  GitHubLogo, 
  TwitterLogo, 
  RedditLogo, 
  YouTubeLogo, 
  FacebookLogo, 
  InstagramLogo 
} from '../components/PlatformLogos';

export interface PlatformConfig {
  name: string;
  displayName: string;
  icon: string | React.ComponentType<any>;
  baseUrl: string;
  authType: 'oauth' | 'token' | 'cookie';
  exportFormats: string[];
  rateLimit: {
    requests: number;
    window: number; // in milliseconds
  };
  contentTypes: {
    supportsMedia: boolean;
    videoFormats?: string[];
    imageFormats?: string[];
    maxFileSize?: number; // in MB
  };
}

export const platforms: Record<string, PlatformConfig> = {
  github: {
    name: 'github',
    displayName: 'GitHub',
    icon: GitHubLogo,
    baseUrl: 'https://api.github.com',
    authType: 'token',
    exportFormats: ['json', 'csv'],
    rateLimit: {
      requests: 5000,
      window: 3600000, // 1 hour
    },
    contentTypes: {
      supportsMedia: false
    },
  },
  twitter: {
    name: 'twitter',
    displayName: 'Twitter/X',
    icon: TwitterLogo,
    baseUrl: 'https://api.twitter.com/2',
    authType: 'oauth',
    exportFormats: ['json', 'csv'],
    rateLimit: {
      requests: 300,
      window: 900000, // 15 minutes
    },
    contentTypes: {
      supportsMedia: true,
      videoFormats: ['mp4', 'mov'],
      imageFormats: ['jpg', 'jpeg', 'png', 'gif'],
      maxFileSize: 512
    },
  },
  reddit: {
    name: 'reddit',
    displayName: 'Reddit',
    icon: RedditLogo,
    baseUrl: 'https://oauth.reddit.com',
    authType: 'oauth',
    exportFormats: ['json', 'csv'],
    rateLimit: {
      requests: 100,
      window: 60000, // 1 minute
    },
    contentTypes: {
      supportsMedia: true,
      videoFormats: ['mp4', 'gif'],
      imageFormats: ['jpg', 'jpeg', 'png', 'gif'],
      maxFileSize: 100
    },
  },
  youtube: {
    name: 'youtube',
    displayName: 'YouTube',
    icon: YouTubeLogo,
    baseUrl: 'https://www.googleapis.com/youtube/v3',
    authType: 'oauth',
    exportFormats: ['json', 'csv'],
    rateLimit: {
      requests: 10000,
      window: 86400000, // 24 hours
    },
    contentTypes: {
      supportsMedia: true,
      videoFormats: ['mp4', 'webm'],
      imageFormats: ['jpg', 'jpeg', 'png'],
      maxFileSize: 2048
    },
  },
  facebook: {
    name: 'facebook',
    displayName: 'Facebook',
    icon: FacebookLogo,
    baseUrl: 'https://graph.facebook.com/v18.0',
    authType: 'oauth',
    exportFormats: ['json', 'csv'],
    rateLimit: {
      requests: 200,
      window: 3600000, // 1 hour
    },
    contentTypes: {
      supportsMedia: true,
      videoFormats: ['mp4', 'mov'],
      imageFormats: ['jpg', 'jpeg', 'png', 'gif'],
      maxFileSize: 1024
    },
  },
  instagram: {
    name: 'instagram',
    displayName: 'Instagram',
    icon: InstagramLogo,
    baseUrl: 'https://graph.instagram.com/v18.0',
    authType: 'oauth',
    exportFormats: ['json', 'csv'],
    rateLimit: {
      requests: 200,
      window: 3600000, // 1 hour
    },
    contentTypes: {
      supportsMedia: true,
      videoFormats: ['mp4', 'mov'],
      imageFormats: ['jpg', 'jpeg', 'png'],
      maxFileSize: 1024
    },
  },
};

export const getSupportedPlatforms = (): PlatformConfig[] => {
  return Object.values(platforms);
};

export const getPlatformConfig = (platformName: string): PlatformConfig | undefined => {
  return platforms[platformName];
};