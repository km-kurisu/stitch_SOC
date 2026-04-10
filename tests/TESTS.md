# Stitch SOC — Test Guide

All tests are **completely safe and harmless**. They only use local resources (CPU, memory, temp files, localhost ports). Nothing is sent externally.

## Prerequisites

Ensure your Python virtual environment is activated:
```powershell
cd d:\vscode\stitch_SOC\backend
.\venv\Scripts\activate
```

Then navigate to the tests folder:
```powershell
cd d:\vscode\stitch_SOC\tests
```

---

## Running Tests

```powershell
python test_runner.py <test_name>
```

---

## Available Tests

| Test | Command | What It Triggers |
|---|---|---|
| **CPU Spike** | `python test_runner.py cpu` | 4-thread computation for 5s → System Monitoring page |
| **Memory Spike** | `python test_runner.py memory` | Allocates 200 MB for 5s → System Monitoring page |
| **File Events** | `python test_runner.py files` | Creates/modifies/renames/deletes 10 temp files → File System Monitor page |
| **Connections** | `python test_runner.py connections` | Opens 60 localhost connections → IDS / Alerts / Network page |
| **Disk I/O** | `python test_runner.py disk` | Writes/reads 50 MB temp file → System Monitoring disk stats |

---

## What to Watch

### System Monitoring page (`/monitoring`)
Run `cpu`, `memory`, or `disk` tests and watch the gauges spike in real-time.

### IDS / Alerts pages (`/ids`, `/alerts`)
Run the `connections` test — this opens 60 simultaneous connections to `localhost:19999`, exceeding the IDS threshold of 50. You should see a **Critical** alert appear within 5 seconds.

### File System Monitor (`/file`)
Run the `files` test — file creation, modification, rename, and deletion events will appear in the live activity log (requires `watchdog` to be monitoring a directory via the backend).

### Logs page (`/logs`)
Any IDS alert or high CPU event (>90%) triggered by the tests will also auto-appear in the terminal-style log viewer.

---

## Example: Run All Tests Sequentially

```powershell
cd d:\vscode\stitch_SOC\tests

python test_runner.py cpu
python test_runner.py memory
python test_runner.py disk
python test_runner.py files
python test_runner.py connections
```

> **Tip**: Keep the app open on the relevant page before starting each test to observe it in real-time.
