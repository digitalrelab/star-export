import { useCallback, useEffect, useState } from 'react';
import { useStore } from '../store';
import { apiService, ApiError } from '../services/api';
import { PlatformConfig } from '../config/platforms';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface UseAuthReturn {
  // State
  authState: AuthState;
  
  // Platform-specific auth state
  isPlatformAuthenticated: (platform: string) => boolean;
  
  // Actions
  authenticate: (platform: string, authData: { code?: string; token?: string }) => Promise<boolean>;
  disconnect: (platform: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  
  // OAuth helpers
  getOAuthUrl: (platform: PlatformConfig) => string;
  handleOAuthCallback: (platform: string, code: string) => Promise<boolean>;
}

export const useAuth = (): UseAuthReturn => {
  const { 
    tokens, 
    isAuthenticated, 
    setToken, 
    removeToken, 
    clearAll,
    addNotification 
  } = useStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear error when component unmounts or auth state changes
  useEffect(() => {
    const handleAuthError = () => {
      // Handle unauthorized events from API
      setError('Authentication expired. Please sign in again.');
      clearAll();
    };

    window.addEventListener('auth:unauthorized', handleAuthError);
    return () => window.removeEventListener('auth:unauthorized', handleAuthError);
  }, [clearAll]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const isPlatformAuthenticated = useCallback((platform: string): boolean => {
    return isAuthenticated(platform);
  }, [isAuthenticated]);

  const authenticate = useCallback(async (
    platform: string, 
    authData: { code?: string; token?: string }
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.authenticate(platform, {
        platform,
        ...authData
      });

      if (response.success && response.data?.token) {
        setToken(platform, response.data.token);
        addNotification({
          type: 'success',
          message: `Successfully connected to ${platform}`
        });
        return true;
      } else {
        throw new Error(response.error || 'Authentication failed');
      }
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Authentication failed. Please try again.';
      
      setError(errorMessage);
      addNotification({
        type: 'error',
        message: errorMessage
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [setToken, addNotification]);

  const disconnect = useCallback(async (platform: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Remove token from store immediately for better UX
      removeToken(platform);
      
      // Optionally call API to revoke token on server
      // This is not critical, so we don't block on it
      apiService.post(`/auth/${platform}/disconnect`).catch(err => {
        console.warn(`Failed to revoke ${platform} token on server:`, err);
      });

      addNotification({
        type: 'success',
        message: `Disconnected from ${platform}`
      });
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Failed to disconnect. Please try again.';
      
      setError(errorMessage);
      addNotification({
        type: 'error',
        message: errorMessage
      });
      
      // Re-add token if disconnect failed
      // Note: This assumes the token is still valid
      // In a real app, you might want to verify this
    } finally {
      setIsLoading(false);
    }
  }, [removeToken, addNotification]);

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await apiService.logout();
      clearAll();
      addNotification({
        type: 'success',
        message: 'Successfully logged out'
      });
    } catch (err) {
      // Even if API call fails, clear local tokens
      clearAll();
      console.warn('Logout API call failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [clearAll, addNotification]);

  const getOAuthUrl = useCallback((platform: PlatformConfig): string => {
    const baseUrl = window.location.origin;
    const redirectUri = `${baseUrl}/auth/${platform.name}`;
    
    // This would typically be configured per platform
    // For now, return a placeholder URL
    const clientId = import.meta.env[`VITE_${platform.name.toUpperCase()}_CLIENT_ID`];
    
    switch (platform.name) {
      case 'github':
        return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email,repo`;
      
      case 'twitter':
        return `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=tweet.read%20users.read&state=${platform.name}`;
      
      case 'reddit':
        return `https://www.reddit.com/api/v1/authorize?client_id=${clientId}&response_type=code&state=${platform.name}&redirect_uri=${redirectUri}&duration=permanent&scope=identity%20history%20read`;
      
      case 'youtube':
        return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=https://www.googleapis.com/auth/youtube.readonly&access_type=offline&state=${platform.name}`;
      
      default:
        return `${baseUrl}/auth/${platform.name}`;
    }
  }, []);

  const handleOAuthCallback = useCallback(async (platform: string, code: string): Promise<boolean> => {
    return authenticate(platform, { code });
  }, [authenticate]);

  const authState: AuthState = {
    isAuthenticated: Object.keys(tokens).length > 0,
    isLoading,
    error
  };

  return {
    authState,
    isPlatformAuthenticated,
    authenticate,
    disconnect,
    logout,
    clearError,
    getOAuthUrl,
    handleOAuthCallback
  };
};

export default useAuth;