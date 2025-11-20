/**
 * Save Question Netlify Function
 * POST /api/save-question
 * Appends question to data/questions.json file
 * 
 * WARNING: This is for demo/local development only!
 * File-based persistence is ephemeral on serverless platforms.
 * TODO: Migrate to a persistent database (MongoDB, PostgreSQL, etc.) for production
 */

import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import * as fs from "fs";
import * as path from "path";

interface Question {
  id: string;
  name?: string;
  contact?: string;
  type: string;
  message: string;
  timestamp: string;
  status: 'pending' | 'answered';
}

interface QuestionPayload {
  name?: string;
  contact?: string;
  type: string;
  message: string;
}

const QUESTIONS_FILE = path.join(process.cwd(), '../../../data/questions.json');

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Set CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle OPTIONS request for CORS preflight
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
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse request body
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing request body' }),
      };
    }

    const payload: QuestionPayload = JSON.parse(event.body);

    // Validate payload
    if (!payload.type || !payload.message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing required fields: type and message are required' 
        }),
      };
    }

    // Validate message length
    if (payload.message.length < 10) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Message too short. Must be at least 10 characters.' 
        }),
      };
    }

    if (payload.message.length > 2000) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Message too long. Must be less than 2000 characters.' 
        }),
      };
    }

    // Create question object
    const question: Question = {
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: payload.name?.trim() || 'مجهول',
      contact: payload.contact?.trim(),
      type: payload.type,
      message: payload.message.trim(),
      timestamp: new Date().toISOString(),
      status: 'pending',
    };

    // Read existing questions
    let questions: Question[] = [];
    try {
      if (fs.existsSync(QUESTIONS_FILE)) {
        const data = fs.readFileSync(QUESTIONS_FILE, 'utf-8');
        questions = JSON.parse(data);
      }
    } catch (error) {
      console.warn('Could not read questions file, starting fresh:', error);
      questions = [];
    }

    // Add new question
    questions.push(question);

    // Save to file
    // Note: This will NOT persist on serverless platforms!
    try {
      // Ensure directory exists
      const dir = path.dirname(QUESTIONS_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(questions, null, 2), 'utf-8');
      
      console.log(`Question saved: ${question.id}`);
      console.warn('WARNING: File-based storage is ephemeral on serverless platforms!');
    } catch (error) {
      console.error('Could not write to questions file:', error);
      // Continue anyway, log the question to console at least
      console.log('Question (not persisted):', JSON.stringify(question, null, 2));
    }

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        id: question.id,
        message: 'تم إرسال سؤالك بنجاح. سيتم الرد عليه قريباً إن شاء الله.',
        warning: 'Note: File-based storage is for demo only. Data may not persist.',
      }),
    };
  } catch (error) {
    console.error('Save question error:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};

export { handler };
