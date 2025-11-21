/**
 * Netlify Function: Save Question
 * Stores questions from users to a JSON file
 * 
 * NOTE: File-based persistence is NOT permanent on serverless platforms.
 * This is a temporary/demo solution. For production, migrate to a database.
 * 
 * ملاحظة: التخزين في الملفات ليس دائماً على المنصات serverless.
 * هذا حل مؤقت/عرضي. للإنتاج، يجب الترحيل إلى قاعدة بيانات.
 */

import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import fs from 'fs';
import path from 'path';

interface Question {
  id: string;
  name?: string;
  contact?: string;
  type: string;
  message: string;
  timestamp: string;
}

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: body.name,
      contact: body.contact,
      type: body.type,
      message: body.message,
      timestamp: new Date().toISOString(),
    };

    // WARNING: This file-based approach won't persist on serverless
    // In production, use a database service (Firebase, MongoDB, etc.)
    
    // Path to questions file
    const questionsPath = path.join(process.cwd(), 'data', 'questions.json');
    
    let questions: Question[] = [];
    
    // Read existing questions if file exists
    if (fs.existsSync(questionsPath)) {
      const fileContent = fs.readFileSync(questionsPath, 'utf-8');
      questions = JSON.parse(fileContent);
    }
    
    // Add new question
    questions.push(question);
    
    // Write back to file (NOTE: This won't persist on serverless!)
    fs.writeFileSync(questionsPath, JSON.stringify(questions, null, 2));

    console.log(`Question saved: ${question.id}`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        success: true,
        id: question.id,
        message: 'Question saved successfully (temporary storage)',
        warning: 'This is temporary storage. Data may be lost on redeploy. Use a database for production.',
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
