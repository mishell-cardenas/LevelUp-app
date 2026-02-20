import express from "express";
import { ObjectId } from "mongodb";

const router = express.Router();

// Auth middleware
function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: "Must be logged in" });
  }
  next();
}

router.use(requireAuth);

// GET /api/journal/game/:libraryId - Get entries for a game
router.get("/game/:libraryId", async (req, res) => {
  const { libraryId } = req.params;

  if (!ObjectId.isValid(libraryId)) {
    return res.status(400).json({ error: "Invalid library ID" });
  }

  try {
    const library = req.db.collection("library");
    const journal = req.db.collection("journal");

    const libraryEntry = await library.findOne({
      _id: new ObjectId(libraryId),
      username: req.session.user.username,
    });

    if (!libraryEntry) {
      return res.status(404).json({ error: "Game not found in library" });
    }

    const entries = await journal
      .find({ libraryId: new ObjectId(libraryId) })
      .sort({ createdAt: -1 })
      .toArray();

    const totalHours = entries.reduce(
      (sum, entry) => sum + (entry.hoursPlayed || 0),
      0,
    );

    res.json({
      game: libraryEntry,
      entries,
      totalHours,
      sessionCount: entries.length,
    });
  } catch (error) {
    console.error("Get journal error:", error);
    res.status(500).json({ error: "Failed to fetch journal" });
  }
});

// GET /api/journal/:id - Get single entry
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  try {
    const journal = req.db.collection("journal");
    const library = req.db.collection("library");

    const entry = await journal.findOne({ _id: new ObjectId(id) });

    if (!entry) {
      return res.status(404).json({ error: "Journal entry not found" });
    }

    const libraryEntry = await library.findOne({
      _id: entry.libraryId,
      username: req.session.user.username,
    });

    if (!libraryEntry) {
      return res.status(403).json({ error: "Not authorized" });
    }

    res.json(entry);
  } catch (error) {
    console.error("Get journal entry error:", error);
    res.status(500).json({ error: "Failed to fetch entry" });
  }
});

// POST /api/journal - Create entry
router.post("/", async (req, res) => {
  const {
    libraryId,
    whereILeftOff,
    currentObjectives,
    importantDetails,
    decisionsMade,
    sessionRating,
    hoursPlayed,
  } = req.body;

  if (!libraryId) {
    return res.status(400).json({ error: "Library ID is required" });
  }

  if (!ObjectId.isValid(libraryId)) {
    return res.status(400).json({ error: "Invalid library ID" });
  }

  try {
    const library = req.db.collection("library");
    const journal = req.db.collection("journal");

    const libraryEntry = await library.findOne({
      _id: new ObjectId(libraryId),
      username: req.session.user.username,
    });

    if (!libraryEntry) {
      return res.status(404).json({ error: "Game not found in library" });
    }

    const newEntry = {
      libraryId: new ObjectId(libraryId),
      whereILeftOff: whereILeftOff || "",
      currentObjectives: currentObjectives || "",
      importantDetails: importantDetails || "",
      decisionsMade: decisionsMade || "",
      sessionRating: sessionRating ? parseInt(sessionRating) : null,
      hoursPlayed: parseFloat(hoursPlayed) || 0,
      createdAt: new Date(),
    };

    const result = await journal.insertOne(newEntry);
    newEntry._id = result.insertedId;

    await library.updateOne(
      { _id: new ObjectId(libraryId) },
      { $set: { dateLastPlayed: new Date() } },
    );

    console.log(`Journal entry added for: ${libraryEntry.gameName}`);
    res.status(201).json(newEntry);
  } catch (error) {
    console.error("Create journal entry error:", error);
    res.status(500).json({ error: "Failed to create entry" });
  }
});

// PUT /api/journal/:id - Update entry
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    whereILeftOff,
    currentObjectives,
    importantDetails,
    decisionsMade,
    sessionRating,
    hoursPlayed,
  } = req.body;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  try {
    const journal = req.db.collection("journal");
    const library = req.db.collection("library");

    const entry = await journal.findOne({ _id: new ObjectId(id) });

    if (!entry) {
      return res.status(404).json({ error: "Entry not found" });
    }

    const libraryEntry = await library.findOne({
      _id: entry.libraryId,
      username: req.session.user.username,
    });

    if (!libraryEntry) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const updateFields = {
      whereILeftOff: whereILeftOff || "",
      currentObjectives: currentObjectives || "",
      importantDetails: importantDetails || "",
      decisionsMade: decisionsMade || "",
      sessionRating: sessionRating ? parseInt(sessionRating) : null,
      hoursPlayed: parseFloat(hoursPlayed) || 0,
    };

    await journal.updateOne({ _id: new ObjectId(id) }, { $set: updateFields });

    const updated = await journal.findOne({ _id: new ObjectId(id) });
    console.log(`Journal entry updated for: ${libraryEntry.gameName}`);
    res.json(updated);
  } catch (error) {
    console.error("Update journal entry error:", error);
    res.status(500).json({ error: "Failed to update entry" });
  }
});

// DELETE /api/journal/:id - Delete entry
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  try {
    const journal = req.db.collection("journal");
    const library = req.db.collection("library");

    const entry = await journal.findOne({ _id: new ObjectId(id) });

    if (!entry) {
      return res.status(404).json({ error: "Entry not found" });
    }

    const libraryEntry = await library.findOne({
      _id: entry.libraryId,
      username: req.session.user.username,
    });

    if (!libraryEntry) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await journal.deleteOne({ _id: new ObjectId(id) });

    console.log(`Journal entry deleted for: ${libraryEntry.gameName}`);
    res.json({ success: true });
  } catch (error) {
    console.error("Delete journal entry error:", error);
    res.status(500).json({ error: "Failed to delete entry" });
  }
});

export default router;
