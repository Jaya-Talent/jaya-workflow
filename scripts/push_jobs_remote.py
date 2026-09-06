#!/usr/bin/env python3
"""
Remote Job Syncer for Jaya Talent (Replace Mode)

Description:
  Pushes active scraped jobs directly to the live production server (e.g. Vercel) via HTTP REST API,
  purging closed jobs and replacing the live dataset cleanly WITHOUT needing to commit or push files to GitHub!
"""

import os
import sys
import json
import csv
import urllib.request
import urllib.parse
import ssl

DEFAULT_APP_URL = "https://jayatalent-job-seeker.vercel.app"
DEFAULT_ADMIN_PASS = "meridian-admin"
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JOBS_CSV_PATH = os.path.join(BASE_DIR, "job seeker ", "data", "jobs.csv")

def http_post_json(url: str, data: dict, cookie_str: str = None) -> tuple[int, str]:
    headers = {
        "Content-Type": "application/json",
        "User-Agent": "JayaTalent-RemoteSyncer/1.0"
    }
    if cookie_str:
        headers["Cookie"] = cookie_str

    body_bytes = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(url, data=body_bytes, headers=headers, method="POST")
    ctx = ssl._create_unverified_context()

    try:
        with urllib.request.urlopen(req, timeout=30, context=ctx) as resp:
            return resp.status, resp.read().decode("utf-8")
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8") if e.fp else ""
        return e.code, body
    except Exception as e:
        return 500, str(e)

def login_admin(base_url: str, password: str) -> str:
    url = f"{base_url.rstrip('/')}/api/admin/login"
    body_bytes = json.dumps({"password": password}).encode("utf-8")
    req = urllib.request.Request(url, data=body_bytes, headers={"Content-Type": "application/json"}, method="POST")
    ctx = ssl._create_unverified_context()

    try:
        with urllib.request.urlopen(req, timeout=15, context=ctx) as resp:
            cookie_header = resp.headers.get("Set-Cookie")
            if not cookie_header:
                print("❌ Admin login failed: Missing Set-Cookie in response header.")
                sys.exit(1)
            cookie_val = cookie_header.split(";")[0]
            print(f"✅ Successfully logged in to Admin Portal! ({cookie_val[:25]}...)")
            return cookie_val
    except Exception as e:
        print(f"❌ Admin login failed: {e}")
        sys.exit(1)

def push_jobs_in_batches(base_url: str, cookie_str: str, jobs: list[dict], batch_size: int = 50, replace_first: bool = True):
    url = f"{base_url.rstrip('/')}/api/admin/jobs/bulk"
    total = len(jobs)
    print(f"🚀 Pushing {total} active jobs remotely to {base_url} (ReplaceMode={replace_first})...")

    success_count = 0
    for i in range(0, total, batch_size):
        batch = jobs[i:i + batch_size]
        is_first_batch = (i == 0 and replace_first)
        payload = {
            "jobs": batch,
            "replace": is_first_batch
        }
        
        status, resp_text = http_post_json(url, payload, cookie_str=cookie_str)
        if status == 200:
            success_count += len(batch)
            mode_str = "REPLACED DB & Uploaded" if is_first_batch else "Uploaded"
            print(f"  [Progress: {min(i + batch_size, total)}/{total}] {mode_str} batch cleanly.")
        else:
            print(f"  ⚠️ Batch {i//batch_size + 1} failed ({status}): {resp_text[:100]}")

    print(f"\n🎉 Finished remote job sync! {success_count}/{total} active jobs live on production!")

def load_jobs_from_csv() -> list[dict]:
    if not os.path.exists(JOBS_CSV_PATH):
        print(f"❌ Jobs CSV not found at {JOBS_CSV_PATH}")
        sys.exit(1)
        
    jobs = []
    with open(JOBS_CSV_PATH, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if not row.get("title") or not row.get("company"):
                continue
            # Include only active jobs (exclude closed jobs)
            if row.get("status") == "closed":
                continue

            jobs.append({
                "id": row.get("id"),
                "created_at": row.get("created_at"),
                "title": row.get("title"),
                "company": row.get("company"),
                "location": row.get("location", "Remote"),
                "remote": row.get("remote", "remote"),
                "employment_type": row.get("employment_type", "Full-time"),
                "seniority": row.get("seniority", ""),
                "salary_min": row.get("salary_min", ""),
                "salary_max": row.get("salary_max", ""),
                "salary_currency": row.get("salary_currency", "USD"),
                "category": row.get("category", "Software Engineering"),
                "required_skills": row.get("required_skills", "").split("|") if row.get("required_skills") else [],
                "description": row.get("description", ""),
                "apply_url": row.get("apply_url", ""),
                "status": "active",
                "source": row.get("source", "scraped"),
            })
    return jobs

def main():
    target_url = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_APP_URL
    admin_pass = sys.argv[2] if len(sys.argv) > 2 else DEFAULT_ADMIN_PASS

    print(f"🌐 Remote Job Syncer Target: {target_url}")
    cookie_str = login_admin(target_url, admin_pass)

    jobs = load_jobs_from_csv()
    print(f"📄 Loaded {len(jobs)} active jobs from local CSV.")

    push_jobs_in_batches(target_url, cookie_str, jobs, replace_first=True)

if __name__ == "__main__":
    main()
