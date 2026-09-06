#!/usr/bin/env python3
"""
Job Scraper to Portal Sync Utility for Jaya Talent

Description:
  1. Reads scraped jobs from crypto_jobs.json and manual_jobs.json.
  2. Formats and appends new jobs to 'job seeker/data/jobs.csv'.
  3. Automatically triggers link verification and remote live site sync.
"""

import os
import json
import csv
import hashlib
import re
from datetime import datetime

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
crypto_jobs_path = os.path.join(base_dir, "crypto_jobs.json")
manual_jobs_path = os.path.join(base_dir, "manual_jobs.json")
jobs_csv_path = os.path.join(base_dir, "job seeker ", "data", "jobs.csv")

CSV_HEADERS = [
    "id", "created_at", "updated_at", "title", "company", "location", "remote",
    "employment_type", "seniority", "years_min", "years_max", "salary_min",
    "salary_max", "salary_currency", "category", "required_skills", "preferred_skills",
    "technologies", "description", "apply_url", "status", "source"
]

def make_job_id(company: str, title: str, link: str) -> str:
    raw = f"{company.strip().lower()}:{title.strip().lower()}:{link.strip().lower()}"
    h = hashlib.md5(raw.encode("utf-8")).hexdigest()[:10]
    return f"job_scraped_{h}"

def infer_category(title: str, loc: str, raw_cat: str = "") -> str:
    t = title.lower()
    
    if any(k in t for k in ["solidity", "rust", "smart contract", "auditor", "evm", "audit"]):
        return "Smart Contracts / Auditing"
    if any(k in t for k in ["engineer", "developer", "fullstack", "full stack", "backend", "frontend", "sre", "devops", "compiler", "golang", "go ", "react", "typescript"]):
        return "Engineering / Development"
    if any(k in t for k in ["designer", "ui/ux", "ux/ui", "visual design", "product design", "figma"]):
        return "Design / UI / UX"
    if any(k in t for k in ["product manager", "product owner", "head of product", "technical product"]):
        return "Product Management"
    if any(k in t for k in ["legal", "compliance", "counsel", "regulatory", "sanctions", "kyc", "aml"]):
        return "Legal / Compliance"
    if any(k in t for k in ["marketing", "social media", "content", "pr ", "communications", "seo", "copywriter", "kol"]):
        return "Marketing / PR"
    if any(k in t for k in ["sales", "business development", "bd ", "partnership", "account executive"]):
        return "Sales / Business Development"
    if any(k in t for k in ["trader", "trading", "quant", "quantitative", "finance", "cfo", "treasury", "accounting"]):
        return "Finance / Accounting"
    if any(k in t for k in ["research", "researcher", "tokenomics", "analyst", "data scientist"]):
        return "Research / Economics"
    if any(k in t for k in ["hr", "recruiter", "talent", "headhunter", "people ops"]):
        return "HR / Recruiting"
    if any(k in t for k in ["devrel", "developer relations", "community", "moderator", "discord"]):
        return "Community / Developer Relations"
    if any(k in t for k in ["ai ", "machine learning", "ml ", "llm"]):
        return "AI / Machine Learning"
    if any(k in t for k in ["security", "penetration", "auditing"]):
        return "Security"
    if any(k in t for k in ["ceo", "cto", "coo", "cfo", "vp of", "chief of staff", "executive"]):
        return "Executive / Leadership"
    if any(k in t for k in ["operations", "ops", "bizops"]):
        return "Operations / Strategy"

    return "Engineering / Development"

def infer_remote(loc: str) -> str:
    l = loc.lower()
    if "hybrid" in l:
        return "hybrid"
    if "onsite" in l or "on-site" in l:
        return "onsite"
    return "remote"

def infer_seniority(title: str) -> str:
    t = title.lower()
    if any(k in t for k in ["lead", "staff", "principal", "head"]):
        return "Lead"
    if any(k in t for k in ["senior", "sr.", "sr "]):
        return "Senior"
    if any(k in t for k in ["junior", "jr.", "jr "]):
        return "Junior"
    if any(k in t for k in ["intern", "trainee"]):
        return "Student"
    return "Mid-Level"

def infer_skills(title: str, category: str) -> str:
    skills = []
    t = title.lower()
    
    skill_map = [
        ("solidity", "Solidity"),
        ("rust", "Rust"),
        ("golang", "Go"),
        ("go ", "Go"),
        ("python", "Python"),
        ("typescript", "TypeScript"),
        ("react", "React.js"),
        ("next.js", "Next.js"),
        ("node", "Node.js"),
        ("evm", "EVM"),
        ("solana", "Solana"),
        ("anchor", "Anchor"),
        ("figma", "Figma"),
        ("trading", "Trading"),
        ("quant", "Quantitative Analysis"),
        ("compliance", "Compliance"),
        ("legal", "Legal"),
        ("marketing", "Marketing"),
        ("sales", "Sales"),
        ("product", "Product Management"),
    ]
    for pattern, name in skill_map:
        if pattern in t:
            skills.append(name)
            
    if not skills:
        skills.append(category.split(" / ")[0])
        
    return "|".join(dict.fromkeys(skills))

