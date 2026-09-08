import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

const corsHeaders = {
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function applyCorsHeaders(response: NextResponse, origin: string) {
  if (allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }

  response.headers.set("Vary", "Origin");

  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export function proxy(request: NextRequest) {
  const origin = request.headers.get("origin") ?? "";

  if (request.method === "OPTIONS") {
    return applyCorsHeaders(new NextResponse(null, { status: 204 }), origin);
  }

  return applyCorsHeaders(NextResponse.next(), origin);
}

export const config = {
  matcher: ["/health", "/word-lists/:path*", "/activities/:path*"],
};
