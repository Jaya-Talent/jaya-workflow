import os
import yaml
import requests
import subprocess
import urllib3
from concurrent.futures import ThreadPoolExecutor, as_completed

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

base_dir = "/Users/adam/Documents/jayya workflow"
output_path = os.path.join(base_dir, "validated_job_sources.yaml")

# Map of known expired/outdated URLs to their correct active replacements
URL_OVERLAYS = {
    "https://jobs.lever.co/ethereumfoundation": "https://jobs.ashbyhq.com/ethereum-foundation",
    "https://web3.foundation/careers": "https://web3.bamboohr.com/jobs/",
    "https://injective.com/careers": "https://jobs.ashbyhq.com/injective",
    "https://oplabs.co/careers": "https://jobs.ashbyhq.com/oplabs",
    "https://a16z.com/careers": "https://jobs.a16z.com/jobs",
}

# Known domains that block python requests or command-line clients (bot protection) but are 100% legitimate
LEGIT_BLOCKED_DOMAINS = [
    "linkedin.com",
    "reddit.com",
    "indeed.com",
    "glassdoor.com",
    "wellfound.com",
    "upwork.com",
    "ycombinator.com"
]

def verify_link_with_curl(url):
    """Fallback validation using curl for sites that block requests or require specific TLS handshakes."""
    try:
        # Run curl -sI -o /dev/null -w "%{http_code}" to get status code
        res = subprocess.run(
            ["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}", "-L", "-A", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", url],
            capture_output=True,
            text=True,
            timeout=8
        )
        status = int(res.stdout.strip())
        # If status code is valid (200s, 300s, or even 403 bot blocks)
        if status in [200, 301, 302, 307, 308, 403, 401, 429]:
            return True, f"Curl verified (HTTP {status})"
        return False, f"Curl reported HTTP {status}"
    except Exception as e:
        return False, f"Curl failed: {str(e)}"

def validate_url(name, url):
    url = url.strip()
    if not url.startswith("http"):
        url = "https://" + url

    # Apply manual overlays if matches
    clean_url = url.rstrip('/')
    for old_url, new_url in URL_OVERLAYS.items():
        if old_url.rstrip('/') == clean_url:
            url = new_url
            break

    # Quick check for known legitimate domains
    parsed = urllib3.util.parse_url(url)
    host = parsed.host or ""
    if any(domain in host for domain in LEGIT_BLOCKED_DOMAINS):
        return name, url, True, "Legitimate domain (auto-passed)"

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
    }

    try:
        r = requests.get(url, headers=headers, timeout=8, allow_redirects=True, verify=False)
        if r.status_code in [404, 410, 502, 503, 504]:
            # Try curl fallback
            ok, msg = verify_link_with_curl(url)
            if ok:
                return name, url, True, f"Verified via Curl: {msg}"
            return name, url, False, f"HTTP Error ({r.status_code})"
        return name, url, True, f"HTTP {r.status_code}"
    except Exception as e:
        # Try curl fallback
        ok, msg = verify_link_with_curl(url)
        if ok:
            return name, url, True, f"Verified via Curl: {msg}"
        return name, url, False, f"Python error and curl failed: {str(e)}"

def main():
    yaml_mappings = {
        "deepseek_yaml_20260709_0d641f.yaml": "Reddit Sources",
        "deepseek_yaml_20260709_aea563.yaml": "LinkedIn Searches",
        "deepseek_yaml_20260709_bd4585.yaml": "Web3 Job Boards",
        "deepseek_yaml_20260709_8b1f9e.yaml": "Company Careers Pages"
    }

    jobs_by_category = {cat: [] for cat in yaml_mappings.values()}

    # Add Reddit JSON API search as requested by user
    jobs_by_category["Reddit Sources"].append({
        "name": "r/ethdev (Ethereum developers JSON API)",
        "url": "https://www.reddit.com/r/ethdev/search.json?q=flair%3AHiring&restrict_sr=on&sort=new&limit=100"
    })

    # Collect entries from files
    all_tasks = []
    for fn, cat in yaml_mappings.items():
        path = os.path.join(base_dir, fn)
        if not os.path.exists(path):
            print(f"Skipping {fn} (not found)")
            continue
        with open(path, 'r') as f:
            data = yaml.safe_load(f)
            if isinstance(data, list):
                for item in data:
                    all_tasks.append((item.get('name'), item['url'], cat))

    print(f"Loaded {len(all_tasks)} URLs from YAML files. Validating in parallel...")

    validated_results = []
    with ThreadPoolExecutor(max_workers=20) as executor:
        future_to_info = {executor.submit(validate_url, name, url): (name, url, cat) for name, url, cat in all_tasks}
        for future in as_completed(future_to_info):
            name, url, cat = future_to_info[future]
            try:
                name, validated_url, is_valid, msg = future.result()
                if is_valid:
                    jobs_by_category[cat].append({
                        "name": name,
                        "url": validated_url
                    })
                else:
                    print(f"❌ INVALID: [{cat}] {name} ({url}) -> {msg}")
            except Exception as e:
                print(f"❌ ERROR: [{cat}] {name} ({url}) -> {e}")

    # Output back to YAML
    with open(output_path, 'w') as f:
        yaml.safe_dump(jobs_by_category, f, sort_keys=False)

    total_valid = sum(len(jobs_by_category[cat]) for cat in jobs_by_category)
    print(f"\n🎉 Validation completed. Saved {total_valid} valid URLs grouped by category to: {output_path}")

if __name__ == "__main__":
    main()
