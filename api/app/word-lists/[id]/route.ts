import {
  emptyResponse,
  errorResponse,
  jsonResponse,
  notFoundResponse,
  serverErrorResponse,
} from "@/lib/apiResponses";
import { prisma } from "@/lib/prisma";
import { validateWordListInput } from "@/lib/wordListValidation";

type WordListContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: WordListContext) {
  const { id } = await context.params;

  try {
    const wordList = await prisma.wordList.findUnique({
      where: { id },
      include: {
        words: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!wordList) {
      return notFoundResponse("Word list");
    }

    return jsonResponse({ wordList });
  } catch (error) {
    console.error("Failed to fetch word list", error);
    return serverErrorResponse();
  }
}

export async function PUT(request: Request, context: WordListContext) {
  const { id } = await context.params;
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
    const existingWordList = await prisma.wordList.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingWordList) {
      return notFoundResponse("Word list");
    }

    const wordList = await prisma.$transaction(async (tx) => {
      await tx.wordEntry.deleteMany({
        where: { listId: id },
      });

      return tx.wordList.update({
        where: { id },
        data: {
          name: validation.data.name,
          description: validation.data.description,
          source: validation.data.source,
          words: {
            create: validation.data.words,
          },
        },
        include: {
          words: {
            orderBy: { createdAt: "asc" },
          },
        },
      });
    });

    return jsonResponse({ wordList });
  } catch (error) {
    console.error("Failed to update word list", error);
    return serverErrorResponse();
  }
}

export async function DELETE(_request: Request, context: WordListContext) {
  const { id } = await context.params;

  try {
    const existingWordList = await prisma.wordList.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingWordList) {
      return notFoundResponse("Word list");
    }

    await prisma.wordList.delete({
      where: { id },
    });

    return emptyResponse();
  } catch (error) {
    console.error("Failed to delete word list", error);
    return serverErrorResponse();
  }
}
