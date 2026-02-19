import express from "express";
import { ObjectId } from "mongodb";
import { db } from "../config/connection.js";

const router = express.Router();

/**
 * @route GET /reviews/summaries?steamIds
 * Allows us to get averate of review ratings for each game
 * Used in the index page to show the average rating for each game in the list
 */
router.get("/summaries", async (req, res) => {
  try {
    const steamIds = String(req.query.steamIds || "")
      .split(",")
      .map((x) => Number(x))
      .filter((n) => Number.isFinite(n));

    if (steamIds.length === 0) {
      return res.json({});
    }

    const reviews = db.collection("reviews");

    const results = await reviews
      .aggregate([
        { $match: { steamId: { $in: steamIds } } },
        {
          $group: {
            _id: "$steamId",
            averageRating: { $avg: "$rating" },
            reviewCount: { $sum: 1 },
          },
        },
      ])
      .toArray();

    const map = {};
    for (let i = 0; i < steamIds.length; i++) {
      map[String(steamIds[i])] = { averageRating: null, reviewCount: 0 };
    }

    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      map[String(r._id)] = {
        averageRating: r.averageRating,
        reviewCount: r.reviewCount,
      };
    }

    res.json(map);
  } catch (err) {
    console.error("Error fetching review summaries:", err);
    res.status(500).json({ error: "Failed to fetch review summaries." });
  }
});

/**
 * @route GET /reviews/game/:steamId/summary
 * Show average ratings of one game for index page's modal pill
 */
router.get("/game/:steamId/summary", async (req, res) => {
  try {
    const steamId = Number(req.params.steamId);
    if (!Number.isFinite(steamId)) {
      return res.status(400).json({ error: "Invalid steamId parameter." });
    }

    const reviews = db.collection("reviews");

    const result = await reviews
      .aggregate([
        { $match: { steamId } },
        {
          $group: {
            _id: "$steamId",
            averageRating: { $avg: "$rating" },
            reviewCount: { $sum: 1 },
          },
        },
      ])
      .toArray();

    if (result.length === 0) {
      return res.json({
        steamId: steamId,
        averageRating: null,
        reviewCount: 0,
      });
    }

    res.json({
      steamId: steamId,
      averageRating: result[0].averageRating,
      reviewCount: result[0].reviewCount,
    });
  } catch (err) {
    console.error("Error fetching review summary:", err);
    res.status(500).json({ error: "Failed to fetch review summary." });
  }
});

/**
 * @route GET /reviews/game/:steamId
 * Used in the reviews page to list reviews of a given game
 */
router.get("/game/:steamId", async (req, res) => {
  try {
    const steamId = Number(req.params.steamId);
    if (!Number.isFinite(steamId)) {
      return res.status(400).json({ error: "Invalid steamId" });
    }

    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 50);

    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 50;
    const skip = (safePage - 1) * safeLimit;

    const reviewsCol = db.collection("reviews");

    const items = await reviewsCol
      .find({ steamId: steamId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .toArray();

    const total = await reviewsCol.countDocuments({ steamId: steamId });

    return res.json({
      steamId: steamId,
      page: safePage,
      limit: safeLimit,
      total: total,
      items: items,
    });
  } catch (err) {
    console.error("GET /reviews/game/:steamId error:", err);
    return res.status(500).json({ error: "Failed to fetch reviews." });
  }
});

/**
 * @route POST /reviews
 * Used in the reviews page to submit a new review for a game
 */
router.post("/", async (req, res) => {
  try {
    const steamId = Number(req.body.steamId);
    const username = String(req.body.username || "").trim();
    const rating = Number(req.body.rating);
    const comment = String(req.body.comment || "").trim();

    if (!Number.isFinite(steamId)) {
      return res.status(400).json({ error: "Invalid steamId." });
    }

    if (username.length === 0) {
      return res.status(400).json({ error: "Username is required." });
    }

    if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
      return res
        .status(400)
        .json({ error: "Rating must be a number between 0 and 5." });
    }

    const reviews = db.collection("reviews");

    const newReview = {
      steamId: steamId,
      username: username,
      rating: rating,
      comment: comment,
      createdAt: new Date(),
    };

    const result = await reviews.insertOne(newReview);

    res.status(201).json({
      message: "Review submitted successfully.",
      reviewId: result.insertedId,
    });
  } catch (err) {
    console.error("Error submitting review:", err);
    res.status(500).json({ error: "Failed to submit review." });
  }
});

/**
 * PATCH /reviews/:id
 * Updates a review
 */
router.patch("/:id", async (req, res) => {
  try {
    const id = String(req.params.id || "").trim();
    if (ObjectId.isValid(id) === false) {
      return res.status(400).json({ error: "Invalid review id." });
    }

    const rating = Number(req.body.rating);
    const comment = String(req.body.comment || "").trim();

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be 1 to 5." });
    }

    if (comment.length === 0) {
      return res.status(400).json({ error: "Comment is required." });
    }

    const reviews = db.collection("reviews");

    const result = await reviews.updateOne(
      { _id: new ObjectId(id) },
      { $set: { rating: rating, comment: comment, updatedAt: new Date() } },
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Review not found." });
    }

    return res.json({ message: "Review updated successfully." });
  } catch (err) {
    console.error("Error updating review:", err);
    return res.status(500).json({ error: "Failed to update review." });
  }
});

/**
 * DELETE /reviews/:id
 * Deletes a review by its Id.
 */
router.delete("/:id", async (req, res) => {
  try {
    const id = String(req.params.id || "").trim();
    if (ObjectId.isValid(id) === false) {
      return res.status(400).json({ error: "Invalid review id." });
    }

    const reviews = db.collection("reviews");

    const result = await reviews.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Review not found." });
    }

    return res.json({ message: "Review deleted successfully." });
  } catch (err) {
    console.error("Error deleting review:", err);
    return res.status(500).json({ error: "Failed to delete review." });
  }
});

export default router;
