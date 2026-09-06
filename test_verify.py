import urllib.request
import ssl
import re

def verify_url(url):
    print(f"Verifying {url}")
    
    # Smarter Greenhouse check
    if "gh_jid=" in url or "greenhouse.io" in url or "coinbase.com/careers/positions/" in url:
        # Extract greenhouse job id
        match = re.search(r'positions/(\d+)', url) or re.search(r'jobs/(\d+)', url) or re.search(r'gh_jid=(\d+)', url)
        if match:
            job_id = match.group(1)
            # Find the board name if possible, else we can't query the API easily.
            # But wait! For greenhouse, there's a generic endpoint if we know the board token.
            # If we don't know the board token, we might not be able to use the API.
            pass

    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'})
        context = ssl._create_unverified_context()
        with urllib.request.urlopen(req, timeout=10, context=context) as response:
            content = response.read().decode('utf-8').lower()
            if "not found" in content and "coinbase.com" in url:
                return False
            return True
    except urllib.error.HTTPError as e:
        if e.code in [404, 410]:
            return False
        # If it's a 403, read the body to see if it's cloudflare or a soft 404
        content = e.read().decode('utf-8', errors='ignore').lower()
        if "not found" in content or "page not found" in content:
            return False
        return True
    except Exception:
        return False

print(verify_url("https://www.coinbase.com/careers/positions/7993472"))
