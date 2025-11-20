/**
 * Netlify Function: Quran Proxy
 * Proxies requests to King Fahd Complex API
 * Handles CORS and adds API key if available
 */

import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import axios from 'axios';

const QURAN_BASE_URL = process.env.VITE_QURAN_BASE || 'https://qurancomplex.gov.sa/quran-dev';
const QURAN_API_KEY = process.env.VITE_QURAN_API_KEY || '';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Extract path from query parameters
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
    const targetUrl = `${QURAN_BASE_URL}${path}`;
    
    // Prepare request headers
    const headers: any = {
      'User-Agent': 'QuranCareem-Edu-Platform/1.0',
    };
    
    if (QURAN_API_KEY) {
      headers['X-API-Key'] = QURAN_API_KEY;
    }

    // Forward other query parameters
    const params = { ...event.queryStringParameters };
    delete params.path;

    // Make request to King Fahd Complex API
    const response = await axios.get(targetUrl, {
      headers,
      params,
      timeout: 10000, // 10 seconds timeout
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
      body: JSON.stringify(response.data),
    };
  } catch (error: any) {
    console.error('Quran proxy error:', error.message);
    
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || error.message || 'Internal server error';

    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      }),
    };
  }
};

export { handler };
