import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { scoreMatch } from "./engine.ts";
import type { ApplicantLike, Job } from "./types.ts";

function applicant(overrides: Partial<ApplicantLike> = {}): ApplicantLike {
  return {
    id: "a1",
    full_name: "Test Applicant",
    skills: [],
    target_job_titles: [],
    experience_level: "Mid-Level",
    years_experience: "3–5",
    employment_type: ["Full-time"],
    work_preference: "Remote",
    preferred_locations: ["Remote"],
    country: "Rwanda",
    city: "Kigali",
    salary_min: "",
    salary_currency: "USD",
    job_categories: ["Web3 / Blockchain"],
    professional_bio: "",
    availability: "Immediately",
    ...overrides,
  };
}

function job(overrides: Partial<Job> = {}): Job {
  return {
    id: "j1",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    title: "Engineer",
    company: "Example",
    location: "Remote",
    remote: "remote",
    employment_type: "Full-time",
    seniority: "Mid-Level",
    years_min: "2",
    years_max: "5",
    salary_min: "",
    salary_max: "",
    salary_currency: "USD",
    category: "Web3 / Blockchain",
    required_skills: [],
    preferred_skills: [],
    technologies: [],
    description: "",
    apply_url: "https://example.com/apply",
    status: "active",
    source: "seed",
    ...overrides,
  };
}

describe("matching engine", () => {
  it("scores a solidity / foundry / evm remote role as a high match", () => {
    const result = scoreMatch(
      applicant({
        skills: ["Solidity", "Foundry", "EVM"],
        years_experience: "3",
        target_job_titles: ["Solidity Engineer"],
        experience_level: "Mid-Level",
        work_preference: "Remote",
        preferred_locations: ["Remote"],
      }),
      job({
        title: "Smart Contract Engineer",
        required_skills: ["Solidity", "Foundry", "EVM"],
        preferred_skills: ["Smart Contracts"],
        years_min: "3",
        seniority: "Mid-Level",
        remote: "remote",
        location: "Remote",
      }),
    );
    assert.ok(result.score > 90, `expected >90, got ${result.score}`);
    assert.match(result.explanation, /solidity/i);
    assert.ok(result.matchedSkills.includes("solidity"));
  });

  it("scores a frontend applicant against a solidity role as a low match", () => {
    const result = scoreMatch(
      applicant({
        skills: ["React", "TypeScript"],
        target_job_titles: ["Frontend Developer"],
        job_categories: ["Software Engineering"],
        experience_level: "Mid-Level",
      }),
      job({
        title: "Senior Solidity Engineer",
        required_skills: ["Solidity", "Foundry", "EVM"],
        seniority: "Senior",
        category: "Web3 / Blockchain",
      }),
    );
    assert.ok(result.score < 50, `expected low match, got ${result.score}`);
  });

  it("scores a solana / rust / anchor applicant highly for a solana rust role", () => {
    const result = scoreMatch(
      applicant({
        skills: ["Solana", "Rust", "Anchor"],
        target_job_titles: ["Solana Rust Engineer"],
        experience_level: "Senior",
        years_experience: "5–8",
      }),
      job({
        title: "Solana Rust Engineer",
        required_skills: ["Solana", "Rust"],
        preferred_skills: ["Anchor"],
        seniority: "Senior",
        years_min: "4",
      }),
    );
    assert.ok(result.score > 88, `expected high match, got ${result.score}`);
  });

  it("applies a significant penalty for remote-only vs on-site-only", () => {
    const remoteJob = scoreMatch(
      applicant({ work_preference: "Remote", preferred_locations: ["Remote"] }),
      job({ remote: "remote", location: "Remote" }),
    );
    const onsiteJob = scoreMatch(
      applicant({ work_preference: "Remote", preferred_locations: ["Remote"] }),
      job({
        remote: "onsite",
        location: "New York, United States",
      }),
    );
    assert.ok(
      remoteJob.breakdown.location - onsiteJob.breakdown.location >= 50,
      `location scores ${remoteJob.breakdown.location} vs ${onsiteJob.breakdown.location}`,
    );
    assert.ok(onsiteJob.score < remoteJob.score);
  });

  it("treats React.js as React and related roles as close", () => {
    const result = scoreMatch(
      applicant({
        skills: ["React"],
        target_job_titles: ["Frontend Developer"],
        job_categories: ["Software Engineering"],
      }),
      job({
        title: "Frontend Engineer",
        required_skills: ["React.js"],
        category: "Software Engineering",
      }),
    );
    assert.ok(result.matchedSkills.includes("react"));
    assert.ok(result.score >= 70);
  });

  it("gives a semantic boost when DeFi / AMM language overlaps", () => {
    const withOverlap = scoreMatch(
      applicant({
        skills: ["Solidity"],
        professional_bio: "Built decentralized exchanges and DeFi protocols.",
        target_job_titles: ["Smart Contract Engineer"],
      }),
      job({
        title: "Smart Contract Engineer",
        required_skills: ["Solidity"],
        description: "Experience developing AMMs and decentralized financial protocols.",
      }),
    );
    const without = scoreMatch(
      applicant({
        skills: ["Solidity"],
        professional_bio: "Writes contracts.",
        target_job_titles: ["Smart Contract Engineer"],
      }),
      job({
        title: "Smart Contract Engineer",
        required_skills: ["Solidity"],
        description: "Experience developing AMMs and decentralized financial protocols.",
      }),
    );
    assert.ok(withOverlap.breakdown.other > without.breakdown.other);
  });
});
