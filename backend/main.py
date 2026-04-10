import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import json

app = FastAPI(title="Stitch SOC API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            await connection.send_text(json.dumps(message))

manager = ConnectionManager()

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Stitch SOC Backend Running"}

@app.get("/api/processes")
def get_processes():
    import psutil
    procs = []
    for p in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent', 'username', 'status']):
        try:
            procs.append(p.info)
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            pass
    procs = sorted(procs, key=lambda p: p['cpu_percent'] or 0, reverse=True)[:20]
    return procs

@app.get("/api/network-connections")
def get_network_connections():
    import psutil
    conns = []
    try:
        for c in psutil.net_connections(kind='inet'):
            conns.append({
                "laddr_ip": c.laddr.ip if c.laddr else "",
                "laddr_port": c.laddr.port if c.laddr else 0,
                "raddr_ip": c.raddr.ip if c.raddr else "",
                "raddr_port": c.raddr.port if c.raddr else 0,
                "status": c.status,
                "type": "TCP" if c.type.name == "SOCK_STREAM" else "UDP",
                "pid": c.pid,
            })
    except psutil.AccessDenied:
        pass
    return conns[:50]

@app.get("/api/network-stats")
def get_network_stats():
    import psutil
    io = psutil.net_io_counters(pernic=True)
    stats = {}
    for nic, counters in io.items():
        stats[nic] = {
            "bytes_sent": counters.bytes_sent,
            "bytes_recv": counters.bytes_recv,
            "packets_sent": counters.packets_sent,
            "packets_recv": counters.packets_recv,
            "errin": counters.errin,
            "errout": counters.errout,
            "dropin": counters.dropin,
            "dropout": counters.dropout,
        }
    return stats

@app.get("/api/disk-partitions")
def get_disk_partitions():
    import psutil
    result = []
    for part in psutil.disk_partitions(all=False):
        try:
            usage = psutil.disk_usage(part.mountpoint)
            result.append({
                "device": part.device,
                "mountpoint": part.mountpoint,
                "fstype": part.fstype,
                "total": usage.total,
                "used": usage.used,
                "free": usage.free,
                "percent": usage.percent,
            })
        except (PermissionError, OSError):
            pass
    return result


class PasswordRequest(BaseModel):
    password: str

@app.post("/api/analyze-password")
def analyze_pass(req: PasswordRequest):
    from modules.password_analyzer import analyze_password
    return analyze_password(req.password)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming ws messages if needed
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Start background monitoring tasks on startup
@app.on_event("startup")
async def startup_event():
    import tempfile
    from modules.system_monitor import system_stats_generator
    from modules.ids_engine import ids_generator
    from modules.file_monitor import file_monitor
    
    # Get the RUNNING event loop so the watchdog thread can safely push events onto it
    loop = asyncio.get_event_loop()
    
    # Watch the system temp directory — this is where test_runner.py writes files
    watch_path = tempfile.gettempdir()
    file_monitor.start(watch_path, loop=loop)
    
    # Background task to send stats
    async def stats_sender():
        async for stat in system_stats_generator():
            await manager.broadcast(stat)
            
    async def ids_sender():
        async for alert in ids_generator():
            await manager.broadcast(alert)
    
    async def file_sender():
        async for event in file_monitor.events():
            await manager.broadcast(event)
            
    asyncio.create_task(stats_sender())
    asyncio.create_task(ids_sender())
    asyncio.create_task(file_sender())

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
