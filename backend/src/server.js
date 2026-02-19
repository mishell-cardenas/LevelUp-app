import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './db/connection.js';
import authRoutes from './routes/auth.js';
import libraryRoutes from './routes/library.js';
import journalRoutes from './routes/journal.js';
import gameRoutes from './routes/gameRoutes.js';
import syncRoutes from "./routes/syncRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE
// ============================================

// Parse JSON
app.use(express.json());

// Sessions
app.use(session({
  secret: process.env.SESSION_SECRET || 'levelup-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
}));

// ============================================
// FRONTEND ROUTES (before static so they take priority)
// ============================================

// Root route - serve login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'frontend', 'html', 'login.html'));
});

// ============================================
// STATIC FILES
// ============================================

// Serve frontend (css/, js/, html/ all live under frontend/)
app.use(express.static(path.join(__dirname, '..', '..', 'frontend')));

// ============================================
// DATABASE
// ============================================

let db;

app.use((req, res, next) => {
  req.db = db;
  next();
});

// ============================================
// API ROUTES
// ============================================

app.use('/api/auth', authRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/games', gameRoutes);

// ============================================
// START SERVER
// ============================================

async function startServer() {
  try {
    db = await connectDB();

    app.listen(PORT, () => {
      console.log(`
LevelUp Server Running!
http://localhost:${PORT}
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
