import express from "express";

import { authenticate } from "../middleware/auth.js";
import { getAdhkar } from "../services/dataService.js";

const router = express.Router();

router.get("/", (req, res) => {
  const set = (req.query.set as string) || "morning";
  const data = getAdhkar();
  const result = data.find((item) => item.name === set) ?? data[0];
  res.json({ set: result, all: data });
});

router.post("/", authenticate(["admin", "teacher"]), (req, res) => {
  res.json({ message: "تم حفظ الذكر (محاكاة)", payload: req.body });
});

export const adhkarRouter = router;
