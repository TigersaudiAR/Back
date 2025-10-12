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

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
