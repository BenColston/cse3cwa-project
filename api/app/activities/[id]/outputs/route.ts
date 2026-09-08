import {
  errorResponse,
  jsonResponse,
  notFoundResponse,
  serverErrorResponse,
} from "@/lib/apiResponses";
import { validateGeneratedOutputInput } from "@/lib/generatedOutputValidation";
import { prisma } from "@/lib/prisma";

type ActivityOutputContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: ActivityOutputContext) {
  const { id } = await context.params;

  try {
    const activity = await prisma.activityConfig.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!activity) {
      return notFoundResponse("Activity configuration");
    }

    const outputs = await prisma.generatedOutput.findMany({
      where: { activityId: id },
      orderBy: { createdAt: "desc" },
    });

    return jsonResponse({ outputs });
  } catch (error) {
    console.error("Failed to fetch generated outputs", error);
    return serverErrorResponse();
  }
}

export async function POST(request: Request, context: ActivityOutputContext) {
  const { id } = await context.params;
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse("Request body must be valid JSON.");
  }

  const validation = validateGeneratedOutputInput(body);

  if (!validation.ok) {
    return errorResponse(validation.error);
  }

  try {
    const activity = await prisma.activityConfig.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!activity) {
      return notFoundResponse("Activity configuration");
    }

    const output = await prisma.generatedOutput.create({
      data: {
        ...validation.data,
        activityId: id,
      },
    });

    return jsonResponse({ output }, { status: 201 });
  } catch (error) {
    console.error("Failed to create generated output", error);
    return serverErrorResponse();
  }
}
