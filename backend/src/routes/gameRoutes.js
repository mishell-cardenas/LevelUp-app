import express from "express";
import { fetchGame, listGames, getGameDetails } from "../controllers/gameController.js";

const router = express.Router();
router.get("/", listGames);
router.get("/:appId/details", getGameDetails);
router.get("/:appId", fetchGame);
export default router;
