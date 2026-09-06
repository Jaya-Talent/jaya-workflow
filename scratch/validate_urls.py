import os
import yaml
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
import urllib3

# Suppress insecure request warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

base_dir = "/Users/adam/Documents/jayya workflow"
yaml_files = [
    "deepseek_yaml_20260709_0d641f.yaml",
    "deepseek_yaml_20260709_8b1f9e.yaml",
    "deepseek_yaml_20260709_aea563.yaml",
    "deepseek_yaml_20260709_bd4585.yaml"
]

def check_url(name, url):
    url = url.strip()
    if not url.startswith("http"):
        url = "https://" + url

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
    }

    try:
        # Check first with SSL verification enabled
        r = requests.get(url, headers=headers, timeout=8, allow_redirects=True)
        return name, url, r.status_code, r.url, True, f"Success ({r.status_code})"
    except requests.exceptions.SSLError:
        # Retry without SSL verification (e.g. expired certificate, still valid for user)
        try:
            r = requests.get(url, headers=headers, timeout=8, allow_redirects=True, verify=False)
            return name, url, r.status_code, r.url, True, f"Success without SSL verify ({r.status_code})"
        except Exception as e:
            return name, url, None, None, False, f"SSL/Connection Error ({str(e)})"
    except requests.exceptions.RequestException as e:
        # Check if it returned a response but threw an exception (e.g. 403, 404, etc.)
        if e.response is not None:
            status = e.response.status_code
            if status in [403, 401, 429, 999, 418]:
                return name, url, status, e.response.url, True, f"Valid but bot-blocked ({status})"
            return name, url, status, e.response.url, False, f"HTTP Error ({status})"
        return name, url, None, None, False, f"Request Exception: {str(e)}"
    except Exception as e:
        return name, url, None, None, False, f"Error: {str(e)}"

def main():
    all_entries = []
    for yf in yaml_files:
        path = os.path.join(base_dir, yf)
        if not os.path.exists(path):
            print(f"Skipping non-existent file: {path}")
            continue
        with open(path, 'r') as f:
            try:
                data = yaml.safe_load(f)
                if isinstance(data, list):
                    for item in data:
                        if isinstance(item, dict) and 'url' in item:
                            all_entries.append((item.get('name', 'Unknown'), item['url'], yf))
            except Exception as e:
                print(f"Error loading {yf}: {e}")

    print(f"Found {len(all_entries)} URLs to validate. Starting parallel validation...")

    results = []
    with ThreadPoolExecutor(max_workers=20) as executor:
        futures = {executor.submit(check_url, name, url): (name, url, yf) for name, url, yf in all_entries}
        for future in as_completed(futures):
            name, url, yf = futures[future]
            try:
                name, url, status, final_url, is_valid, msg = future.result()
                
                # Check status code manually to ensure redirect target is valid
                # Some sites redirect 301/302 to a 404 page or a login wall
                if is_valid and status is not None:
                    if status in [404, 410, 502, 503, 504]:
                        is_valid = False
                        msg = f"Redirected or returned error code ({status})"
                
                results.append({
                    'name': name,
                    'url': url,
                    'final_url': final_url,
                    'status': status,
                    'is_valid': is_valid,
                    'message': msg,
                    'source_file': yf
                })
            except Exception as e:
                results.append({
                    'name': name,
                    'url': url,
                    'final_url': None,
                    'status': None,
                    'is_valid': False,
                    'message': f"Exception: {str(e)}",
                    'source_file': yf
                })

    # Print summary
    valid_count = sum(1 for r in results if r['is_valid'])
    invalid_count = len(results) - valid_count
    print(f"\nValidation completed: {valid_count} Valid, {invalid_count} Invalid.")

    print("\n--- INVALID URLS ---")
    for r in sorted(results, key=lambda x: x['source_file']):
        if not r['is_valid']:
            print(f"[{r['source_file']}] {r['name']}: {r['url']} -> {r['message']}")

    # Save valid URLs to a file
    valid_entries = []
    for r in results:
        if r['is_valid']:
            valid_entries.append({
                'name': r['name'],
                'url': r['url'],
                'final_url': r['final_url'],
                'status': r['status'],
                'source_file': r['source_file']
            })

    output_path = os.path.join(base_dir, "validated_job_sources.yaml")
    with open(output_path, 'w') as f:
        yaml.safe_dump(valid_entries, f, sort_keys=False)
    print(f"\nSaved {len(valid_entries)} valid URLs to {output_path}")

if __name__ == "__main__":
    main()
