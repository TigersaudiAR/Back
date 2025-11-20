import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Netlify Function: Save Question
 * 
 * POST endpoint to append user questions to data/questions.json
 * Includes server-side validation and safe append
 * 
 * ⚠️ IMPORTANT LIMITATION:
 * Netlify Functions run in an ephemeral serverless environment.
 * File writes to the repository are NOT persistent between deployments.
 * This is a demonstration implementation.
 * 
 * TODO: Migrate to a persistent database (e.g., Supabase, MongoDB Atlas, etc.)
 *       before production use.
 * 
 * Usage: POST /.netlify/functions/save-question
 * Body: { "question": "string", "name": "string", "email": "string" }
 */

interface QuestionData {
  question: string;
  name?: string;
  email?: string;
  timestamp?: string;
}

export const handler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext
) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  try {
    // Parse request body
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing request body' }),
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }

    const data: QuestionData = JSON.parse(event.body);

    // Validate required fields
    if (!data.question || typeof data.question !== 'string') {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid or missing question field' }),
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }

    // Sanitize input
    const sanitizedQuestion: QuestionData = {
      question: data.question.trim().substring(0, 1000), // Limit length
      name: data.name ? data.name.trim().substring(0, 100) : undefined,
      email: data.email ? data.email.trim().substring(0, 100) : undefined,
      timestamp: new Date().toISOString(),
    };

    // Validate email format if provided
    if (sanitizedQuestion.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(sanitizedQuestion.email)) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Invalid email format' }),
          headers: {
            'Content-Type': 'application/json',
          },
        };
      }
    }

    // ⚠️ WARNING: This file write is ephemeral in Netlify Functions
    // The file is in the deployment build, any writes are lost on next deployment
    const questionsPath = join(process.cwd(), 'data', 'questions.json');
    
    let questions: QuestionData[] = [];
    
    try {
      const fileContent = readFileSync(questionsPath, 'utf-8');
      questions = JSON.parse(fileContent);
    } catch (error) {
      // File doesn't exist or is invalid, start with empty array
      console.warn('Questions file not found or invalid, creating new');
    }

    // Append new question
    questions.push(sanitizedQuestion);

    // Write back to file (ephemeral - will be lost!)
    writeFileSync(questionsPath, JSON.stringify(questions, null, 2));

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Question saved successfully',
        warning: 'Note: This storage is ephemeral. Please migrate to a database for production.',
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
        error: 'Failed to save question',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    };
  }
};
