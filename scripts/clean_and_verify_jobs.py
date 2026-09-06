#!/usr/bin/env python3
"""
Comprehensive Job Link Verifier & Status Cleaner for Jaya Talent

Description:
  1. Verifies Ashby, Greenhouse, and Lever jobs against live official ATS APIs.
  2. Verifies direct custom URLs via parallel HTTP checks and content pattern matching.
  3. Updates job status to 'closed' for any removed, 404, or expired listings.
  4. Saves clean dataset to 'job seeker/data/jobs.csv'.
"""

import os
import sys
import csv
import json
import re
import urllib.request
import urllib.parse
import ssl
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JOBS_CSV_PATH = os.path.join(BASE_DIR, "job seeker ", "data", "jobs.csv")

CSV_HEADERS = [
    "id", "created_at", "updated_at", "title", "company", "location", "remote",
    "employment_type", "seniority", "years_min", "years_max", "salary_min",
    "salary_max", "salary_currency", "category", "required_skills", "preferred_skills",
    "technologies", "description", "apply_url", "status", "source"
]

def http_get(url: str, timeout: int = 10) -> tuple[int, str]:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
    )
    ctx = ssl._create_unverified_context()
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as resp:
            return resp.status, resp.read().decode("utf-8", errors="ignore")
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="ignore") if e.fp else ""
        return e.code, body
    except Exception as e:
        return 500, str(e)

# --- 1. ATS API FETCHERS ---

def fetch_ashby_live_urls(company_token: str) -> set[str]:
    url = f"https://api.ashbyhq.com/posting-api/job-board/{company_token}"
    status, body = http_get(url)
    if status != 200 or not body:
        return set()
    try:
        data = json.loads(body)
        jobs = data.get("jobs", [])
        urls = set()
        for j in jobs:
            if j.get("jobUrl"):
                urls.add(j["jobUrl"].rstrip("/"))
                # Handle canonical variations
                urls.add(j["jobUrl"].split("?")[0].rstrip("/"))
        return urls
    except Exception:
        return set()

def fetch_greenhouse_live_urls(company_token: str) -> set[str]:
    url = f"https://boards-api.greenhouse.io/v1/boards/{company_token}/jobs"
    status, body = http_get(url)
    if status != 200 or not body:
        return set()
    try:
        data = json.loads(body)
        jobs = data.get("jobs", [])
        urls = set()
        for j in jobs:
            if j.get("absolute_url"):
                urls.add(j["absolute_url"].rstrip("/"))
                urls.add(j["absolute_url"].split("?")[0].rstrip("/"))
        return urls
    except Exception:
        return set()

def fetch_lever_live_urls(company_token: str) -> set[str]:
    url = f"https://api.lever.co/v0/postings/{company_token}"
    status, body = http_get(url)
    if status != 200 or not body:
        return set()
    try:
        data = json.loads(body)
        if not isinstance(data, list):
            return set()
        urls = set()
        for j in data:
            if j.get("hostedUrl"):
                urls.add(j["hostedUrl"].rstrip("/"))
                urls.add(j["hostedUrl"].split("?")[0].rstrip("/"))
        return urls
    except Exception:
        return set()

# --- 2. DIRECT LINK HTTP VERIFIER ---

EXPIRED_PATTERNS = [
    "job not found",
    "job you requested was not found",
    "page not found",
    "404 not found",
    "no longer available",
    "no longer accepting applications",
    "position has been closed",
    "posting has expired",
    "job has been removed",
    "this job is closed",
]

def verify_direct_url(url: str) -> bool:
    if not url or not url.startswith("http"):
        return False
    status, body = http_get(url, timeout=12)
    if status in [404, 410]:
        return False
    if status == 200:
        body_lower = body.lower()
        if any(pat in body_lower for pat in EXPIRED_PATTERNS):
            return False
        return True
    return True

# --- MAIN VERIFICATION LOGIC ---

