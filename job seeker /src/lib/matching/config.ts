import type { MatchingWeights, ScoreCategory } from "./types.ts";

function envNumber(name: string, fallback: number) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

export function getMatchingWeights(): MatchingWeights {
  return {
    skills: envNumber("MATCH_WEIGHT_SKILLS", 30),
    experience: envNumber("MATCH_WEIGHT_EXPERIENCE", 20),
    title: envNumber("MATCH_WEIGHT_TITLE", 15),
    seniority: envNumber("MATCH_WEIGHT_SENIORITY", 10),
    location: envNumber("MATCH_WEIGHT_LOCATION", 10),
    employment: envNumber("MATCH_WEIGHT_EMPLOYMENT", 5),
    salary: envNumber("MATCH_WEIGHT_SALARY", 5),
    other: envNumber("MATCH_WEIGHT_OTHER", 5),
  };
}

export function getNotificationThreshold() {
  return envNumber("MATCH_NOTIFICATION_THRESHOLD", 75);
}

export function getTelegramThreshold() {
  return envNumber("TELEGRAM_NOTIFICATION_THRESHOLD", getNotificationThreshold());
}

export function getEmailThreshold() {
  return envNumber("EMAIL_NOTIFICATION_THRESHOLD", 80);
}

export function getInstantThreshold() {
  return envNumber("MATCH_INSTANT_THRESHOLD", 90);
}

export function getMatchingIntervalMinutes() {
  return Math.max(5, envNumber("MATCHING_INTERVAL_MINUTES", 30));
}

export function scoreCategory(score: number): ScoreCategory {
  if (score >= 95) return "excellent";
  if (score >= 85) return "strong";
  if (score >= 70) return "good";
  if (score >= 50) return "possible";
  return "poor";
}

export function categoryLabel(category: ScoreCategory) {
  switch (category) {
    case "excellent":
      return "Excellent Match";
    case "strong":
      return "Strong Match";
    case "good":
      return "Good Match";
    case "possible":
      return "Possible Match";
    default:
      return "Poor Match";
  }
}

export const DEFAULT_WEIGHTS: MatchingWeights = {
  skills: 30,
  experience: 20,
  title: 15,
  seniority: 10,
  location: 10,
  employment: 5,
  salary: 5,
  other: 5,
};
