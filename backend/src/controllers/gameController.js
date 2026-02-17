import { getGameInfo } from "../services/steamService.js";
import { db } from "../config/db.js";

export async function fetchGame(req, res) {
  const { steamId } = req.params;

  try {
    const steamGame = await getGameInfo(steamId);

    if (steamGame === null) {
      res.status(404).json({ error: "Game not found on Steam." });
      return;
    }

    const info = {
      steamId: Number(steamId),
      name: steamGame.name,
      description: steamGame.short_description,
      headerImage: steamGame.header_image,
      genres: (steamGame.genres || []).map((g) => g.description),
      screenshots: (steamGame.screenshots || []).map((s) => s.path_full),
      platforms: steamGame.platforms || {},
      releaseDate: steamGame.release_date.date,
    };

    const games = db.collection("steam_games");
    await games.updateOne(
      { steamId: info.steamId },
      { $set: info },
      { upsert: true },
    );

    res.json({
      message: "Game data fetched and stored successfully.",
      game: info,
    });
  } catch (error) {
    console.error("Error fetching game data:", error);
    res.status(500).json({ error: "Failed to fetch game data from Steam." });
  }
}

export async function listGames(req, res) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const search = (req.query.search || "").trim();

    const query = {};
    if (search.length > 0) {
      query.name = { $regex: search, $options: "i" };
    }

    const gamesCollection = db.collection("steam_games");

    const skip = (page - 1) * limit;

    const [games, total] = await Promise.all([
      gamesCollection
        .find(query)
        .project({ steamId: 1, name: 1, headerImage: 1 })
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      gamesCollection.countDocuments(query),
    ]);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      games,
    });
  } catch (err) {
    console.error("Error listing games:", err);
    res.status(500).json({ error: "Failed to list games." });
  }
}

export async function getGameDetails(req, res) {
  try {
    const { appId } = req.params;

    const gamesCollection = db.collection("steam_games");

    const game = await gamesCollection.findOne({ steamId: Number(appId) });

    if (!game) {
      res.status(404).json({ error: "Game not found in database." });
      return;
    }

    res.json(game);
  } catch (err) {
    console.error("Error fetching game details from DB:", err);
    res.status(500).json({ error: "Failed to fetch game details." });
  }
}
