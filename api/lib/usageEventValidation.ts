import { ActivityType, UsageEventType } from "@prisma/client";

export type UsageEventInput = {
  eventType: UsageEventType;
  activityType?: ActivityType;
  durationMs?: number;
};

type ValidationResult =
  | { ok: true; data: UsageEventInput }
  | { ok: false; error: string };

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isUsageEventType(value: unknown): value is UsageEventType {
  return (
    typeof value === "string" &&
    Object.values(UsageEventType).includes(value as UsageEventType)
  );
}

function isActivityType(value: unknown): value is ActivityType {
  return (
    typeof value === "string" &&
    Object.values(ActivityType).includes(value as ActivityType)
  );
}

export function validateUsageEventInput(input: unknown): ValidationResult {
  if (!isObject(input)) {
    return { ok: false, error: "Request body must be an object." };
  }

  if (!isUsageEventType(input.eventType)) {
    return { ok: false, error: "eventType is not supported." };
  }

  if (
    input.activityType !== undefined &&
    !isActivityType(input.activityType)
  ) {
    return {
      ok: false,
      error: "activityType must be WORDLE or WORD_SEARCH.",
    };
  }

  if (
    input.eventType !== UsageEventType.PAGE_VIEW &&
    !isActivityType(input.activityType)
  ) {
    return {
      ok: false,
      error: "activityType is required for this event.",
    };
  }

  if (
    input.eventType === UsageEventType.PAGE_VIEW &&
    (!Number.isInteger(input.durationMs) ||
      (input.durationMs as number) < 0 ||
      (input.durationMs as number) > 86_400_000)
  ) {
    return {
      ok: false,
      error: "PAGE_VIEW durationMs must be an integer from 0 to 86400000.",
    };
  }

  if (
    input.eventType !== UsageEventType.PAGE_VIEW &&
    input.durationMs !== undefined
  ) {
    return {
      ok: false,
      error: "durationMs is only accepted for PAGE_VIEW events.",
    };
  }

  return {
    ok: true,
    data: {
      eventType: input.eventType,
      activityType: input.activityType as ActivityType | undefined,
      durationMs: input.durationMs as number | undefined,
    },
  };
}
