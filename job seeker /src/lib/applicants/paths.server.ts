import { access, constants, mkdir } from "node:fs/promises";
import path from "node:path";

let cachedDir: string | null = null;

async function canWrite(dir: string) {
  try {
    await mkdir(dir, { recursive: true });
    await access(dir, constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

export async function getDataDir() {
  if (cachedDir) return cachedDir;
  const candidates = [
    process.env.DATA_DIR,
    path.resolve(process.cwd(), "data"),
    "/tmp/meridian-data",
  ].filter((value): value is string => Boolean(value));

  for (const dir of candidates) {
    if (await canWrite(dir)) {
      cachedDir = dir;
      return dir;
    }
  }

  cachedDir = path.resolve(process.cwd(), "data");
  await mkdir(cachedDir, { recursive: true });
  return cachedDir;
}

export async function getCsvPath() {
  return path.join(await getDataDir(), "applicants.csv");
}

export async function getCvDir() {
  const dir = path.join(await getDataDir(), "cvs");
  await mkdir(dir, { recursive: true });
  return dir;
}