def clean_and_verify():
    print("🔍 Starting Full Job Verification & Link Cleaner...")
    if not os.path.exists(JOBS_CSV_PATH):
        print(f"❌ File not found: {JOBS_CSV_PATH}")
        sys.exit(1)

    jobs = []
    with open(JOBS_CSV_PATH, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        jobs = list(reader)

    total_jobs = len(jobs)
    print(f"📄 Loaded {total_jobs} total jobs from dataset.")

    # Group ATS jobs by provider and token
    ashby_jobs_by_token = {}
    gh_jobs_by_token = {}
    lever_jobs_by_token = {}
    direct_jobs = []

    for job in jobs:
        url = job.get("apply_url", "").strip()
        
        # Match Ashby
        ashby_match = re.search(r"ashbyhq\.com/([^/?]+)", url)
        if ashby_match and ashby_match.group(1) not in ["embed"]:
            token = ashby_match.group(1)
            ashby_jobs_by_token.setdefault(token, []).append(job)
            continue

        # Match Greenhouse
        gh_match = re.search(r"greenhouse\.io/([^/?]+)", url)
        if gh_match and gh_match.group(1) not in ["embed"]:
            token = gh_match.group(1)
            gh_jobs_by_token.setdefault(token, []).append(job)
            continue

        # Match Lever
        lever_match = re.search(r"lever\.co/([^/?]+)", url)
        if lever_match and lever_match.group(1) not in ["embed"]:
            token = lever_match.group(1)
            lever_jobs_by_token.setdefault(token, []).append(job)
            continue

        direct_jobs.append(job)

    now_iso = datetime.now().isoformat() + "Z"
    closed_count = 0
    active_count = 0

    # 1. Process Ashby ATS jobs
    print(f"\n⚡ Verifying Ashby jobs ({sum(len(v) for v in ashby_jobs_by_token.values())} roles across {len(ashby_jobs_by_token)} companies)...")
    for token, job_list in ashby_jobs_by_token.items():
        live_urls = fetch_ashby_live_urls(token)
        for j in job_list:
            url = j.get("apply_url", "").strip().rstrip("/")
            url_clean = url.split("?")[0].rstrip("/")
            
            if live_urls and (url in live_urls or url_clean in live_urls):
                j["status"] = "active"
                active_count += 1
            else:
                if j["status"] != "closed":
                    print(f"  ❌ Closing expired Ashby role: [{j.get('company')}] {j.get('title')} ({url})")
                    j["status"] = "closed"
                    j["updated_at"] = now_iso
                closed_count += 1

    # 2. Process Greenhouse ATS jobs
    print(f"\n⚡ Verifying Greenhouse jobs ({sum(len(v) for v in gh_jobs_by_token.values())} roles across {len(gh_jobs_by_token)} companies)...")
    for token, job_list in gh_jobs_by_token.items():
        live_urls = fetch_greenhouse_live_urls(token)
        for j in job_list:
            url = j.get("apply_url", "").strip().rstrip("/")
            url_clean = url.split("?")[0].rstrip("/")
            
            if live_urls and (url in live_urls or url_clean in live_urls):
                j["status"] = "active"
                active_count += 1
            else:
                if j["status"] != "closed":
                    print(f"  ❌ Closing expired Greenhouse role: [{j.get('company')}] {j.get('title')} ({url})")
                    j["status"] = "closed"
                    j["updated_at"] = now_iso
                closed_count += 1

    # 3. Process Lever ATS jobs
    print(f"\n⚡ Verifying Lever jobs ({sum(len(v) for v in lever_jobs_by_token.values())} roles across {len(lever_jobs_by_token)} companies)...")
    for token, job_list in lever_jobs_by_token.items():
        live_urls = fetch_lever_live_urls(token)
        for j in job_list:
            url = j.get("apply_url", "").strip().rstrip("/")
            url_clean = url.split("?")[0].rstrip("/")
            
            if live_urls and (url in live_urls or url_clean in live_urls):
                j["status"] = "active"
                active_count += 1
            else:
                if j["status"] != "closed":
                    print(f"  ❌ Closing expired Lever role: [{j.get('company')}] {j.get('title')} ({url})")
                    j["status"] = "closed"
                    j["updated_at"] = now_iso
                closed_count += 1

    # 4. Process Direct Custom links in parallel
    print(f"\n🌐 Verifying Direct links ({len(direct_jobs)} roles)...")
    with ThreadPoolExecutor(max_workers=25) as executor:
        future_to_job = {executor.submit(verify_direct_url, j.get("apply_url", "")): j for j in direct_jobs}
        for future in as_completed(future_to_job):
            j = future_to_job[future]
            try:
                is_valid = future.result()
            except Exception:
                is_valid = False

            if is_valid:
                j["status"] = "active"
                active_count += 1
            else:
                if j["status"] != "closed":
                    print(f"  ❌ Closing invalid/expired direct role: [{j.get('company')}] {j.get('title')}")
                    j["status"] = "closed"
                    j["updated_at"] = now_iso
                closed_count += 1

    # Filter and save ONLY active verified jobs (hard delete closed/invalid jobs)
    active_jobs = [j for j in jobs if j.get("status") == "active"]

    with open(JOBS_CSV_PATH, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_HEADERS)
        writer.writeheader()
        for j in active_jobs:
            writer.writerow(j)

    # Clean crypto_jobs.json master database as well
    crypto_jobs_path = os.path.join(BASE_DIR, "crypto_jobs.json")
    if os.path.exists(crypto_jobs_path):
        try:
            active_links = {j.get("apply_url", "").strip().rstrip("/") for j in active_jobs if j.get("apply_url")}
            with open(crypto_jobs_path, "r", encoding="utf-8") as f:
                cj = json.load(f)
                data_list = cj.get("data", []) if isinstance(cj, dict) else cj
            clean_cj = [item for item in data_list if (item.get("link") or "").strip().rstrip("/") in active_links]
            with open(crypto_jobs_path, "w", encoding="utf-8") as f:
                json.dump({"data": clean_cj}, f, indent=4)
            print(f"🎉 Hard-purged closed roles from crypto_jobs.json (kept {len(clean_cj)} active positions).")
        except Exception as e:
            print(f"Warning: Could not clean crypto_jobs.json: {e}")

    print("\n" + "=" * 60)
    print("✅ Hard-Delete Cleanup Finished!")
    print(f"   - Total roles analyzed: {total_jobs}")
    print(f"   - Active verified roles retained: {len(active_jobs)}")
    print(f"   - Closed / Expired roles TOTALLY DELETED: {closed_count}")
    print("=" * 60)

    # Automatically push cleaned status to remote live production site
    print("\n🚀 Pushing cleaned dataset to remote production server...")
    remote_syncer = os.path.join(BASE_DIR, "scripts", "push_jobs_remote.py")
    if os.path.exists(remote_syncer):
        import subprocess
        subprocess.run(["python3", remote_syncer], check=False)

if __name__ == "__main__":
    clean_and_verify()
