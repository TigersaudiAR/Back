/**
 * Netlify Function: Save Question
 * Saves questions from the Ask Scholars form
 * NOTE: File-based persistence is ephemeral on serverless environments
 * TODO: Migrate to a database solution for production (MongoDB, PostgreSQL, etc.)
 */

import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { promises as fs } from 'fs';
import path from 'path';

interface Question {
  id: string;
  name?: string;
  contact?: string;
  type: string;
  message: string;
  timestamp: string;
  status: 'pending' | 'answered';
}

const QUESTIONS_FILE = path.join(process.cwd(), '../../data/questions.json');

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
          error: 'Missing required fields: type and message are required' 
        }),
      };
    }

    // Validate message length
    if (body.message.length < 10 || body.message.length > 5000) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ 
          error: 'Message must be between 10 and 5000 characters' 
        }),
      };
    }

    // Create question object
    const question: Question = {
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: body.name?.trim() || 'مجهول',
      contact: body.contact?.trim() || '',
      type: body.type.trim(),
      message: body.message.trim(),
      timestamp: new Date().toISOString(),
      status: 'pending',
    };

    // Read existing questions (with error handling for missing file)
    let questions: Question[] = [];
    try {
      const fileContent = await fs.readFile(QUESTIONS_FILE, 'utf-8');
      questions = JSON.parse(fileContent);
    } catch (error) {
      console.warn('Questions file not found or invalid, creating new one');
      questions = [];
    }

    // Add new question
    questions.push(question);

    // Save to file
    // NOTE: This will NOT persist on Netlify/Vercel serverless environments
    // This is for local development and testing only
    try {
      await fs.writeFile(QUESTIONS_FILE, JSON.stringify(questions, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to write questions file:', error);
      // Continue anyway for serverless environments
    }

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        success: true,
        questionId: question.id,
        message: 'تم إرسال سؤالك بنجاح. سنقوم بالرد عليك في أقرب وقت ممكن.',
        note: 'File-based storage is ephemeral. Please migrate to a database for production use.',
      }),
    };
  } catch (error: any) {
    console.error('Save question error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        error: 'Failed to save question',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      }),
    };
  }
};

export { handler };
