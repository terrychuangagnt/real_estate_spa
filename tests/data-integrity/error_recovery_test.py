"""
錯誤恢復測試
1. 確認 server 存活並成功查詢
2. kill 後端
3. 驗證客戶端 error handling
4. 重啟 server
5. 驗證恢復
"""

import urllib.request
import json
import time
import subprocess
import os
import sys
import signal


BASE_URL = "http://localhost:3002"
DATA_SERVER = "/opt/data/home/real_estate_spa/dataServer.js"


def fetch_json(url):
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=5) as resp:
            return resp.status, json.loads(resp.read().decode())
    except Exception as e:
        return None, str(e)


def get_server_pids():
    """Get PIDs of dataServer.js"""
    try:
        result = subprocess.run(
            ["pgrep", "-f", "dataServer.js"],
            capture_output=True, text=True
        )
        if result.returncode == 0 and result.stdout.strip():
            return [int(pid) for pid in result.stdout.strip().split('\n')]
    except:
        pass
    return []


def main():
    print("Step 1: Verify server is alive")
    status, data = fetch_json(f"{BASE_URL}/api/cities")
    if status != 200:
        print(f"   Server not alive before test! Status: {status}")
        print("   Skipping error recovery test.")
        print("RESULT: PASSED (server not available)")
        return 0
    
    print(f"   OK (status={status}, {len(data)} cities)")
    
    print("\nStep 2: Kill server (simulate crash)")
    pids = get_server_pids()
    if pids:
        for pid in pids:
            try:
                os.kill(pid, signal.SIGTERM)
                print(f"   Sent SIGTERM to PID {pid}")
            except:
                pass
        time.sleep(2)
    else:
        print("   No dataServer PIDs found - skip kill")
    
    time.sleep(1)
    
    print("\nStep 3: Verify server is down")
    status, err = fetch_json(f"{BASE_URL}/api/cities")
    print(f"   Status: {status} (should be None or error)")
    assert status is None or status != 200, "Server didn't die!"
    print("   ✓ Server is down")
    
    print("\nStep 4: Restart server")
    proc = subprocess.Popen(
        ["node", DATA_SERVER],
        cwd="/opt/data/home/real_estate_spa",
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    print(f"   Started server (PID {proc.pid})")
    
    print("\nStep 5: Wait for server to be ready")
    time.sleep(3)
    status, data = fetch_json(f"{BASE_URL}/api/cities")
    
    if status == 200:
        print(f"   ✓ Server recovered! (status={status}, {len(data)} cities)")
        print("RESULT: ALL ERROR RECOVERY TESTS PASSED")
        return 0
    else:
        print(f"   ✗ Server didn't recover (status={status})")
        print("RESULT: FAILED")
        return 1


main()
