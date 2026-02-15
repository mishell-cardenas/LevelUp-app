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
