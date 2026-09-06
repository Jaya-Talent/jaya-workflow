import os
import yaml
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

base_dir = "/Users/adam/Documents/jayya workflow"
yaml_files = [
    "deepseek_yaml_20260709_0d641f.yaml",
    "deepseek_yaml_20260709_8b1f9e.yaml",
    "deepseek_yaml_20260709_aea563.yaml",
    "deepseek_yaml_20260709_bd4585.yaml"
]

def check_url(name, url, yf):
    url = url.strip()
    if not url.startswith("http"):
        url = "https://" + url
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    try:
        r = requests.get(url, headers=headers, timeout=8, allow_redirects=True, verify=False)
        if r.status_code in [404, 410, 502, 503, 504]:
            return name, url, yf, False, f"HTTP {r.status_code}"
        return name, url, yf, True, f"HTTP {r.status_code}"
    except Exception as e:
        return name, url, yf, False, str(e)

def main():
    all_entries = []
    for yf in yaml_files:
        path = os.path.join(base_dir, yf)
        if not os.path.exists(path):
            continue
        with open(path, 'r') as f:
            data = yaml.safe_load(f)
            if isinstance(data, list):
                for item in data:
                    all_entries.append((item.get('name'), item['url'], yf))

    invalid_entries = []
    with ThreadPoolExecutor(max_workers=20) as executor:
        futures = {executor.submit(check_url, name, url, yf): (name, url, yf) for name, url, yf in all_entries}
        for future in as_completed(futures):
            try:
                name, url, yf, is_valid, msg = future.result()
                if not is_valid:
                    invalid_entries.append({
                        'name': name,
                        'url': url,
                        'error': msg,
                        'file': yf
                    })
            except Exception as e:
                name, url, yf = futures[future]
                invalid_entries.append({
                    'name': name,
                    'url': url,
                    'error': f"Exception: {str(e)}",
                    'file': yf
                })

    print(f"Total invalid: {len(invalid_entries)}")
    for ie in sorted(invalid_entries, key=lambda x: x['file']):
        print(f"[{ie['file']}] {ie['name']} ({ie['url']}): {ie['error']}")

if __name__ == "__main__":
    main()
