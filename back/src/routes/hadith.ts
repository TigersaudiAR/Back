import express from "express";

import { authenticate } from "../middleware/auth.js";
import { getHadith, saveHadith } from "../services/dataService.js";

const router = express.Router();

router.get("/", (req, res) => {
  const topic = req.query.topic as string | undefined;
  const data = getHadith();
  const filtered = topic
    ? data.filter((item) =>
        Array.isArray(item.topic)
          ? item.topic.some((entry) => entry.includes(topic))
          : item.topic?.includes(topic)
      )
    : data;
  res.json({ hadith: filtered });
});

router.post("/", authenticate(["admin", "lecturer"]), (req, res) => {
  try {
    const saved = saveHadith(req.body);
    res.status(201).json({
      message: "تم حفظ الحديث بنجاح",
      hadith: saved,
      all: getHadith()
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "تعذر حفظ الحديث";
    res.status(400).json({ message });
  }
});

export const hadithRouter = router;
