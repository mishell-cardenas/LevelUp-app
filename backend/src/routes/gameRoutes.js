import express from "express";
import {
  listGames,
  fetchGame,
  searchGames,
  getGameDetails,
} from "../controllers/gameController.js";

const router = express.Router();

router.get("/", listGames);
router.get("/search", searchGames);
router.get("/:appId/details", getGameDetails);
router.get("/:appId", fetchGame);

export default router;
