/**
 * Netlify Function: Save Question
 * 
 * POST endpoint to save user questions to data/questions.json
 * 
 * NOTE: This uses file-based persistence which is ephemeral on serverless.
 * For production, migrate to a database (MongoDB, PostgreSQL, etc.)
 * 
 * TODO: Migrate to persistent database when deploying to production
 */

import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { promises as fs } from 'fs';
import { join } from 'path';

interface Question {
  id?: string;
  name?: string;
  contact?: string;
  type: string;
  message: string;
  timestamp: string;
  status?: string;
}

const QUESTIONS_FILE = join(process.cwd(), 'data', 'questions.json');

export const handler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext
) => {
  // CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Handle OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed. Use POST.' }),
    };
  }

  try {
    // Parse request body
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Request body is required' }),
      };
    }

    const body = JSON.parse(event.body);

    // Validate required fields
    if (!body.type || !body.message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Missing required fields',
          required: ['type', 'message'],
        }),
      };
    }

    // Create question object
    const question: Question = {
      id: Date.now().toString(),
      name: body.name || 'مجهول',
      contact: body.contact || '',
      type: body.type,
      message: body.message,
      timestamp: new Date().toISOString(),
      status: 'pending',
    };

    // Read existing questions
    let questions: Question[] = [];
    try {
      const fileContent = await fs.readFile(QUESTIONS_FILE, 'utf-8');
      questions = JSON.parse(fileContent);
    } catch (error) {
      // If file doesn't exist or is invalid, start with empty array
      console.log('Creating new questions file');
      questions = [];
    }

    // Add new question
    questions.push(question);

    // Write back to file
    // NOTE: In serverless environment, this write is ephemeral
    // Files are not persisted between function invocations
    await fs.writeFile(QUESTIONS_FILE, JSON.stringify(questions, null, 2), 'utf-8');

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'تم حفظ السؤال بنجاح',
        question,
        warning: 'File-based storage is ephemeral in serverless. Migrate to database for production.',
      }),
    };
  } catch (error) {
    console.error('Error saving question:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'فشل في حفظ السؤال',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
