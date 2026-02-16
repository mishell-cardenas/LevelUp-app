import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import gameRoutes from "./routes/gameRoutes.js";
import syncRoutes from "./routes/syncRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());

await connectDB();

app.use("/games", gameRoutes);
app.use("/sync", syncRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
