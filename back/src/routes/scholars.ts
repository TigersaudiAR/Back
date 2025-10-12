import express from "express";
import { v4 as uuid } from "uuid";

import { getFaqs } from "../services/dataService.js";

const router = express.Router();

interface Question {
  id: string;
  name?: string;
  contact?: string;
  question: string;
  createdAt: string;
}

const inbox: Question[] = [];

router.get("/faq", (_req, res) => {
  res.json({ faqs: getFaqs() });
});

router.post("/ask", (req, res) => {
  const { name, contact, question } = req.body as {
    name?: string;
    contact?: string;
    question: string;
  };
  inbox.push({ id: uuid(), name, contact, question, createdAt: new Date().toISOString() });
  res.json({ ok: true });
});

router.get("/inbox", (_req, res) => {
  res.json({ inbox });
});

export const scholarsRouter = router;
