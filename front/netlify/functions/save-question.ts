/**
 * Save Question Netlify Function
 * Stores questions from "تواصل مع أهل العلم" form
 * Uses simple JSON file storage for development
 * TODO: Migrate to proper database for production
 */

import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import * as fs from 'fs/promises';
import * as path from 'path';

interface Question {
  id: string;
  name: string;
  email?: string;
  question: string;
  category?: string;
  timestamp: number;
  status: 'pending' | 'answered' | 'archived';
}

interface SaveQuestionRequest {
  name: string;
  email?: string;
  question: string;
  category?: string;
}

interface ErrorResponse {
  error: string;
  message: string;
}

const QUESTIONS_FILE_PATH = path.join(process.cwd(), 'data', 'questions.json');

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.dirname(QUESTIONS_FILE_PATH);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Read questions from file
async function readQuestions(): Promise<Question[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(QUESTIONS_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist yet, return empty array
    return [];
  }
}

// Write questions to file
async function writeQuestions(questions: Question[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(QUESTIONS_FILE_PATH, JSON.stringify(questions, null, 2), 'utf-8');
}

// Validate question data
function validateQuestion(data: SaveQuestionRequest | unknown): data is SaveQuestionRequest {
  if (!data || typeof data !== 'object') {
    return false;
  }
  const req = data as SaveQuestionRequest;
  if (!req.name || typeof req.name !== 'string' || req.name.trim().length === 0) {
    return false;
  }
  if (!req.question || typeof req.question !== 'string' || req.question.trim().length === 0) {
    return false;
  }
  if (req.email && typeof req.email !== 'string') {
    return false;
  }
  return true;
}

// Generate unique ID
function generateId(): string {
  return `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' } as ErrorResponse),
      headers: {
        'Content-Type': 'application/json',
        'Allow': 'POST',
      },
    };
  }

  try {
    // Parse request body
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Bad Request',
          message: 'Missing request body',
        } as ErrorResponse),
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }

    const requestData = JSON.parse(event.body);

    // Validate data
    if (!validateQuestion(requestData)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Validation Error',
          message: 'Invalid question data. Name and question are required.',
        } as ErrorResponse),
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }

    // Create new question
    const newQuestion: Question = {
      id: generateId(),
      name: requestData.name.trim(),
      email: requestData.email?.trim(),
      question: requestData.question.trim(),
      category: requestData.category?.trim() || 'عام',
      timestamp: Date.now(),
      status: 'pending',
    };

    // Read existing questions
    const questions = await readQuestions();

    // Add new question
    questions.push(newQuestion);

    // Write back to file
    await writeQuestions(questions);

    return {
      statusCode: 201,
      body: JSON.stringify({
        success: true,
        message: 'تم حفظ السؤال بنجاح. سيتم الرد عليه في أقرب وقت إن شاء الله',
        questionId: newQuestion.id,
      }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    };
  } catch (error) {
    console.error('Save question error:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      } as ErrorResponse),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }
};

export { handler };
