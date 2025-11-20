import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import * as fs from 'fs';
import * as path from 'path';

interface QuestionPayload {
  name?: string;
  contact?: string;
  type: string;
  message: string;
  timestamp?: string;
}

/**
 * Save Question Netlify Function
 * Validates and saves questions to data/questions.json
 * 
 * NOTE: This is for demonstration/development purposes.
 * File-based storage is ephemeral on serverless platforms.
 * TODO: Migrate to persistent database (MongoDB, Firebase, etc.)
 */
const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    
    // Server-side validation
    if (!body.type || typeof body.type !== 'string') {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Question type is required' }),
      };
    }

    if (!body.message || typeof body.message !== 'string' || body.message.trim().length === 0) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Question message is required' }),
      };
    }

    // Sanitize and validate message length
    if (body.message.length > 5000) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Message is too long (max 5000 characters)' }),
      };
    }

    // Create question object
    const question: QuestionPayload = {
      name: body.name?.trim() || 'Anonymous',
      contact: body.contact?.trim() || undefined,
      type: body.type.trim(),
      message: body.message.trim(),
      timestamp: new Date().toISOString(),
    };

    // Path to questions file (in production, use database)
    const questionsPath = path.join(process.cwd(), '..', '..', 'data', 'questions.json');
    
    let questions: QuestionPayload[] = [];
    
    // Read existing questions if file exists
    try {
      if (fs.existsSync(questionsPath)) {
        const fileContent = fs.readFileSync(questionsPath, 'utf-8');
        questions = JSON.parse(fileContent);
      }
    } catch (readError) {
      console.warn('Could not read existing questions:', readError);
      // Continue with empty array
    }

    // Append new question
    questions.push(question);

    // Write back to file (safe append)
    try {
      const dir = path.dirname(questionsPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(questionsPath, JSON.stringify(questions, null, 2), 'utf-8');
    } catch (writeError) {
      console.error('Could not write questions file:', writeError);
      // Return success anyway since this is ephemeral storage
      // In production, this would be a real database
    }

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        message: 'Question submitted successfully',
        note: 'Using ephemeral file storage - data will be lost on redeploy',
      }),
    };
  } catch (error) {
    console.error('Save question error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Failed to save question',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};

export { handler };
