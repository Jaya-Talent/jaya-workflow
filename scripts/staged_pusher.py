#!/usr/bin/env python3
"""
Staged Git Pusher Script for Jaya Talent / Job Seeker Directory

Description:
  Automates staging, committing, and pushing 2 to 4 files every 2 minutes ONLY from the 'job seeker' directory.
  Generates relevant commit messages based on staged file types.
  Ensures strict security by skipping .env and credentials.
  Uses shell=False to prevent variable expansion bugs (e.g. filenames with $id).
"""

import os
import sys
import time
import re
import random
import subprocess

# Interval between pushes (in seconds)
INTERVAL_SECONDS = 120  # 2 minutes

# Target scope restriction
TARGET_DIRECTORY_PREFIX = "job seeker"

# Security blacklist patterns (never stage these files)
BLACK_LIST_PATTERNS = [
    r"^\.env$",
    r"^\.env\.",
    r"/\.env$",
    r"/\.env\.",
    r"\.pem$",
    r"\.key$",
    r"id_rsa",
    r"credentials\.json$",
    r"\.DS_Store",
]

def is_sensitive(filepath: str) -> bool:
    """Returns True if the file matches any sensitive/credential pattern."""
    basename = os.path.basename(filepath)
    if basename == ".env.example":
        return False  # .env.example is safe to commit
    for pattern in BLACK_LIST_PATTERNS:
        if re.search(pattern, filepath, re.IGNORECASE) or re.search(pattern, basename, re.IGNORECASE):
            return True
    return False

def run_cmd_args(args: list[str], cwd=None) -> str:
    """Run a shell command as a argument list (shell=False) to avoid $ expansion."""
    res = subprocess.run(args, cwd=cwd, capture_output=True, text=True)
    if res.returncode != 0 and "push" not in args:
        print(f"[WARN] Command output: {res.stderr.strip()}")
    return res.stdout.strip()

def is_git_ignored(filepath: str) -> bool:
    """Checks if git considers the file ignored."""
    res = subprocess.run(["git", "check-ignore", filepath], capture_output=True, text=True)
    return res.returncode == 0

def get_current_branch() -> str:
    """Returns the current git branch name."""
    branch = run_cmd_args(["git", "branch", "--show-current"])
    return branch if branch else "main"

def get_pending_files() -> list[str]:
    """
    Finds untracked and modified files strictly under the 'job seeker' directory.
    Ignores files marked in .gitignore or matching security rules.
    """
    diff_out = run_cmd_args(["git", "diff", "--name-only"])
    staged_out = run_cmd_args(["git", "diff", "--cached", "--name-only"])
    untracked_out = run_cmd_args(["git", "ls-files", "--others", "--exclude-standard"])

    raw_candidates = []
    if diff_out:
        raw_candidates.extend(diff_out.splitlines())
    if staged_out:
        raw_candidates.extend(staged_out.splitlines())
    if untracked_out:
        raw_candidates.extend(untracked_out.splitlines())

    unique_files = []
    seen = set()

    for path_str in raw_candidates:
        f = path_str.strip().strip('"')
        if not f or f in seen:
            continue
        seen.add(f)

        # STRICT SCOPE FILTER: Only include files under the 'job seeker' directory
        if not f.startswith(TARGET_DIRECTORY_PREFIX):
            continue

        # Skip ignored or sensitive paths
        if is_sensitive(f) or is_git_ignored(f):
            continue

        if os.path.isfile(f):
            unique_files.append(f)

    return unique_files

