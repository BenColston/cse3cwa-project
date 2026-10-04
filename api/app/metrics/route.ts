import { jsonResponse, serverErrorResponse } from "@/lib/apiResponses";
import { prisma } from "@/lib/prisma";
import { ActivityType, UsageEventType } from "@prisma/client";

export async function GET() {
  try {
    const [
      wordLists,
      activitiesByType,
      generatedOutputs,
      successfulGenerations,
      failedGenerations,
      pageDuration,
      activityUsage,
    ] = await Promise.all([
      prisma.wordList.count(),
      prisma.activityConfig.groupBy({
        by: ["type"],
        _count: { _all: true },
      }),
      prisma.generatedOutput.count(),
      prisma.usageEvent.count({
        where: { eventType: UsageEventType.GENERATION_SUCCEEDED },
      }),
      prisma.usageEvent.count({
        where: { eventType: UsageEventType.GENERATION_FAILED },
      }),
      prisma.usageEvent.aggregate({
        where: {
          eventType: UsageEventType.PAGE_VIEW,
          durationMs: { not: null },
        },
        _avg: { durationMs: true },
        _count: { _all: true },
      }),
      prisma.usageEvent.groupBy({
        by: ["activityType"],
        where: {
          eventType: UsageEventType.ACTIVITY_USED,
          activityType: { not: null },
        },
        _count: { _all: true },
      }),
    ]);

    const usageByType = activityUsage
      .flatMap((usage) =>
        usage.activityType === null
          ? []
          : [{ type: usage.activityType, count: usage._count._all }],
      )
      .sort((left, right) => right.count - left.count);

    const createdByType = Object.fromEntries(
      Object.values(ActivityType).map((type) => [
        type,
        activitiesByType.find((activity) => activity.type === type)?._count
          ._all ?? 0,
      ]),
    );

    return jsonResponse({
      wordLists,
      activitiesCreated: activitiesByType.reduce(
        (total, activity) => total + activity._count._all,
        0,
      ),
      activitiesCreatedByType: createdByType,
      activityUsageByType: usageByType,
      mostUsedActivityType: usageByType[0]?.type ?? null,
      successfulGenerations,
      failedGenerations,
      totalGeneratedOutputs: generatedOutputs,
      averageTimeOnPageMs: Math.round(pageDuration._avg.durationMs ?? 0),
      pagesMeasured: pageDuration._count._all,
    });
  } catch (error) {
    console.error("Failed to fetch operational metrics", error);
    return serverErrorResponse();
  }
}
