"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { recordUsageEvent } from "@/lib/apiClient";

function activityTypeForPath(pathname: string) {
  if (pathname === "/wordle") {
    return "WORDLE" as const;
  }

  if (pathname === "/word-search") {
    return "WORD_SEARCH" as const;
  }

  return null;
}

export function PageUsageTracker() {
  const pathname = usePathname();
  const pendingFlush = useRef<{
    pathname: string;
    timeoutId: number;
  } | null>(null);

  useEffect(() => {
    const pending = pendingFlush.current;

    if (pending?.pathname === pathname) {
      window.clearTimeout(pending.timeoutId);
      pendingFlush.current = null;
    }

    let elapsedMs = 0;
    let visibleSince =
      document.visibilityState === "visible" ? performance.now() : null;
    let flushed = false;
    const activityType = activityTypeForPath(pathname);
    const activityTimer = window.setTimeout(() => {
      if (activityType) {
        void recordUsageEvent({
          eventType: "ACTIVITY_USED",
          activityType,
        });
      }
    }, 0);

    function updateVisibility() {
      const now = performance.now();

      if (document.visibilityState === "hidden" && visibleSince !== null) {
        elapsedMs += now - visibleSince;
        visibleSince = null;
      } else if (
        document.visibilityState === "visible" &&
        visibleSince === null
      ) {
        visibleSince = now;
      }
    }

    function flushPageDuration() {
      if (flushed) {
        return;
      }

      flushed = true;

      if (visibleSince !== null) {
        elapsedMs += performance.now() - visibleSince;
        visibleSince = null;
      }

      void recordUsageEvent(
        {
          eventType: "PAGE_VIEW",
          durationMs: Math.min(86_400_000, Math.max(0, Math.round(elapsedMs))),
        },
        true,
      );
    }

    document.addEventListener("visibilitychange", updateVisibility);
    window.addEventListener("pagehide", flushPageDuration);

    return () => {
      window.clearTimeout(activityTimer);
      document.removeEventListener("visibilitychange", updateVisibility);
      window.removeEventListener("pagehide", flushPageDuration);

      const timeoutId = window.setTimeout(() => {
        flushPageDuration();

        if (pendingFlush.current?.timeoutId === timeoutId) {
          pendingFlush.current = null;
        }
      }, 0);

      pendingFlush.current = { pathname, timeoutId };
    };
  }, [pathname]);

  return null;
}
