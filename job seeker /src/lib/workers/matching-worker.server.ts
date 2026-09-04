import { getMatchingIntervalMinutes } from "../matching/config.ts";
import { runMatchingCycle } from "../matching/pipeline.server.ts";

let started = false;

export function ensureMatchingWorker() {
  if (started) return;
  if (process.env.MATCHING_WORKER === "0") return;
  started = true;
  const minutes = getMatchingIntervalMinutes();
  const interval = Math.max(5, minutes) * 60 * 1000;
  console.info(`[matching-worker] interval ${minutes}m`);
  setInterval(() => {
    void runMatchingCycle()
      .then((result) => {
        console.info("[matching-worker]", result);
      })
      .catch((error) => {
        console.error("[matching-worker]", error instanceof Error ? error.message : error);
      });
  }, interval);
}
