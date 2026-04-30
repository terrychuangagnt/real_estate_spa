"""
負載測試 - 對搜尋端點發送 N 次請求
"""

import urllib.request
import json
import time
import sys


BASE_URL = "http://localhost:3002/api/search"
NUM_REQUESTS = 50
RESULTS = []


def fetch(city_code, page_size=10):
    url = f"{BASE_URL}?city_code={city_code}&page_size={page_size}"
    start = time.time()
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode())
            elapsed = time.time() - start
            return {
                "ok": True, "status": resp.status,
                "time_ms": round(elapsed * 1000, 2),
                "total": data.get("total", 0),
            }
    except Exception as e:
        return {"ok": False, "error": str(e)}


def main():
    print(f"Load testing: {NUM_REQUESTS} requests to /api/search")
    print("-" * 60)

    ok = 0
    fail = 0
    total_time = 0
    start_time = time.time()

    for i in range(NUM_REQUESTS):
        city_codes = ['f', 'b', 'h', 'a', 'e', 'g', 'n', 'm']
        city = city_codes[i % len(city_codes)]
        result = fetch(city, page_size=5)

        RESULTS.append(result)

        if result["ok"]:
            ok += 1
            total_time += result["time_ms"]
        else:
            fail += 1

    elapsed_total = (time.time() - start_time) * 1000
    rps = NUM_REQUESTS / (elapsed_total / 1000)

    print(f"Total: {NUM_REQUESTS} requests in {elapsed_total:.0f}ms")
    print(f"Success: {ok}, Failed: {fail}")
    print(f"Average response time: {total_time // max(ok, 1):.1f}ms")
    print(f"Throughput: {rps:.1f} req/s")
    print("-" * 60)

    if fail > 0:
        failures = [r for r in RESULTS if not r["ok"]]
        print(f"Failure details (first 5):")
        for f in failures[:5]:
            print(f"  - {f['error']}")

    sys.exit(0 if fail == 0 else 1)


main()
