import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

/**
 * Quran Proxy Netlify Function
 * Forwards requests to King Fahd Complex API with proper headers
 */
const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
      body: '',
    };
  }

  try {
    const { path = '' } = event.queryStringParameters || {};
    
    if (!path) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Missing path parameter' }),
      };
    }

    // Construct API URL
    const apiBase = process.env.VITE_QURAN_BASE || 'https://qurancomplex.gov.sa/quran-dev';
    const apiUrl = `${apiBase}${path}`;

    // Prepare headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add API key if available
    if (process.env.VITE_QURAN_API_KEY) {
      headers['Authorization'] = `Bearer ${process.env.VITE_QURAN_API_KEY}`;
    }

    // Forward request to Quran API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers,
    });

    const data = await response.json();

    return {
      statusCode: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Quran proxy error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Failed to fetch from Quran API',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};

export { handler };
