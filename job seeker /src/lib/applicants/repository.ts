/**
 * Storage abstraction for applicant records.
 *
 * The current implementation is CsvApplicantRepository
 * (`sql-repository.server.ts`). Swap getApplicantRepository()
 * to return a PostgresApplicantRepository later without changing
 * the frontend or API handlers.
 */
export type {
  Applicant,
  ApplicantInput,
  ApplicantPatch,
  ApplicantRepository,
} from "./types.ts";
