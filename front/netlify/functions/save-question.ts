/**
 * Save Question Netlify Function
 * Saves user questions to a JSON file
 * 
 * NOTE: This is a file-based persistence approach suitable for development/small scale.
 * In serverless environments like Netlify, this data is ephemeral.
 * TODO: Migrate to a proper database (MongoDB, Firebase, Supabase, etc.) for production
 */
import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

interface Question {
  id: string;
  name?: string;
  contact?: string;
  type: string;
  message: string;
  timestamp: string;
  status: 'pending' | 'answered';
}

const QUESTIONS_FILE = join(process.cwd(), 'data', 'questions.json');

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse request body
    const body = JSON.parse(event.body || '{}');

    // Validate required fields
    if (!body.type || !body.message) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: 'Missing required fields',
          required: ['type', 'message'],
        }),
      };
    }

    // Create question object
    const question: Question = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: body.name || 'مجهول',
      contact: body.contact || '',
      type: body.type,
      message: body.message,
      timestamp: new Date().toISOString(),
      status: 'pending',
    };

    // Read existing questions
    let questions: Question[] = [];
    if (existsSync(QUESTIONS_FILE)) {
      try {
        const fileContent = readFileSync(QUESTIONS_FILE, 'utf-8');
        questions = JSON.parse(fileContent);
      } catch (error) {
        console.error('Error reading questions file:', error);
        questions = [];
      }
    }

    // Add new question
    questions.push(question);

    // Write back to file
    // NOTE: In serverless environments like Netlify, this write is ephemeral
    // and will not persist between function invocations.
    // This is for local development/testing only.
    try {
      writeFileSync(QUESTIONS_FILE, JSON.stringify(questions, null, 2));
    } catch (error) {
      console.warn('Warning: Could not write to file in serverless environment:', error);
      // Continue anyway - the question is captured in the response
    }

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        message: 'تم حفظ السؤال بنجاح',
        question: question,
        warning: 'Note: File-based persistence is ephemeral in serverless environments. Consider migrating to a database.',
      }),
    };
  } catch (error) {
    console.error('Error saving question:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Failed to save question',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};

export { handler };
