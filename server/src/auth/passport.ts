import dotenv from 'dotenv';
dotenv.config();

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { UserService } from '../services/userService';

const userService = new UserService();

// Only configure OAuth strategies if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/youtube/callback',
    scope: [
      'profile',
      'email',
      'https://www.googleapis.com/auth/youtube.readonly'
    ]
  }, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
  try {
    const user = await userService.findOrCreateUser({
      googleId: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName,
      picture: profile.photos[0].value,
      accessToken,
      refreshToken
    });

    return done(null, user);
  } catch (error) {
    console.error('Auth error:', error);
    return done(error, null);
  }
  }));
}

if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: '/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'email', 'picture'],
    scope: [
      'email',
      'public_profile',
      'pages_show_list',
      'pages_read_engagement',
      'user_posts',
      'user_photos',
      'user_likes',
      'instagram_basic',
      'instagram_content_publish'
    ]
  }, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
  try {
    const user = await userService.findOrCreateUser({
      facebookId: profile.id,
      email: profile.emails?.[0]?.value,
      name: profile.displayName,
      picture: profile.photos?.[0]?.value,
      accessToken,
      refreshToken,
      platform: 'facebook'
    });

    return done(null, user);
  } catch (error) {
    console.error('Facebook auth error:', error);
    return done(error, null);
  }
  }));
}

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await userService.findUserById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});