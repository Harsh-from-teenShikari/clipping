import re
import json
import subprocess
import os

def extract_views(platform: str, url: str) -> int:
    platform = platform.lower()

    # Test mode — test_15000 in URL
    match = re.search(r'test_(\d+)', url)
    if match:
        return int(match.group(1))

    try:
        # Path to your scraper script
        scraper_path = os.path.join(
            os.path.dirname(__file__),
            '../../scraper/scrape.js'
        )

        # Run Node.js scraper as subprocess
        result = subprocess.run(
            ['node', scraper_path, platform, url],
            capture_output=True,
            text=True,
            timeout=40  # 40 second timeout
        )

        # Parse the JSON output
        output = result.stdout.strip()
        print(f"Scraper output: {output}")

        data = json.loads(output)

        if data.get('success') and data.get('views', 0) > 0:
            return data['views']
        else:
            print(f"Scraper failed: {data.get('error', 'unknown')}")
            return 0

    except subprocess.TimeoutExpired:
        print(f"Scraper timed out for {url}")
        return 0
    except Exception as e:
        print(f"Scraper error: {e}")
        return 0
