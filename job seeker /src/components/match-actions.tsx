import { useState } from "react";
import { Button } from "@/components/ui";

const REASONS = [
  "Wrong experience",
  "Wrong location",
  "Wrong role",
  "Salary",
  "Already applied",
  "Other",
];

export async function recordMatchAction(input: {
  applicant_id: string;
  job_id: string;
  match_id?: string;
  action: "view" | "click" | "save" | "apply" | "not_relevant" | "dismiss" | "feedback";
  detail?: string;
}) {
  await fetch("/api/matches/actions", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function MatchActions({
  applicantId,
  jobId,
  matchId,
  applyUrl,
  onChanged,
}: {
  applicantId: string;
  jobId: string;
  matchId?: string;
  applyUrl?: string;
  onChanged?: (action: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState("");

  function act(action: "save" | "apply" | "not_relevant", detail?: string) {
    setBusy(action);
    
    // For apply action, open target link synchronously before async fetch to preserve user gesture
    if (action === "apply" && applyUrl) {
      window.open(applyUrl, "_blank", "noopener,noreferrer");
    }

    // Record action asynchronously in background
    void recordMatchAction({
      applicant_id: applicantId,
      job_id: jobId,
      match_id: matchId,
      action,
      detail,
    }).finally(() => {
      setBusy("");
      setOpen(false);
      onChanged?.(action);
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        {applyUrl ? (
          <a
            href={applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              // Fire analytics in background
              void recordMatchAction({
                applicant_id: applicantId,
                job_id: jobId,
                match_id: matchId,
                action: "apply",
              });
              onChanged?.("apply");
            }}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-fg hover:bg-accent-hover transition-colors shadow-xs"
          >
            Apply now
          </a>
        ) : (
          <Button size="sm" disabled={busy === "apply"} onClick={() => act("apply")}>
            Apply now
          </Button>
        )}
        <Button size="sm" variant="secondary" disabled={busy === "save"} onClick={() => act("save")}>
          Save
        </Button>
        <Button size="sm" variant="outline" disabled={busy === "not_relevant"} onClick={() => setOpen((v) => !v)}>
          Not relevant
        </Button>
      </div>
      {open && (
        <div className="flex flex-wrap gap-2">
          {REASONS.map((reason) => (
            <button
              key={reason}
              type="button"
              className="rounded-full bg-surface-muted px-3 py-2 text-xs font-medium text-ink hover:bg-line"
              onClick={() => void act("not_relevant", reason)}
            >
              {reason}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}