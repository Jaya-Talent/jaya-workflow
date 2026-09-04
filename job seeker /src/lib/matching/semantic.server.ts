import type { ApplicantLike, Job, MatchResult } from "./types.ts";

const MAX_AI_PER_RUN = 5;
let usedThisRun = 0;

export function resetSemanticBudget() {
  usedThisRun = 0;
}

export async function maybeEnhanceExplanation(
  applicant: ApplicantLike,
  job: Job,
  result: MatchResult,
): Promise<string> {
  if (result.score < 75) return result.explanation;
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return result.explanation;
  if (usedThisRun >= MAX_AI_PER_RUN) return result.explanation;
  usedThisRun += 1;

  try {
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: 180,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "You write one short paragraph explaining why a candidate matches a job. Be concrete. Do not invent skills they do not have. Return plain text only.",
          },
          {
            role: "user",
            content: `Candidate: ${applicant.full_name}
Skills: ${applicant.skills.join(", ")}
Titles: ${applicant.target_job_titles.join(", ")}
Bio: ${applicant.professional_bio.slice(0, 400)}
Job: ${job.title} at ${job.company}
Required: ${job.required_skills.join(", ")}
Description: ${job.description.slice(0, 500)}
Deterministic score: ${result.score}%
Matched skills: ${result.matchedSkills.join(", ")}`,
          },
        ],
      }),
    });
    if (!response.ok) return result.explanation;
    const body = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const text = body.choices?.[0]?.message?.content?.trim();
    if (!text) return result.explanation;
    return `${result.explanation}\n\n${text}`;
  } catch {
    return result.explanation;
  }
}
