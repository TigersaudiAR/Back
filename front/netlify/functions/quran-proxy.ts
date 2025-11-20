import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

/**
 * Netlify Function: Quran Proxy
 * 
 * Proxies requests to the King Fahd Complex API to avoid CORS issues
 * Forwards query parameters and returns JSON response
 * 
 * Usage: GET /.netlify/functions/quran-proxy?endpoint=/surah/1
 */

const QURAN_BASE_URL = process.env.VITE_QURAN_BASE || 'https://qurancomplex.gov.sa/quran-dev';
const QURAN_API_KEY = process.env.VITE_QURAN_API_KEY || '';

export const handler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext
) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  try {
    // Get endpoint from query parameters
    const endpoint = event.queryStringParameters?.endpoint || '';
    
    if (!endpoint) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing endpoint parameter' }),
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }

    // Build target URL
    const targetUrl = `${QURAN_BASE_URL}${endpoint}`;
    
    // Build headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (QURAN_API_KEY) {
      headers['Authorization'] = `Bearer ${QURAN_API_KEY}`;
    }

    // Forward request to King Fahd Complex API
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers,
    });

    // Get response data
    const data = await response.json();

    // Return proxied response
    return {
      statusCode: response.status,
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    };
  } catch (error) {
    console.error('Quran proxy error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to fetch from Quran API',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    };
  }
};
