"""
Stitch SOC Test Suite
Harmless scripts to simulate system activity and trigger the monitoring features.
Run each test individually using: python test_runner.py <test_name>
"""

import sys
import time
import threading
import socket
import os
import tempfile
import math

def test_cpu_spike():
    """Simulates a brief but intense CPU spike to trigger system_monitor alerts."""
    print("[TEST] CPU Spike — running heavy computation for 5 seconds...")
    end_time = time.time() + 5
    def burn():
        while time.time() < end_time:
            _ = math.sqrt(sum(i**2 for i in range(10000)))
    
    threads = [threading.Thread(target=burn) for _ in range(4)]
    for t in threads: t.start()
    for t in threads: t.join()
    print("[TEST] CPU Spike complete. Check the System Monitoring page.")

def test_memory_spike():
    """Allocates a large amount of memory temporarily."""
    print("[TEST] Memory Spike — allocating ~200 MB for 5 seconds...")
    data = bytearray(200 * 1024 * 1024)  # 200 MB
    time.sleep(5)
    del data
    print("[TEST] Memory Spike complete. Check the System Monitoring page.")

def test_file_events():
    """Creates, modifies, renames, and deletes files in the temp folder to trigger the File Monitor."""
    print("[TEST] File Events — creating, modifying, renaming, and deleting files in temp dir...")
    # IMPORTANT: files must be in tempdir because that's where the backend watchdog watches
    base = tempfile.gettempdir()
    
    for i in range(10):
        path = os.path.join(base, f"stitch_soc_event_{i}.txt")
        
        # Create
        with open(path, "w") as f:
            f.write(f"Stitch SOC test file {i}\n")
        time.sleep(0.3)
        
        # Modify
        with open(path, "a") as f:
            f.write("Modified by SOC test\n")
        time.sleep(0.2)
        
        # Rename
        renamed = os.path.join(base, f"stitch_soc_event_{i}_renamed.txt")
        os.rename(path, renamed)
        time.sleep(0.2)
        
        # Delete
        os.remove(renamed)
        time.sleep(0.2)
    
    print("[TEST] File Events complete — check the File System Monitor page.")

def test_local_connections():
    """Opens many local TCP connections to simulate high-volume connection activity for IDS detection."""
    print("[TEST] Local Connections — opening 60 localhost connections to trigger IDS...")
    socks = []
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind(("127.0.0.1", 19999))
    server.listen(100)
    server.settimeout(1)

    def accept():
        while True:
            try:
                conn, _ = server.accept()
                socks.append(conn)
            except socket.timeout:
                break

    accept_thread = threading.Thread(target=accept)
    accept_thread.daemon = True
    accept_thread.start()

    clients = []
    for _ in range(60):
        try:
            c = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            c.connect(("127.0.0.1", 19999))
            clients.append(c)
        except Exception:
            pass
    
    print("[TEST] Holding 60 connections for 5 seconds...")
    time.sleep(5)
    
    for c in clients:
        c.close()
    server.close()
    print("[TEST] Local Connections test complete. Check the IDS/Network pages.")

def test_disk_io():
    """Writes and reads a large file to generate disk I/O metrics."""
    print("[TEST] Disk I/O — writing and reading a 50 MB test file...")
    path = os.path.join(tempfile.gettempdir(), "stitch_soc_disk_test.bin")
    data = os.urandom(50 * 1024 * 1024)  # 50 MB
    with open(path, "wb") as f:
        f.write(data)
    with open(path, "rb") as f:
        _ = f.read()
    os.remove(path)
    print("[TEST] Disk I/O test complete. Check the System Monitoring page.")


TESTS = {
    "cpu": test_cpu_spike,
    "memory": test_memory_spike,
    "files": test_file_events,
    "connections": test_local_connections,
    "disk": test_disk_io,
}

if __name__ == "__main__":
    if len(sys.argv) < 2 or sys.argv[1] not in TESTS:
        print("Usage: python test_runner.py <test>")
        print("Available tests:")
        for name, fn in TESTS.items():
            print(f"  {name:15s} — {fn.__doc__.strip().splitlines()[0]}")
        sys.exit(1)
    
    test_name = sys.argv[1]
    print(f"\n{'='*50}")
    print(f"Running test: {test_name}")
    print(f"{'='*50}\n")
    TESTS[test_name]()
    print("\n[DONE] Test finished.")
