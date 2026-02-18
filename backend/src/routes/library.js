import express from 'express';
import { ObjectId } from 'mongodb';

const router = express.Router();

// Auth middleware
function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Must be logged in' });
  }
  next();
}

router.use(requireAuth);

// GET /api/library - Get user's library
router.get('/', async (req, res) => {
  try {
    const library = req.db.collection('library');
    const { status, sort } = req.query;

    const query = { username: req.session.user.username };
    if (status) {
      query.status = status;
    }

    let sortOption = { dateAdded: -1 };
    if (sort === 'title') sortOption = { gameName: 1 };
    else if (sort === 'progress') sortOption = { progressPercent: -1 };
    else if (sort === 'priority') sortOption = { priority: 1, dateAdded: -1 };

    const games = await library.find(query).sort(sortOption).toArray();
    res.json(games);

  } catch (error) {
    console.error('Get library error:', error);
    res.status(500).json({ error: 'Failed to fetch library' });
  }
});

// GET /api/library/stats - Get library stats
router.get('/stats', async (req, res) => {
  try {
    const library = req.db.collection('library');
    const username = req.session.user.username;

    const stats = await library.aggregate([
      { $match: { username } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]).toArray();

    const total = await library.countDocuments({ username });

    const byStatus = {};
    stats.forEach(s => {
      byStatus[s._id] = s.count;
    });

    res.json({
      total,
      playing: byStatus['Playing'] || 0,
      completed: byStatus['Completed'] || 0,
      onHold: byStatus['On Hold'] || 0,
      dropped: byStatus['Dropped'] || 0,
      wishlist: byStatus['Wishlist'] || 0
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET /api/library/:id - Get single game
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const library = req.db.collection('library');
    const entry = await library.findOne({
      _id: new ObjectId(id),
      username: req.session.user.username
    });

    if (!entry) {
      return res.status(404).json({ error: 'Game not found in library' });
    }

    res.json(entry);

  } catch (error) {
    console.error('Get library entry error:', error);
    res.status(500).json({ error: 'Failed to fetch game' });
  }
});

// POST /api/library - Add game to library
router.post('/', async (req, res) => {
  const { steamId, gameName, headerImage, status, platform, priority, progressPercent } = req.body;

  if (!gameName || gameName.trim().length === 0) {
    return res.status(400).json({ error: 'Game name is required' });
  }

  try {
    const library = req.db.collection('library');

    const existing = await library.findOne({
      username: req.session.user.username,
      gameName: gameName.trim()
    });

    if (existing) {
      return res.status(400).json({ error: 'Game already in your library' });
    }

    const newEntry = {
      username: req.session.user.username,
      steamId: steamId || null,
      gameName: gameName.trim(),
      headerImage: headerImage || null,
      status: status || 'Wishlist',
      platform: platform || 'Steam',
      priority: priority ? parseInt(priority) : null,
      progressPercent: parseInt(progressPercent) || 0,
      dropReason: null,
      dateAdded: new Date(),
      dateLastPlayed: null
    };

    const result = await library.insertOne(newEntry);
    newEntry._id = result.insertedId;

    console.log(`Game added: ${gameName} for user ${req.session.user.username}`);
    res.status(201).json(newEntry);

  } catch (error) {
    console.error('Add to library error:', error);
    res.status(500).json({ error: 'Failed to add game' });
  }
});

// PATCH /api/library/:id - Update game
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { status, platform, priority, progressPercent, dropReason } = req.body;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  try {
    const library = req.db.collection('library');

    const updateFields = {};
    if (status !== undefined) updateFields.status = status;
    if (platform !== undefined) updateFields.platform = platform;
    if (priority !== undefined) updateFields.priority = priority ? parseInt(priority) : null;
    if (progressPercent !== undefined) updateFields.progressPercent = parseInt(progressPercent) || 0;
    if (dropReason !== undefined) updateFields.dropReason = dropReason || null;

    if (status === 'Completed' && progressPercent === undefined) {
      updateFields.progressPercent = 100;
    }

    const result = await library.updateOne(
      { _id: new ObjectId(id), username: req.session.user.username },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Game not found in library' });
    }

    const updated = await library.findOne({ _id: new ObjectId(id) });
    console.log(`Game updated: ${updated.gameName}`);
    res.json(updated);

  } catch (error) {
    console.error('Update library error:', error);
    res.status(500).json({ error: 'Failed to update game' });
  }
});

// DELETE /api/library/:id - Delete game
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  try {
    const library = req.db.collection('library');
    const journal = req.db.collection('journal');

    const game = await library.findOne({
      _id: new ObjectId(id),
      username: req.session.user.username
    });

    if (!game) {
      return res.status(404).json({ error: 'Game not found in library' });
    }

    const journalResult = await journal.deleteMany({ libraryId: new ObjectId(id) });
    await library.deleteOne({ _id: new ObjectId(id) });

    console.log(`Game deleted: ${game.gameName} (${journalResult.deletedCount} journal entries removed)`);
    res.json({
      success: true,
      message: `Deleted ${game.gameName} and ${journalResult.deletedCount} journal entries`
    });

  } catch (error) {
    console.error('Delete library error:', error);
    res.status(500).json({ error: 'Failed to delete game' });
  }
});

export default router;