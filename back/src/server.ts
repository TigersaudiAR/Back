import cors from "cors";
import express from "express";
import morgan from "morgan";
import path from "path";

import { authRouter } from "./routes/auth.js";
import { quranRouter } from "./routes/quran.js";
import { adhkarRouter } from "./routes/adhkar.js";
import { halaqatRouter } from "./routes/halaqat.js";
import { hadithRouter } from "./routes/hadith.js";
import { dawahRouter } from "./routes/dawah.js";
import { scholarsRouter } from "./routes/scholars.js";
import { prayersRouter } from "./routes/prayers.js";
import { usersRouter } from "./routes/users.js";
import islamicLearningRouter from "./routes/islamic-learning.js";
import nisukRouter from "./routes/nisuk.js";
import memorizationRouter from "./routes/memorization.js";
import lessonsRouter from "./routes/lessons-enhanced.js";
import quranPagesRouter from "./routes/quran-pages.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Serve static files from public directory
app.use("/public", express.static(path.join(process.cwd(), "public")));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/quran", quranRouter);
app.use("/api/quran-pages", quranPagesRouter);
app.use("/api/adhkar", adhkarRouter);
app.use("/api/halaqat", halaqatRouter);
app.use("/api/hadith", hadithRouter);
app.use("/api/dawah", dawahRouter);
app.use("/api/scholars", scholarsRouter);
app.use("/api/prayers", prayersRouter);
app.use("/api/users", usersRouter);
app.use("/api/islamic-learning", islamicLearningRouter);
app.use("/api/nisuk", nisukRouter);
app.use("/api/memorization", memorizationRouter);
app.use("/api/lessons", lessonsRouter);

const port = Number(process.env.PORT) || 4000;

app.listen(port, "0.0.0.0", () => {
  console.log(`✅ Backend running on port ${port}`);
});