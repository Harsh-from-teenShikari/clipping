import re
import random

def extract_views(platform: str, url: str) -> int:
    """
    Simulated view count extraction for different platforms.
    In a real scenario, this would involve scraping or using official APIs.
    """
    platform = platform.lower()
    
    # Simple simulated logic: extract a number from the URL if present, else random
    # e.g. https://.../test_1500 -> 1500 views
    match = re.search(r'test_(\d+)', url)
    if match:
        return int(match.group(1))
    
    # Generic random views for simulation
    if platform == "instagram":
        return random.randint(500, 5000)
    elif platform == "youtube":
        return random.randint(1000, 10000)
    elif platform == "twitter":
        return random.randint(100, 2000)
    
    return 0
