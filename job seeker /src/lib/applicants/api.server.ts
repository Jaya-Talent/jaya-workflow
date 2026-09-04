import { readFile } from "node:fs/promises";
import { isAdminAuthenticated, unauthorized } from "./admin-auth.server.ts";
import { getApplicantRepository } from "./sql-repository.server.ts";
import { deleteCvFile, getCvBuffer, saveApplicantCv } from "./cv-storage.server.ts";
import { jsonError, toPublicApplicant } from "./http.ts";
import { queueApplicantMatching } from "../matching/pipeline.server.ts";
import { NotFoundError, ValidationError } from "./types.ts";
import { parseApplicantPayload, parseApplicantPatch, sanitizeText } from "./validation.ts";

function sanitizeInput<T>(input: T): T {
  const out = { ...(input as Record<string, unknown>) };
  for (const [key, value] of Object.entries(out)) {
    if (typeof value === "string") out[key] = sanitizeText(value);
    if (Array.isArray(value)) {
      out[key] = value.map((item) => (typeof item === "string" ? sanitizeText(item) : item));
    }
  }
  return out as T;
}

async function readJsonOrForm(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const payloadRaw = form.get("payload");
    const cv = form.get("cv");
    const payload =
      typeof payloadRaw === "string" && payloadRaw
        ? JSON.parse(payloadRaw)
        : Object.fromEntries(
            [...form.entries()]
              .filter(([key]) => key !== "cv" && key !== "payload")
              .map(([key, value]) => [key, typeof value === "string" ? value : ""]),
          );
    return { payload, cv: cv instanceof File && cv.size > 0 ? cv : null };
  }
  const payload = await request.json();
  return { payload, cv: null as File | null };
}

export async function handleCreateApplicant(request: Request) {
  try {
    const { payload, cv } = await readJsonOrForm(request);
    const input = sanitizeInput(parseApplicantPayload(payload));
    const repo = getApplicantRepository();
    const applicant = await repo.createApplicant(input);
    const saved = cv
      ? (await repo.updateApplicant(applicant.id, {
          cv_filename: await saveApplicantCv(applicant.id, cv),
        })) ?? applicant
      : applicant;
    queueApplicantMatching(saved.id);
    return Response.json({ applicant: toPublicApplicant(saved) }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return jsonError(new ValidationError("Invalid request body."));
    }
    return jsonError(error);
  }
}

export async function handleGetApplicant(id: string) {
  try {
    const applicant = await getApplicantRepository().getApplicant(id);
    if (!applicant) throw new NotFoundError();
    return Response.json({ applicant: toPublicApplicant(applicant) });
  } catch (error) {
    return jsonError(error);
  }
}

export async function handlePatchApplicant(id: string, request: Request) {
  try {
    const body = await request.json();
    const patch = sanitizeInput(parseApplicantPatch(body));
    const repo = getApplicantRepository();
    const updated = await repo.updateApplicant(id, patch);
    if (!updated) throw new NotFoundError();
    return Response.json({ applicant: toPublicApplicant(updated) });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return jsonError(new ValidationError("Invalid request body."));
    }
    return jsonError(error);
  }
}

export async function handleUploadCv(id: string, request: Request) {
  try {
    const repo = getApplicantRepository();
    const applicant = await repo.getApplicant(id);
    if (!applicant) throw new NotFoundError();
    const form = await request.formData();
    const cv = form.get("cv");
    if (!(cv instanceof File) || cv.size === 0) {
      throw new ValidationError("Please attach a CV file.", { cv: "Please attach a CV file." });
    }
    if (applicant.cv_filename) {
      await deleteCvFile(applicant.cv_filename);
    }
    const filename = await saveApplicantCv(id, cv);
    const updated = await repo.updateApplicant(id, { cv_filename: filename });
    return Response.json({
      applicant: toPublicApplicant(updated ?? { ...applicant, cv_filename: filename }),
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function handleListApplicants(request: Request) {
  if (!isAdminAuthenticated(request)) return unauthorized();
  const applicants = await getApplicantRepository().listApplicants();
  const today = new Date().toISOString().slice(0, 10);
  const newToday = applicants.filter((row) => row.created_at.slice(0, 10) === today).length;
  const averageCompletion =
    applicants.length === 0
      ? 0
      : Math.round(
          applicants.reduce((sum, row) => sum + row.profile_completion, 0) / applicants.length,
        );
  return Response.json({
    stats: {
      total: applicants.length,
      averageCompletion,
      newToday,
    },
    applicants: applicants.map(toPublicApplicant),
  });
}

export async function handleDownloadCv(id: string, request: Request) {
  if (!isAdminAuthenticated(request)) return unauthorized();
  const applicant = await getApplicantRepository().getApplicant(id);
  if (!applicant?.cv_filename) {
    return Response.json({ error: "No CV on file" }, { status: 404 });
  }
  try {
    const bytes = await getCvBuffer(applicant.cv_filename);
    if (!bytes) return Response.json({ error: "No CV on file" }, { status: 404 });
    const ext = applicant.cv_filename.split(".").pop()?.toLowerCase();
    const type =
      ext === "pdf"
        ? "application/pdf"
        : ext === "docx"
          ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          : "application/msword";
    return new Response(Uint8Array.from(bytes), {
      headers: {
        "content-type": type,
        "content-disposition": `attachment; filename="${applicant.cv_filename}"`,
        "cache-control": "no-store",
      },
    });
  } catch {
    return Response.json({ error: "No CV on file" }, { status: 404 });
  }
}
