import express from "express";

import { getFaqs } from "../services/dataService.js";

const router = express.Router();

router.post("/ask", (req, res) => {
  const { question } = req.body as { question: string };
  const faqs = getFaqs();
  const answer = faqs[0];
  res.json({
    answer: `سؤالك: ${question}\nالإجابة المختصرة: ${answer.answer}`,
    refs: ["القرآن الكريم", "السنة النبوية"]
  });
});

export const dawahRouter = router;
