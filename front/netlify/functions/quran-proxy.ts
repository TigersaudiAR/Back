/**
 * Netlify Function: Quran API Proxy
 * Proxies requests to King Fahd Complex Quran API
 * المصدر المعتمد: https://qurancomplex.gov.sa/quran-dev/
 */

import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

const QURAN_BASE = process.env.VITE_QURAN_BASE || 'https://qurancomplex.gov.sa/quran-dev';
const API_KEY = process.env.VITE_QURAN_API_KEY || '';

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
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
    // Get query parameters
    const params = event.queryStringParameters || {};
    const endpoint = params.endpoint || '';
    
    // Remove the endpoint param from query string
    delete params.endpoint;

    // Build query string
    const queryString = new URLSearchParams(params).toString();
    const url = `${QURAN_BASE}/${endpoint}${queryString ? `?${queryString}` : ''}`;

    console.log(`Proxying request to: ${url}`);

    // Make request to Quran Complex API
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };

    // Add API key if available
    if (API_KEY) {
      headers['Authorization'] = `Bearer ${API_KEY}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    const data = await response.json();

    return {
      statusCode: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Error proxying request:', error);
    
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
