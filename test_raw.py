#!/usr/bin/env python3
"""直接檢查 raw response body"""
import urllib.request
import json

url = "http://localhost:3002/api/cities"
req = urllib.request.Request(url)
with urllib.request.urlopen(req, timeout=10) as resp:
    raw = resp.read()
    print(f"Header Content-Type: {resp.headers.get('Content-Type')}")
    print(f"Raw bytes (first 500): {raw[:500]}")
    print(f"Raw bytes (last 500): {raw[-500:]}")
    print(f"Total bytes: {len(raw)}")
    # Decode
    text = raw.decode('utf-8')
    print(f"Raw string: {text}")

# Also check /api/search for comparison
url2 = "http://localhost:3002/api/search?city_code=f&page_size=2"
req2 = urllib.request.Request(url2)
with urllib.request.urlopen(req2, timeout=10) as resp:
    raw2 = resp.read()
    text2 = raw2.decode('utf-8')
    print(f"\n/search response (first 1000): {text2[:1000]}")

# Check /api/data/health
url3 = "http://localhost:3002/api/data/health"
req3 = urllib.request.Request(url3)
with urllib.request.urlopen(req3, timeout=10) as resp:
    raw3 = resp.read()
    text3 = raw3.decode('utf-8')
    print(f"\n/health response: {text3}")
