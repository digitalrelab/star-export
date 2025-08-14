import { Router } from 'express';
import passport from 'passport';

const router = Router();

router.get('/youtube', passport.authenticate('google', {
  scope: [
    'profile',
    'email', 
    'https://www.googleapis.com/auth/youtube.readonly'
  ]
}));

router.get('/youtube/callback', 
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL}/auth/failure`
  }),
  (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?auth=success`);
  }
);

router.get('/facebook', passport.authenticate('facebook', {
  scope: [
    'email',
    'public_profile',
    'pages_show_list',
    'pages_read_engagement',
    'user_posts',
    'user_photos',
    'user_likes',
    'instagram_basic'
  ]
}));

router.get('/facebook/callback', 
  passport.authenticate('facebook', { 
    failureRedirect: `${process.env.FRONTEND_URL}/auth/failure`
  }),
  (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?auth=success`);
  }
);

router.get('/instagram', passport.authenticate('facebook', {
  scope: [
    'email',
    'public_profile',
    'instagram_basic',
    'instagram_content_publish'
  ]
}));

router.get('/instagram/callback', 
  passport.authenticate('facebook', { 
    failureRedirect: `${process.env.FRONTEND_URL}/auth/failure`
  }),
  (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?auth=success&platform=instagram`);
  }
);

router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'Logout failed' });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

router.get('/status', (req, res) => {
  res.json({
    success: true,
    data: {
      authenticated: req.isAuthenticated(),
      user: req.user || null
    }
  });
});

export { router as authRoutes };