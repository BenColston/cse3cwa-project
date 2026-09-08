import {
  errorResponse,
  jsonResponse,
  serverErrorResponse,
} from "@/lib/apiResponses";
import { prisma } from "@/lib/prisma";
import { validateWordListInput } from "@/lib/wordListValidation";

export async function GET() {
  try {
    const wordLists = await prisma.wordList.findMany({
      include: {
        words: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return jsonResponse({ wordLists });
  } catch (error) {
    console.error("Failed to fetch word lists", error);
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

  const validation = validateWordListInput(body);

  if (!validation.ok) {
    return errorResponse(validation.error);
  }

  try {
    const wordList = await prisma.wordList.create({
      data: {
        name: validation.data.name,
        description: validation.data.description,
        source: validation.data.source,
        words: {
          create: validation.data.words,
        },
      },
      include: { words: true },
    });

    return jsonResponse({ wordList }, { status: 201 });
  } catch (error) {
    console.error("Failed to create word list", error);
    return serverErrorResponse();
  }
}
