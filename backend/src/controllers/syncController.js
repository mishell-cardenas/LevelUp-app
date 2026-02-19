import { db } from "../config/connection.js";
import { getGameInfo } from "../services/steamService.js";
import { getTopSellersSteamIds } from "../services/topSellersService.js";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function syncTopSellers(req, res) {
  try {
    const steamIds = await getTopSellersSteamIds(1010);

    const gamesCollection = db.collection("steam_games");
    let syncedCount = 0;
    let skippedCount = 0;

    for (const steamId of steamIds) {

      const checkDupe = await gamesCollection.findOne({ steamId: Number(steamId)});
      if (checkDupe) {
        skippedCount += 1;
        continue; 
      }

      await sleep(600); 

      let steamGame;
      try {
        steamGame = await getGameInfo(steamId);
      } catch (error) {
        console.error(error.message);
        skippedCount += 1;
        continue; 
      }

      const gameInfo = {
        steamId: Number(steamId),
        name: steamGame.name,
        description: steamGame.short_description,
        headerImage: steamGame.header_image,
        genres: (steamGame.genres || []).map((g) => g.description),
        screenshots: (steamGame.screenshots || []).map((s) => s.path_full),
        platforms: steamGame.platforms || {},
        releaseDate: steamGame.release_date.date,
      };

      await gamesCollection.updateOne(
        { steamId: gameInfo.steamId },
        { $set: gameInfo },
        { upsert: true },
      );
      syncedCount += 1;
    }

    res.json({
      message: "Sync completed.",
      requested: 1010,
      syncedCount,
      skippedCount,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Failed to sync top sellers." });
  }
}
