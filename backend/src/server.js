import "dotenv/config";
import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./db/connection.js";
import authRoutes from "./routes/auth.js";
import libraryRoutes from "./routes/library.js";
import journalRoutes from "./routes/journal.js";
import gameRoutes from "./routes/gameRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE
// ============================================

app.use(express.json());

// Sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET || "levelup-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }),
);

// ============================================
// FRONTEND ROUTES (before static so they take priority)
// ============================================

// Adjust frontend path to point to the correct location of the frontend directory
const FRONTEND_DIR = path.join(__dirname, "..", "..", "frontend");

// Root route serves login page
app.get("/", (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, "html", "login.html"));
});

app.use(express.static(FRONTEND_DIR));

// ============================================
// START SERVER
// ============================================

async function startServer() {
  try {
    const db = await connectDB();

    app.use((req, res, next) => {
      req.db = db;
      next();
    });

    app.use("/api/auth", authRoutes);
    app.use("/api/library", libraryRoutes);
    app.use("/api/journal", journalRoutes);

  //  Fix
app.use("/api/games", gameRoutes);
app.use("/api/reviews", reviewRoutes);
// Removed the duplicate /games mount

    app.listen(PORT, () => {
      console.log(`
LevelUp Server Running!
http://localhost:${PORT}
      `);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
