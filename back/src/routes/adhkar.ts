import express from "express";

import { authenticate } from "../middleware/auth.js";
import { getAdhkar, saveDhikrSet } from "../services/dataService.js";

const router = express.Router();

router.get("/", (req, res) => {
  const set = (req.query.set as string) || "morning";
  const data = getAdhkar();
  const result = data.find((item) => item.name === set) ?? data[0];
  res.json({ set: result, all: data });
});

router.post("/", authenticate(["admin", "teacher"]), (req, res) => {
  try {
    const saved = saveDhikrSet(req.body);
    res.status(201).json({
      message: "تم حفظ مجموعة الأذكار بنجاح",
      set: saved,
      all: getAdhkar()
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "تعذر حفظ مجموعة الأذكار";
    res.status(400).json({ message });
  }
});

export const adhkarRouter = router;