def main():
    print("🔄 Starting Job Scraper to Website Portal Sync...")
    now_iso = datetime.now().isoformat() + "Z"
    
    raw_jobs = []
    
    if os.path.exists(crypto_jobs_path):
        try:
            with open(crypto_jobs_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if isinstance(data, dict) and "data" in data:
                    raw_jobs.extend(data["data"])
                elif isinstance(data, list):
                    raw_jobs.extend(data)
        except Exception as e:
            print(f"Error reading {crypto_jobs_path}: {e}")
            
    if os.path.exists(manual_jobs_path):
        try:
            with open(manual_jobs_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if isinstance(data, list):
                    raw_jobs.extend(data)
        except Exception as e:
            print(f"Error reading {manual_jobs_path}: {e}")
            
    print(f"📦 Total raw scraped candidates found: {len(raw_jobs)}")
    
    # Load existing jobs.csv
    existing_jobs = {}
    if os.path.exists(jobs_csv_path):
        try:
            with open(jobs_csv_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    if row.get("id"):
                        existing_jobs[row["id"]] = row
        except Exception as e:
            print(f"Error reading {jobs_csv_path}: {e}")
            
    print(f"📄 Existing jobs in database: {len(existing_jobs)}")
    
    url_to_id = {}
    title_to_id = {}
    for jid, job in existing_jobs.items():
        url = job.get("apply_url", "").strip()
        if url:
            url_to_id[url] = jid
        comp = job.get("company", "").strip().lower()
        title = job.get("title", "").strip().lower()
        if comp and title:
            title_to_id[(comp, title)] = jid

    updated_jobs = dict(existing_jobs)
    new_added = 0
    updated_count = 0
    
    for raw in raw_jobs:
        comp = (raw.get("company") or "").strip().capitalize()
        title = (raw.get("title") or "").strip()
        link = (raw.get("link") or raw.get("apply_url") or "").strip()
        loc = (raw.get("location") or "Remote").strip().replace("\n", ", ")
        
        if not title or not link:
            continue
            
        key_tuple = (comp.lower(), title.lower())
        existing_id = url_to_id.get(link) or title_to_id.get(key_tuple)
        
        category = infer_category(title, loc)
        remote = infer_remote(loc)
        seniority = infer_seniority(title)
        skills = infer_skills(title, category)
        
        if existing_id and existing_id in updated_jobs:
            existing_row = updated_jobs[existing_id]
            existing_row["updated_at"] = now_iso
            existing_row["status"] = "active"
            existing_row["apply_url"] = link
            existing_row["location"] = loc
            existing_row["category"] = category
            updated_count += 1
        else:
            job_id = make_job_id(comp, title, link)
            new_row = {
                "id": job_id,
                "created_at": now_iso,
                "updated_at": now_iso,
                "title": title,
                "company": comp,
                "location": loc,
                "remote": remote,
                "employment_type": "Full-time",
                "seniority": seniority,
                "years_min": "",
                "years_max": "",
                "salary_min": "",
                "salary_max": "",
                "salary_currency": "USD",
                "category": category,
                "required_skills": skills,
                "preferred_skills": "",
                "technologies": skills,
                "description": f"Direct opportunity at {comp}. Apply directly via official candidate link.",
                "apply_url": link,
                "status": "active",
                "source": "scraped",
            }
            updated_jobs[job_id] = new_row
            url_to_id[link] = job_id
            title_to_id[key_tuple] = job_id
            new_added += 1

    # Write out updated CSV
    os.makedirs(os.path.dirname(jobs_csv_path), exist_ok=True)
    with open(jobs_csv_path, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=CSV_HEADERS)
        writer.writeheader()
        for row in updated_jobs.values():
            writer.writerow(row)
            
    print(f"✅ Sync complete!")
    print(f"   - Added new active jobs: {new_added}")
    print(f"   - Refreshed existing jobs: {updated_count}")
    print(f"   - Total jobs in DB: {len(updated_jobs)}")

    # Automatically trigger link verification and remote live production push
    cleaner_script = os.path.join(base_dir, "scripts", "clean_and_verify_jobs.py")
    if os.path.exists(cleaner_script):
        import subprocess
        print("\n🔍 Running automatic ATS link verification & live production push...")
        subprocess.run(["python3", cleaner_script], check=False)
    else:
        remote_syncer = os.path.join(base_dir, "scripts", "push_jobs_remote.py")
        if os.path.exists(remote_syncer):
            import subprocess
            print("\n🚀 Pushing newly fetched & updated jobs to live production site...")
            subprocess.run(["python3", remote_syncer], check=False)

if __name__ == "__main__":
    main()
