import { unlink, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { ValidationError } from "./types.ts";
import { extensionFromFilename, isAllowedCvFile, looksLikeCvBytes } from "./validation.ts";
import { getCvDir } from "./paths.server.ts";

function getR2Client() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME || "jayatalent-cvs";

  if (!accountId || !accessKeyId || !secretAccessKey) {
    return null;
  }

  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return { client, bucket };
}

export async function saveApplicantCv(applicantId: string, file: File) {
  isAllowedCvFile(file.name, file.type, file.size);
  const ext = extensionFromFilename(file.name);
  const buffer = Buffer.from(await file.arrayBuffer());
  if (!looksLikeCvBytes(buffer, ext)) {
    throw new ValidationError("The uploaded file does not look like a valid CV.", {
      cv: "The uploaded file does not look like a valid CV.",
    });
  }
  const shortId = applicantId.replace(/-/g, "").slice(0, 6);
  const filename = `applicant_${shortId}_cv.${ext}`;

  // 1. Always save locally as fallback
  const dir = await getCvDir();
  const dest = path.join(dir, filename);
  await writeFile(dest, buffer);

  // 2. Upload to Cloudflare R2 if credentials are set
  const r2 = getR2Client();
  if (r2) {
    try {
      await r2.client.send(
        new PutObjectCommand({
          Bucket: r2.bucket,
          Key: `cvs/${filename}`,
          Body: buffer,
          ContentType: file.type || "application/octet-stream",
        })
      );
      console.log(`[R2 Storage] Uploaded cvs/${filename} to bucket ${r2.bucket}`);
    } catch (err) {
      console.error("[R2 Storage] Upload error, fell back to local file:", err);
    }
  }

  return filename;
}

export async function deleteCvFile(filename: string) {
  if (!filename || filename.includes("/") || filename.includes("\\") || filename.includes("..")) return;
  
  // 1. Delete local file
  const dir = await getCvDir();
  try {
    await unlink(path.join(dir, filename));
  } catch {
    // Ignore missing files
  }

  // 2. Delete from Cloudflare R2
  const r2 = getR2Client();
  if (r2) {
    try {
      await r2.client.send(
        new DeleteObjectCommand({
          Bucket: r2.bucket,
          Key: `cvs/${filename}`,
        })
      );
    } catch {
      // Ignore R2 errors on delete
    }
  }
}

export async function getCvBuffer(filename: string): Promise<Buffer | null> {
  if (!filename || filename.includes("/") || filename.includes("\\") || filename.includes("..")) {
    return null;
  }

  // 1. Try Cloudflare R2 first if configured
  const r2 = getR2Client();
  if (r2) {
    try {
      const res = await r2.client.send(
        new GetObjectCommand({
          Bucket: r2.bucket,
          Key: `cvs/${filename}`,
        })
      );
      if (res.Body) {
        const bytes = await res.Body.transformToByteArray();
        return Buffer.from(bytes);
      }
    } catch (err) {
      console.warn("[R2 Storage] File fetch failed, trying local disk:", err);
    }
  }

  // 2. Fall back to local disk
  try {
    const dir = await getCvDir();
    return await readFile(path.join(dir, filename));
  } catch {
    return null;
  }
}

export async function getCvAbsolutePath(filename: string) {
  if (!filename || filename.includes("/") || filename.includes("\\") || filename.includes("..")) {
    return null;
  }
  const dir = await getCvDir();
  return path.join(dir, filename);
}
