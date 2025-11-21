/**
 * Netlify Function: Quran API Proxy
 * Proxies requests to the King Fahd Complex API with CORS headers
 * Preserves query parameters and forwards API key if configured
 */

import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

const QURAN_BASE_URL = process.env.VITE_QURAN_BASE || "https://qurancomplex.gov.sa/quran-dev";
const API_KEY = process.env.VITE_QURAN_API_KEY || "";

const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  // Only allow GET requests
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
      },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    // Extract path from query or use default
    const path = event.queryStringParameters?.path || "";
    const targetUrl = `${QURAN_BASE_URL}/${path}`;

    // Build query parameters (excluding 'path')
    const queryParams = new URLSearchParams();
    if (event.queryStringParameters) {
      Object.entries(event.queryStringParameters).forEach(([key, value]) => {
        if (key !== "path" && value) {
          queryParams.append(key, value);
        }
      });
    }

    const fullUrl = queryParams.toString()
      ? `${targetUrl}?${queryParams.toString()}`
      : targetUrl;

    // Build headers
    const headers: Record<string, string> = {
      "Accept": "application/json",
    };

    if (API_KEY) {
      headers["X-API-Key"] = API_KEY;
    }

    // Fetch from the Quran Complex API
    const response = await fetch(fullUrl, {
      method: "GET",
      headers,
    });

    const data = await response.text();
    
    // Try to parse as JSON, fallback to text
    const responseBody = data;
    let contentType = "text/plain";
    try {
      JSON.parse(data);
      contentType = "application/json";
    } catch {
      // Not JSON, keep as text
    }

    return {
      statusCode: response.status,
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
        "Cache-Control": "public, max-age=86400", // Cache for 24 hours
      },
      body: responseBody,
    };
  } catch (error) {
    console.error("Proxy error:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        error: "Failed to fetch from Quran API",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
};

export { handler };