def generate_commit_message(staged_files: list[str]) -> str:
    """Generates a concise, relatable commit message based on staged files."""
    basenames = [os.path.basename(f) for f in staged_files]
    paths = [f.lower() for f in staged_files]
    exts = set(os.path.splitext(f)[1].lower() for f in staged_files)

    # 1. UI & Frontend Components
    if any("src/components" in p for p in paths):
        names = ", ".join(os.path.splitext(b)[0] for b in basenames[:2])
        return f"feat(ui): update {names} component{'s' if len(staged_files) > 1 else ''}"

    # 2. Database & Migrations
    if any("migrations" in p or "db.ts" in p for p in paths):
        return "feat(db): add database migration scripts and schema updates"

    # 3. Matching Engine & Workers
    if any("matching" in p or "worker" in p for p in paths):
        return "feat(matching): update candidate scoring engine and background workers"

    # 4. Auth & Security
    if any("auth" in p or "gate" in p for p in paths):
        return "feat(auth): update session authentication and identity gates"

    # 5. Data & Assets
    if any(ext in [".csv", ".json", ".yaml", ".yml", ".png", ".jpg", ".svg"] for ext in exts) or any("data" in p or "artifacts" in p for p in paths):
        names = ", ".join(basenames[:2])
        return f"data: update dataset and static assets ({names})"

    # 6. Build & Configuration
    if any(b in ["package.json", "tsconfig.json", "vite.config.ts", ".gitignore", "eslint.config.mjs"] for b in basenames):
        return "chore(config): update build, typescript, and project configuration"

    # 7. Documentation
    if any(ext in [".md", ".txt"] for ext in exts) or any("readme" in b.lower() for b in basenames):
        return f"docs: update documentation ({', '.join(basenames)})"

    # 8. Python / Shell / JS Scripts
    if any(ext in [".py", ".sh", ".mjs"] for ext in exts) or any("scripts" in p for p in paths):
        names = ", ".join(basenames[:2])
        return f"feat(scripts): update utility scripts ({names})"

    # Default fallback
    short_list = ", ".join(basenames[:3])
    return f"feat: update {short_list}"

def process_batch(dry_run=False) -> bool:
    """Stages 2 to 4 files from 'job seeker', commits, and pushes them."""
    pending = get_pending_files()
    if not pending:
        print("✅ No more pending files under 'job seeker' directory to stage and push.")
        return False

    # Choose between 2 and 4 files (or fewer if less than 2 remain)
    count = min(random.randint(2, 4), len(pending))
    batch = pending[:count]

    commit_msg = generate_commit_message(batch)

    print("\n" + "=" * 60)
    print(f"📦 [{time.strftime('%Y-%m-%d %H:%M:%S')}] Staging {len(batch)} file(s) under 'job seeker' (out of {len(pending)} remaining):")
    for f in batch:
        print(f"  - {f}")
    print(f"💬 Commit message: \"{commit_msg}\"")

    if dry_run:
        print("🔍 [DRY RUN] Skipping git add, commit, and push.")
        return True

    # 1. Stage files without shell variable expansion
    run_cmd_args(["git", "add"] + batch)

    # 2. Commit
    commit_res = run_cmd_args(["git", "commit", "-m", commit_msg])
    print(f"📝 Commit result:\n{commit_res}")

    # 3. Push
    branch = get_current_branch()
    print(f"🚀 Pushing to origin/{branch}...")
    push_res = run_cmd_args(["git", "push", "origin", branch])
    print(f"📤 Push result:\n{push_res}")

    return True

def main():
    dry_run = "--dry-run" in sys.argv
    loop = "--once" not in sys.argv

    print("🚀 Starting Staged Git Pusher (Job Seeker Scope)")
    print(f"⚙️ Config: Scope='job seeker', Interval={INTERVAL_SECONDS}s (2 mins), DryRun={dry_run}, Loop={loop}")

    while True:
        has_more = process_batch(dry_run=dry_run)
        if not has_more or not loop:
            print("\n🎉 Batch pushing for 'job seeker' complete!")
            break

        print(f"\n⏳ Waiting {INTERVAL_SECONDS} seconds (2 minutes) before next batch...")
        try:
            time.sleep(INTERVAL_SECONDS)
        except KeyboardInterrupt:
            print("\n🛑 Stopped by user.")
            break

if __name__ == "__main__":
    main()
