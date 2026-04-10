import asyncio
import datetime
import os
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# Suspicious path patterns to flag
SUSPICIOUS_PATTERNS = [
    ".ssh", "passwd", "shadow", "sudoers",
    "boot", "vmlinuz", ".bash_history", "crontab",
    "etc/hosts", "authorized_keys",
]

def is_suspicious(path: str) -> bool:
    p = path.replace("\\", "/").lower()
    return any(pat in p for pat in SUSPICIOUS_PATTERNS)

ACTION_MAP = {
    "modified": "Modified",
    "created": "Created",
    "deleted": "Deleted",
    "moved": "Moved",
}

class _StitchEventHandler(FileSystemEventHandler):
    """Watchdog event handler. Runs in a background OS thread."""

    def __init__(self, loop: asyncio.AbstractEventLoop, queue: asyncio.Queue):
        super().__init__()
        # Store the RUNNING event loop so we can safely push events from this thread
        self._loop = loop
        self._queue = queue

    def _push(self, action: str, path: str):
        payload = {
            "type": "file_event",
            "data": {
                "timestamp": datetime.datetime.now().strftime("%H:%M:%S.%f")[:-3],
                "path": path,
                "action": action,
                "user": os.environ.get("USERNAME") or os.environ.get("USER") or "system",
                "suspicious": is_suspicious(path),
            }
        }
        # Thread-safe: schedule put on the asyncio loop that is running in the main thread
        self._loop.call_soon_threadsafe(self._queue.put_nowait, payload)

    def on_modified(self, event):
        if not event.is_directory:
            self._push("Modified", event.src_path)

    def on_created(self, event):
        if not event.is_directory:
            self._push("Created", event.src_path)

    def on_deleted(self, event):
        if not event.is_directory:
            self._push("Deleted", event.src_path)

    def on_moved(self, event):
        dest = getattr(event, "dest_path", event.src_path)
        if not event.is_directory:
            self._push("Moved", dest)


class FileMonitor:
    def __init__(self):
        self.observer = None
        self._queue: asyncio.Queue = None

    def start(self, path: str, loop: asyncio.AbstractEventLoop):
        """
        Start watching `path` recursively.
        Must be called from inside the async context so it gets the real running loop.
        """
        if not os.path.isdir(path):
            return
        self._queue = asyncio.Queue()
        handler = _StitchEventHandler(loop=loop, queue=self._queue)
        self.observer = Observer()
        self.observer.schedule(handler, path=path, recursive=True)
        self.observer.start()

    def stop(self):
        if self.observer:
            self.observer.stop()
            self.observer.join()

    async def events(self):
        """Async generator — yields file events as they arrive."""
        if self._queue is None:
            return
        while True:
            event = await self._queue.get()
            yield event


file_monitor = FileMonitor()
