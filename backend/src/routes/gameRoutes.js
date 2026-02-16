import express from "express";
import { fetchGame } from "../controllers/gameController.js";

const router = express.Router();
router.get("/:appId", fetchGame);
export default router;
