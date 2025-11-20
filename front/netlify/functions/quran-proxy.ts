/**
 * Quran Proxy Netlify Function
 * CORS proxy for Quran Complex API requests
 */

import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

const QURAN_COMPLEX_API = process.env.VITE_QURAN_BASE || 'https://qurancomplex.gov.sa/quran-dev';
const QURAN_API_FALLBACK = 'https://api.quran.com/api/v4';
const API_KEY = process.env.VITE_QURAN_API_KEY;

interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
      headers: {
        'Content-Type': 'application/json',
        'Allow': 'GET',
      },
    };
  }

  try {
    // Extract the API path from query parameters
    const { path, source = 'quran-api' } = event.queryStringParameters || {};

    if (!path) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Bad Request',
          message: 'Missing required parameter: path',
        } as ErrorResponse),
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }

    // Choose API based on source parameter
    const baseUrl = source === 'quran-complex' ? QURAN_COMPLEX_API : QURAN_API_FALLBACK;
    const url = `${baseUrl}${path}`;

    // Build headers
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };

    // Add API key if available and needed
    if (API_KEY && source === 'quran-complex') {
      headers['Authorization'] = `Bearer ${API_KEY}`;
    }

    // Forward other query parameters (excluding path and source)
    const otherParams = { ...event.queryStringParameters };
    delete otherParams.path;
    delete otherParams.source;
    
    const queryString = new URLSearchParams(otherParams).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;

    // Make the request
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: 'API Error',
          message: `Upstream API returned ${response.status}`,
          statusCode: response.status,
        } as ErrorResponse),
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    };
  } catch (error) {
    console.error('Quran proxy error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
        statusCode: 500,
      } as ErrorResponse),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }
};

export { handler };
