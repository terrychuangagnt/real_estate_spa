#!/usr/bin/env python3
"""實價查詢 SPA API 驗證腳本 - 最後版"""
import urllib.request
import urllib.parse
import json
import sys

BASE_DIRECT = "http://localhost:3002"
BASE_PROXY = "http://localhost:5173"

ALL_TESTS = []

def fetch(url):
    """發 GET，回傳 (status, parsed_json_or_raw, raw_str)"""
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=10) as resp:
            raw = resp.read().decode('utf-8')
            status = resp.status
            ct = resp.headers.get('Content-Type', '')
            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                data = {"_raw_text": raw[:500]}
            return status, data, raw[:3000], ct
    except urllib.error.HTTPError as e:
        raw = e.read().decode('utf-8', errors='replace')
        try:
            data = json.loads(raw)
        except:
            data = {"_http_error": e.code, "_raw": raw[:1000]}
        return e.code, data, raw[:3000], ''
    except Exception as e:
        return None, {"_exception": str(e)}, str(e)[:2000], ''

def record(name, url, status, data):
    ALL_TESTS.append({"name": name, "url": url, "status": status, "data": data})

def print_results():
    print("\n" + "#"*70)
    print("         實價查詢 SPA API 前後端串接驗證結果")
    print("#"*70)
    
    all_ok = True
    
    for t in ALL_TESTS:
        name = t["name"]
        url = t["url"]
        status = t["status"]
        d = t["data"]
        
        ok = True
        detail = ""
        
        if status != 200:
            ok = False
            detail = f"HTTP {status} 請求失敗"
        elif name == "GET /api/cities (dataServer)" or name == "GET /api/cities (Vite proxy)":
            cnt = len(d) if isinstance(d, list) else 0
            detail = f"{cnt} 個縣市"
            if cnt != 21:
                ok = False
                detail += f" (預期 21)"
            if name == "Vite proxy" and cnt == 0:
                ok = False
                detail += " → Proxy 可能有問題"
        elif "districts" in name.lower():
            code = 'f' if 'code=f' in url else ('h' if 'code=h' in url else '?')
            dists = d.get('districts', []) if isinstance(d, dict) else []
            cnt = len(dists)
            city_name = "新北" if code == 'f' else ("桃園" if code == 'h' else "未知")
            detail = f"{cnt} 個行政區 ({city_name})"
            if cnt == 0:
                ok = False
                detail += " → 回傳空列表"
        elif "search" in name.lower():
            code = urllib.parse.parse_qs(urllib.parse.urlparse(url).query).get('city_code', [''])[0]
            size_req = urllib.parse.parse_qs(urllib.parse.urlparse(url).query).get('page_size', [''])[0]
            recs = d.get('data', d.get('records', [])) if isinstance(d, dict) else []
            cnt = len(recs)
            total = d.get('total', 0) if isinstance(d, dict) else "?"
            city_name = "新北" if code == 'f' else ("台中" if code == 'b' else "未知")
            detail = f"{cnt}/{total} 筆交易紀錄 ({city_name})"
            if int(size_req) > 0 and cnt != int(size_req):
                ok = False
                detail += f" (預期 {size_req})"
        else:
            detail = f"OK (keys: {list(d.keys()) if isinstance(d, dict) else type(d).__name__})"
        
        # Extra details
        extra = ""
        if isinstance(d, list) and d and name == "GET /api/cities (dataServer)":
            names = ", ".join([item.get('name', '?')[:4] for item in d])
            extra = f"  => {names}"
        elif isinstance(d, dict) and 'districts' in d and d['districts']:
            extra = f"  => {', '.join(d['districts'][:6])}..." if len(d['districts']) > 6 else f"  => {d['districts']}"
        elif isinstance(d, dict) and 'data' in d and d['data']:
            sample = d['data'][0]
            extra = f"  => city_code={sample.get('city_code')}, district={sample.get('district')}"
        
        icon = "✅" if ok else "❌"
        if not ok:
            all_ok = False
        print(f"\n{icon} {name}")
        print(f"   URL : {url}")
        print(f"   HTTP: {status}")
        print(f"   結果: {detail}")
        if extra:
            print(f"   補充: {extra}")
        if status and status != 200:
            err_info = str(d)
            print(f"   錯誤: {err_info[:200]}")
    
    print("\n" + "="*70)
    if all_ok:
        print("🎉 全部測試通過！前後端串接正常。")
    else:
        print("⚠️ 有部分測試未通過。")
    print("="*70)
    
    # Fail count
    failed = sum(1 for t in ALL_TESTS if not all([
        t['status'] == 200,
        'cities' in t['name'].lower() and len(t['data']) == 21 if isinstance(t['data'], list) else True,
        'district' in t['name'].lower() and (isinstance(t['data'], dict) and len(t['data'].get('districts', [])) > 0) if isinstance(t['data'], dict) else True,
        'search' in t['name'].lower() and len(t['data'].get('data', [])) == int(urllib.parse.parse_qs(urllib.parse.urlparse(t['url']).query).get('page_size', ['1'])[0]) if isinstance(t['data'], dict) else True,
    ]))
    
    return all_ok

# ========== Execute Tests ==========

print("="*70)
print("   實價查詢 SPA 前後端串接驗證")
print("="*70)

# 1. GET /api/cities (direct)
s, d, _, _ = fetch(f"{BASE_DIRECT}/api/cities")
record("GET /api/cities (dataServer)", f"{BASE_DIRECT}/api/cities", s, d)

# 2. GET /api/districts?city_code=f
s, d, _, _ = fetch(f"{BASE_DIRECT}/api/districts?city_code=f")
record("GET /api/districts?city_code=f (新北市)", f"{BASE_DIRECT}/api/districts?city_code=f", s, d)

# 3. GET /api/districts?city_code=h
s, d, _, _ = fetch(f"{BASE_DIRECT}/api/districts?city_code=h")
record("GET /api/districts?city_code=h (桃園市)", f"{BASE_DIRECT}/api/districts?city_code=h", s, d)

# 4. GET /api/search?city_code=f&page_size=5
s, d, _, _ = fetch(f"{BASE_DIRECT}/api/search?city_code=f&page_size=5")
record("GET /api/search?city_code=f&page_size=5 (新北市)", f"{BASE_DIRECT}/api/search?city_code=f&page_size=5", s, d)

# 5. GET /api/search?city_code=b&page_size=3
s, d, _, _ = fetch(f"{BASE_DIRECT}/api/search?city_code=b&page_size=3")
record("GET /api/search?city_code=b&page_size=3 (台中市)", f"{BASE_DIRECT}/api/search?city_code=b&page_size=3", s, d)

# 6. Vite proxy /api/cities
s, d, _, _ = fetch(f"{BASE_PROXY}/api/cities")
record("GET /api/cities (Vite proxy :5173)", f"{BASE_PROXY}/api/cities", s, d)

# 7. Vite proxy /api/search
s, d, _, _ = fetch(f"{BASE_PROXY}/api/search?city_code=f&page_size=3")
record("GET /api/search?city_code=f&page_size=3 (Vite proxy)", f"{BASE_PROXY}/api/search?city_code=f&page_size=3", s, d)

result = print_results()
sys.exit(0 if result else 1)
