import { parseCsv } from "../src/lib/applicants/csv.server.ts";
import { getCsvPath } from "../src/lib/applicants/paths.server.ts";
import { readFile } from "fs/promises";
import { getSql } from "../src/lib/db.ts";
import { CSV_COLUMNS } from "../src/lib/applicants/constants.ts";

async function run() {
  console.log("Reading CSV...");
  const csvPath = await getCsvPath();
  const fileContents = await readFile(csvPath, "utf-8").catch(() => null);
  
  if (!fileContents) {
    console.log("No CSV found at", csvPath);
    return;
  }

  const records = parseCsv(fileContents, CSV_COLUMNS);
  console.log(`Found ${records.length} records. Migrating...`);
  
  const sql = await getSql();
  let migrated = 0;

  for (const record of records) {
    if (!record.id || !record.email) continue;
    
    // Check if already exists in SQL
    const existing = await sql`SELECT id FROM applicants WHERE email = ${record.email}`;
    if (existing.length > 0) {
      console.log(`Skipping ${record.email} (already exists)`);
      continue;
    }

    try {
      await sql`
        INSERT INTO applicants (
          id, created_at, updated_at, full_name, email, telegram_username, country, city, linkedin_url, github_url, portfolio_url,
          job_categories, target_job_titles, experience_level, years_experience, employment_type, skills,
          work_preference, preferred_locations, salary_min, salary_currency, availability, professional_bio,
          cv_filename, profile_completion, consent, telegram_notifications, email_notifications, notification_frequency,
          minimum_match_score, telegram_chat_id, last_digest_at
        ) VALUES (
          ${record.id}, ${record.created_at}, ${record.updated_at}, ${record.full_name}, ${record.email}, ${record.telegram_username},
          ${record.country}, ${record.city}, ${record.linkedin_url}, ${record.github_url}, ${record.portfolio_url},
          ${record.job_categories ? record.job_categories.split(',') : []},
          ${record.target_job_titles ? record.target_job_titles.split(',') : []},
          ${record.experience_level}, ${record.years_experience},
          ${record.employment_type ? record.employment_type.split(',') : []},
          ${record.skills ? record.skills.split(',') : []},
          ${record.work_preference},
          ${record.preferred_locations ? record.preferred_locations.split(',') : []},
          ${record.salary_min}, ${record.salary_currency}, ${record.availability}, ${record.professional_bio},
          ${record.cv_filename}, ${Number(record.profile_completion || 0)}, ${record.consent === "true"},
          ${record.telegram_notifications !== "false"}, ${record.email_notifications !== "false"},
          ${record.notification_frequency || 'weekly'}, ${Number(record.minimum_match_score || 0)},
          ${record.telegram_chat_id}, ${record.last_digest_at || null}
        )
      `;
      migrated++;
    } catch (err) {
      console.error(`Failed to migrate ${record.email}:`, err);
    }
  }

  console.log(`Successfully migrated ${migrated} out of ${records.length} records.`);
}

run().catch(console.error);
