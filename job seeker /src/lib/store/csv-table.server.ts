import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseCsv, serializeCsv } from "../applicants/csv.server.ts";
import { getDataDir } from "../applicants/paths.server.ts";

const locks = new Map<string, Promise<unknown>>();

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
    return parseCsv(text);
  } catch {
    return [];
  }
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
    await readFile(filePath, "utf8");
  } catch {
    await writeFile(filePath, serializeCsv(columns, []), "utf8");
  }
}
