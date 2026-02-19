import express from 'express';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username } = req.body;

  if (!username || username.trim().length < 2) {
    return res.status(400).json({ error: 'Username must be at least 2 characters' });
  }

  const cleanUsername = username.trim().toLowerCase();

  if (!/^[a-z0-9_]+$/.test(cleanUsername)) {
    return res.status(400).json({ error: 'Username can only contain letters, numbers, and underscores' });
  }

  try {
    const users = req.db.collection('users');

    let user = await users.findOne({ username: cleanUsername });

    if (!user) {
      const result = await users.insertOne({
        username: cleanUsername,
        createdAt: new Date()
      });
      user = {
        _id: result.insertedId,
        username: cleanUsername
      };
      console.log(`New user created: ${cleanUsername}`);
    }

    req.session.user = {
      id: user._id.toString(),
      username: user.username
    };

    res.json({
      success: true,
      user: req.session.user
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true });
  });
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ error: 'Not logged in' });
  }
});

export default router;