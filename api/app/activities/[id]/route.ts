import {
  emptyResponse,
  errorResponse,
  jsonResponse,
  notFoundResponse,
  serverErrorResponse,
} from "@/lib/apiResponses";
import { validateActivityConfigInput } from "@/lib/activityConfigValidation";
import { prisma } from "@/lib/prisma";

type ActivityContext = {
  params: Promise<{
    id: string;
  }>;
};

const activityInclude = {
  wordList: {
    include: {
      words: {
        orderBy: { createdAt: "asc" as const },
      },
    },
  },
  generatedOutputs: {
    orderBy: { createdAt: "desc" as const },
  },
};

export async function GET(_request: Request, context: ActivityContext) {
  const { id } = await context.params;

  try {
    const activity = await prisma.activityConfig.findUnique({
      where: { id },
      include: activityInclude,
    });

    if (!activity) {
      return notFoundResponse("Activity configuration");
    }

    return jsonResponse({ activity });
  } catch (error) {
    console.error("Failed to fetch activity configuration", error);
    return serverErrorResponse();
  }
}

export async function PUT(request: Request, context: ActivityContext) {
  const { id } = await context.params;
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse("Request body must be valid JSON.");
  }

  const validation = validateActivityConfigInput(body);

  if (!validation.ok) {
    return errorResponse(validation.error);
  }

  try {
    const existingActivity = await prisma.activityConfig.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingActivity) {
      return notFoundResponse("Activity configuration");
    }

    const wordList = await prisma.wordList.findUnique({
      where: { id: validation.data.wordListId },
      select: { id: true },
    });

    if (!wordList) {
      return errorResponse("wordListId does not match an existing word list.");
    }

    const activity = await prisma.activityConfig.update({
      where: { id },
      data: validation.data,
      include: activityInclude,
    });

    return jsonResponse({ activity });
  } catch (error) {
    console.error("Failed to update activity configuration", error);
    return serverErrorResponse();
  }
}

export async function DELETE(_request: Request, context: ActivityContext) {
  const { id } = await context.params;

  try {
    const existingActivity = await prisma.activityConfig.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingActivity) {
      return notFoundResponse("Activity configuration");
    }

    await prisma.activityConfig.delete({
      where: { id },
    });

    return emptyResponse();
  } catch (error) {
    console.error("Failed to delete activity configuration", error);
    return serverErrorResponse();
  }
}
