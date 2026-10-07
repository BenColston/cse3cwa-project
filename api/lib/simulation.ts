import { Prisma, UsageEventType, ActivityType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const simulationBatchId = "classroom-demo-v1";

// Retrying serializable transactions keeps concurrent create/cleanup requests atomic.
export async function simulationTransaction<T>(work: (tx: Prisma.TransactionClient) => Promise<T>) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await prisma.$transaction(work, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      });
    } catch (error) {
      const retryable = error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === "P2034" || error.code === "P2002");
      if (!retryable || attempt >= 2) throw error;
    }
  }
}

export async function createSimulation() {
  return simulationTransaction(async (tx) => {
    if (await tx.simulationBatch.findUnique({ where: { id: simulationBatchId } })) {
      return false;
    }
    await tx.simulationBatch.create({ data: { id: simulationBatchId } });
    const list = await tx.wordList.create({
      data: {
        name: "[Simulated] Classroom phoneme list",
        description: "Demonstration content, not teacher-created classroom records.",
        source: "Simulated demonstration dataset v1",
        simulationBatchId,
        words: { create: [
          { word: "thin", phonemes: ["θ", "ɪ", "n"], hint: "TH as in thin" },
          { word: "ship", phonemes: ["ʃ", "ɪ", "p"], hint: "SH as in ship" },
          { word: "tin", phonemes: ["t", "ɪ", "n"] },
          { word: "jam", phonemes: ["dʒ", "æ", "m"], hint: "J as in jam" },
          { word: "sing", phonemes: ["s", "ɪ", "ŋ"], hint: "NG as in sing" },
        ] },
      },
    });
    await tx.activityConfig.createMany({ data: [
      {
        name: "[Simulated] Wordle classroom activity", type: "WORDLE", difficulty: "EASY",
        wordListId: list.id, simulationBatchId,
        settings: { targetEnglish: "thin", targetPhonemes: ["θ", "ɪ", "n"], maxGuesses: 6, sourceName: list.name },
      },
      {
        name: "[Simulated] Word Search classroom activity", type: "WORD_SEARCH", difficulty: "CUSTOM",
        wordListId: list.id, simulationBatchId,
        settings: { rows: 8, cols: 8, wordCount: 5, sourceName: list.name },
      },
    ] });
    const events: Prisma.UsageEventCreateManyInput[] = [
      ...[10000, 30000, 50000].map((durationMs) => ({ eventType: UsageEventType.PAGE_VIEW, durationMs, simulationBatchId })),
    ];
    for (const [activityType, visits, successes] of [
      [ActivityType.WORDLE, 3, 2], [ActivityType.WORD_SEARCH, 5, 3],
    ] as const) {
      for (let i = 0; i < visits; i++) events.push({ eventType: UsageEventType.ACTIVITY_USED, activityType, simulationBatchId });
      for (let i = 0; i < successes; i++) events.push({ eventType: UsageEventType.GENERATION_SUCCEEDED, activityType, simulationBatchId });
    }
    events.push({ eventType: UsageEventType.GENERATION_FAILED, activityType: ActivityType.WORD_SEARCH, simulationBatchId });
    await tx.usageEvent.createMany({ data: events });
    return true;
  });
}

export async function removeSimulation() {
  return simulationTransaction(async (tx) => {
    const teacherDependencies = await tx.activityConfig.count({
      where: {
        wordList: { simulationBatchId },
        OR: [{ simulationBatchId: null }, { simulationBatchId: { not: simulationBatchId } }],
      },
    });
    if (teacherDependencies > 0) return false;
    await tx.simulationBatch.deleteMany({ where: { id: simulationBatchId } });
    return true;
  });
}
