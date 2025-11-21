/**
 * Netlify Function: Save Question
 * POST endpoint that validates payload and appends to questions.json
 * NOTE: This is file-based persistence for local/dev environments
 * TODO: Migrate to database for production serverless environment
 */

import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { promises as fs } from "fs";
import path from "path";

interface QuestionPayload {
  name?: string;
  contact?: string;
  type: string;
  message: string;
  timestamp?: number;
}

const QUESTIONS_FILE = path.join(process.cwd(), "data", "questions.json");

const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "",
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    // Parse request body
    const payload: QuestionPayload = JSON.parse(event.body || "{}");

    // Validate required fields
    if (!payload.type || !payload.message) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          error: "Validation failed",
          message: "Type and message are required",
        }),
      };
    }

    // Sanitize and prepare question object
    const question: QuestionPayload = {
      name: payload.name?.trim() || "مجهول",
      contact: payload.contact?.trim() || "",
      type: payload.type.trim(),
      message: payload.message.trim(),
      timestamp: Date.now(),
    };

    // Read existing questions
    let questions: QuestionPayload[] = [];
    try {
      const fileContent = await fs.readFile(QUESTIONS_FILE, "utf-8");
      questions = JSON.parse(fileContent);
    } catch (error) {
      // File doesn't exist or is invalid, start with empty array
      console.warn("Questions file not found or invalid, creating new:", error);
    }

    // Append new question
    questions.push(question);

    // Write back to file
    // NOTE: This is ephemeral in serverless environments!
    // Files written to the filesystem in Netlify Functions are not persisted
    // TODO: Migrate to a database (e.g., MongoDB, PostgreSQL, or Netlify Blobs)
    await fs.writeFile(QUESTIONS_FILE, JSON.stringify(questions, null, 2), "utf-8");

    return {
      statusCode: 201,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        success: true,
        message: "تم حفظ السؤال بنجاح",
        id: questions.length - 1,
      }),
    };
  } catch (error) {
    console.error("Error saving question:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        error: "Failed to save question",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
};

export { handler };
