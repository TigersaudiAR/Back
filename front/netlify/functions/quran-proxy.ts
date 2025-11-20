/**
 * Netlify Function: Quran API Proxy
 * 
 * Forwards requests to the King Fahd Complex API
 * Handles CORS and adds optional API key if configured
 */

import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

const QURAN_API_BASE = process.env.VITE_QURAN_BASE || 'https://qurancomplex.gov.sa/quran-dev';
const QURAN_API_KEY = process.env.VITE_QURAN_API_KEY;

export const handler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext
) => {
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
    // Extract the path from the request
    const path = event.path.replace('/.netlify/functions/quran-proxy', '');
    const queryString = event.queryStringParameters
      ? '?' + new URLSearchParams(event.queryStringParameters).toString()
      : '';

    // Build the target URL
    const targetUrl = `${QURAN_API_BASE}${path}${queryString}`;

    console.log('Proxying request to:', targetUrl);

    // Prepare headers
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'User-Agent': 'QuranCareem-Educational-Platform/1.0',
    };

    // Add API key if configured
    if (QURAN_API_KEY) {
      headers['Authorization'] = `Bearer ${QURAN_API_KEY}`;
    }

    // Make the request
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers,
    });

    const data = await response.text();
    let jsonData;
    
    try {
      jsonData = JSON.parse(data);
    } catch {
      // If response is not JSON, return as text
      jsonData = { data };
    }

    return {
      statusCode: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
      body: JSON.stringify(jsonData),
    };
  } catch (error) {
    console.error('Proxy error:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({
        error: 'Failed to fetch from Quran API',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
