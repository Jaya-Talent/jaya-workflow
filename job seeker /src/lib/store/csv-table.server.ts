import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseCsv, serializeCsv } from "../applicants/csv.server.ts";
import { getDataDir } from "../applicants/paths.server.ts";

const locks = new Map<string, Promise<unknown>>();

// Server-only CSV disk and seed access
function getInlinedSeedCsv(_filename: string): string | null {
  return null;
}

export function withFileLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const prev = locks.get(key) ?? Promise.resolve();
  const run = prev.then(fn, fn);
  locks.set(
    key,
    run.then(
      () => undefined,
      () => undefined,
    ),
  );
  return run;
}

export async function dataFile(filename: string) {
  const dir = await getDataDir();
  await mkdir(dir, { recursive: true });
  return path.join(dir, filename);
}

export async function readCsvFile(filename: string): Promise<Record<string, string>[]> {
  const filePath = await dataFile(filename);
  try {
    const text = await readFile(filePath, "utf8");
    const records = parseCsv(text);
    if (records.length > 0) return records;
  } catch {
    // Ignore and fallback to seed file
  }

  // 1. Fallback to inlined build-time seed CSV (Vercel serverless compatible)
  const inlinedText = getInlinedSeedCsv(filename);
  if (inlinedText && inlinedText.trim()) {
    const records = parseCsv(inlinedText);
    if (records.length > 0) return records;
  }

  // 2. Fallback to reading disk seed CSV from process.cwd() candidate paths
  const candidateSeedPaths = [
    path.resolve(process.cwd(), "data", filename),
    path.resolve(process.cwd(), "..", "data", filename),
    path.resolve(process.cwd(), "job seeker ", "data", filename),
    path.resolve(process.cwd(), "job seeker", "data", filename),
    path.resolve(__dirname, "..", "..", "..", "data", filename),
  ];
  for (const seedPath of candidateSeedPaths) {
    try {
      const seedText = await readFile(seedPath, "utf8");
      const records = parseCsv(seedText);
      if (records.length > 0) return records;
    } catch {
      // try next candidate
    }
  }

  return [];
}

export async function writeCsvFile(
  filename: string,
  columns: readonly string[],
  records: Record<string, string>[],
) {
  const filePath = await dataFile(filename);
  await writeFile(filePath, serializeCsv(columns, records), "utf8");
}

export async function ensureCsvFile(filename: string, columns: readonly string[]) {
  const filePath = await dataFile(filename);
  try {
    const text = await readFile(filePath, "utf8");
    const parsed = parseCsv(text);
    if (parsed.length > 0) return;
  } catch {
    // File missing or unreadable
  }

  // Check inlined seed CSV first
  const inlinedText = getInlinedSeedCsv(filename);
  if (inlinedText && inlinedText.trim()) {
    try {
      await writeFile(filePath, inlinedText, "utf8");
      return;
    } catch {
      // Ignore write errors in read-only filesystems
    }
  }

  // Copy bundled seed CSV from process.cwd()/data if available
  const seedPath = path.resolve(process.cwd(), "data", filename);
  try {
    const seedText = await readFile(seedPath, "utf8");
    if (seedText.trim()) {
      await writeFile(filePath, seedText, "utf8");
      return;
    }
  } catch {
    // Seed file missing or unreadable
  }

  try {
    await writeFile(filePath, serializeCsv(columns, []), "utf8");
  } catch {
    // Read-only filesystem safe guard
  }
}
