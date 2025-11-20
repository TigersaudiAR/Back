/**
 * Quran Proxy Netlify Function
 * Forwards requests to King Fahd Complex API with proper CORS headers
 * GET /api/quran-proxy?endpoint=/chapters
 */

import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import axios from "axios";

const QURAN_BASE_URL = process.env.VITE_QURAN_BASE || 'https://qurancomplex.gov.sa/quran-dev';
const QURAN_API_KEY = process.env.VITE_QURAN_API_KEY || '';

const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Get the endpoint from query parameters
    const endpoint = event.queryStringParameters?.endpoint || '';
    
    if (!endpoint) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Missing endpoint parameter' }),
      };
    }

    // Build the full URL
    const url = `${QURAN_BASE_URL}${endpoint}`;

    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (QURAN_API_KEY) {
      headers['Authorization'] = `Bearer ${QURAN_API_KEY}`;
    }

    // Forward the request to King Fahd Complex API
    const response = await axios.get(url, {
      headers,
      params: event.queryStringParameters,
      timeout: 10000,
    });

    // Return the response with CORS headers
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    console.error('Quran proxy error:', error);

    if (axios.isAxiosError(error)) {
      return {
        statusCode: error.response?.status || 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: error.message,
          details: error.response?.data,
        }),
      };
    }

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

export { handler };
