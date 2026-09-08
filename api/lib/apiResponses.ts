export function errorResponse(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export function notFoundResponse(resource = "Resource") {
  return errorResponse(`${resource} not found.`, 404);
}

export function serverErrorResponse() {
  return errorResponse("An unexpected server error occurred.", 500);
}
