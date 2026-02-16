import express from "express";
import { syncTopSellers } from "../controllers/syncController.js";

const router = express.Router();
router.post("/topsellers", syncTopSellers);

export default router;
