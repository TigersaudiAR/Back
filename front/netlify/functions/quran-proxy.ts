/**
 * Quran Proxy Netlify Function
 * Forwards requests to King Fahd Complex API with optional API key
 */
import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

const QURAN_API_BASE = process.env.VITE_QURAN_BASE || 'https://qurancomplex.gov.sa/quran-dev';
const QURAN_API_KEY = process.env.VITE_QURAN_API_KEY || '';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Get the path from query parameters
    const path = event.queryStringParameters?.path || '';
    
    if (!path) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Missing path parameter' }),
      };
    }

    // Construct the full URL
    const url = new URL(path, QURAN_API_BASE);
    
    // Forward other query parameters
    const { path: _, ...otherParams } = event.queryStringParameters || {};
    Object.entries(otherParams).forEach(([key, value]) => {
      if (value) {
        url.searchParams.append(key, value);
      }
    });

    // Prepare headers
    const headers: HeadersInit = {
      'Accept': 'application/json',
    };

    if (QURAN_API_KEY) {
      headers['Authorization'] = `Bearer ${QURAN_API_KEY}`;
    }

    // Make the request
    const response = await fetch(url.toString(), { headers });
    
    const data = await response.json();

    return {
      statusCode: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Proxy error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Failed to fetch data from Quran API',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};

export { handler };
