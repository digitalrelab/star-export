interface User {
  id: string;
  googleId?: string;
  facebookId?: string;
  email: string;
  name: string;
  picture?: string;
  accessToken: string;
  refreshToken?: string;
  platform?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateUserData {
  googleId?: string;
  facebookId?: string;
  email: string;
  name: string;
  picture?: string;
  accessToken: string;
  refreshToken?: string;
  platform?: string;
}

export class UserService {
  private users: Map<string, User> = new Map();
  private usersByGoogleId: Map<string, User> = new Map();
  private usersByFacebookId: Map<string, User> = new Map();

  async findOrCreateUser(userData: CreateUserData): Promise<User> {
    let user: User | undefined;
    
    if (userData.googleId) {
      user = this.usersByGoogleId.get(userData.googleId);
    } else if (userData.facebookId) {
      user = this.usersByFacebookId.get(userData.facebookId);
    }
    
    if (user) {
      user.accessToken = userData.accessToken;
      if (userData.refreshToken) {
        user.refreshToken = userData.refreshToken;
      }
      user.updatedAt = new Date();
      this.users.set(user.id, user);
      
      if (user.googleId) {
        this.usersByGoogleId.set(user.googleId, user);
      }
      if (user.facebookId) {
        this.usersByFacebookId.set(user.facebookId, user);
      }
      
      return user;
    }

    user = {
      id: this.generateId(),
      googleId: userData.googleId,
      facebookId: userData.facebookId,
      email: userData.email,
      name: userData.name,
      picture: userData.picture,
      accessToken: userData.accessToken,
      refreshToken: userData.refreshToken,
      platform: userData.platform,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.users.set(user.id, user);
    
    if (user.googleId) {
      this.usersByGoogleId.set(user.googleId, user);
    }
    if (user.facebookId) {
      this.usersByFacebookId.set(user.facebookId, user);
    }
    
    return user;
  }

  async findUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findUserByGoogleId(googleId: string): Promise<User | null> {
    return this.usersByGoogleId.get(googleId) || null;
  }

  async findUserByFacebookId(facebookId: string): Promise<User | null> {
    return this.usersByFacebookId.get(facebookId) || null;
  }

  async updateUserTokens(userId: string, accessToken: string, refreshToken?: string): Promise<User | null> {
    const user = this.users.get(userId);
    if (!user) return null;

    user.accessToken = accessToken;
    if (refreshToken) {
      user.refreshToken = refreshToken;
    }
    user.updatedAt = new Date();
    
    this.users.set(userId, user);
    if (user.googleId) {
      this.usersByGoogleId.set(user.googleId, user);
    }
    if (user.facebookId) {
      this.usersByFacebookId.set(user.facebookId, user);
    }
    
    return user;
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}