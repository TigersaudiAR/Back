import cors from "cors";
import express from "express";
import morgan from "morgan";

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

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/quran", quranRouter);
app.use("/api/adhkar", adhkarRouter);
app.use("/api/halaqat", halaqatRouter);
app.use("/api/hadith", hadithRouter);
app.use("/api/dawah", dawahRouter);
app.use("/api/scholars", scholarsRouter);
app.use("/api/prayers", prayersRouter);
app.use("/api/users", usersRouter);
app.use("/api/islamic-learning", islamicLearningRouter);

const port = Number(process.env.PORT) || 4000;

app.listen(port, "0.0.0.0", () => {
  console.log(`✅ Backend running on port ${port}`);
});