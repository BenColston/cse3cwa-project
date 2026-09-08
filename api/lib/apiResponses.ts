export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return Response.json(body, {
    ...init,
    headers: {
      ...corsHeaders,
      ...init.headers,
    },
  });
}

export function emptyResponse(status = 204) {
  return new Response(null, {
    status,
    headers: corsHeaders,
  });
}

export function errorResponse(message: string, status = 400) {
  return jsonResponse({ error: message }, { status });
}

export function notFoundResponse(resource = "Resource") {
  return errorResponse(`${resource} not found.`, 404);
}

export function serverErrorResponse() {
  return errorResponse("An unexpected server error occurred.", 500);
}
