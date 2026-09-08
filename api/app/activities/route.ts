import {
  errorResponse,
  jsonResponse,
  serverErrorResponse,
} from "@/lib/apiResponses";
import { validateActivityConfigInput } from "@/lib/activityConfigValidation";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const activities = await prisma.activityConfig.findMany({
      include: {
        wordList: {
          include: {
            words: {
              orderBy: { createdAt: "asc" },
            },
          },
        },
        generatedOutputs: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return jsonResponse({ activities });
  } catch (error) {
    console.error("Failed to fetch activity configurations", error);
    return serverErrorResponse();
  }
}

export async function POST(request: Request) {
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
    const wordList = await prisma.wordList.findUnique({
      where: { id: validation.data.wordListId },
      select: { id: true },
    });

    if (!wordList) {
      return errorResponse("wordListId does not match an existing word list.");
    }

    const activity = await prisma.activityConfig.create({
      data: validation.data,
      include: {
        wordList: {
          include: {
            words: {
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
    });

    return jsonResponse({ activity }, { status: 201 });
  } catch (error) {
    console.error("Failed to create activity configuration", error);
    return serverErrorResponse();
  }
}
