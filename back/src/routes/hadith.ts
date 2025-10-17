import express from "express";

import { authenticate } from "../middleware/auth.js";
import { getHadith } from "../services/dataService.js";

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
  res.json({ message: "تم حفظ الحديث (محاكاة)", payload: req.body });
});

export const hadithRouter = router;
