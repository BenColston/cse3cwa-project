import {
  errorResponse,
  jsonResponse,
  serverErrorResponse,
} from "@/lib/apiResponses";
import { prisma } from "@/lib/prisma";
import { validateUsageEventInput } from "@/lib/usageEventValidation";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse("Request body must be valid JSON.");
  }

  const validation = validateUsageEventInput(body);

  if (!validation.ok) {
    return errorResponse(validation.error);
  }

  try {
    const event = await prisma.usageEvent.create({
      data: validation.data,
    });

    return jsonResponse({ event }, { status: 201 });
  } catch (error) {
    console.error("Failed to record usage event", error);
    return serverErrorResponse();
  }
}
