import psutil
import asyncio

async def get_system_stats():
    # Use psutil to gather stats
    cpu_percent = psutil.cpu_percent(interval=None)
    mem = psutil.virtual_memory()
    
    # Disk I/O
    disk_io = psutil.disk_io_counters()
    
    # Network I/O
    net_io = psutil.net_io_counters()

    stats = {
        "cpu": {
            "usage_percent": cpu_percent
        },
        "memory": {
            "total": mem.total,
            "available": mem.available,
            "percent": mem.percent,
            "used": mem.used
        },
        "disk": {
            "read_bytes": disk_io.read_bytes if disk_io else 0,
            "write_bytes": disk_io.write_bytes if disk_io else 0
        },
        "network": {
            "bytes_sent": net_io.bytes_sent if net_io else 0,
            "bytes_recv": net_io.bytes_recv if net_io else 0
        }
    }
    return stats

async def system_stats_generator():
    while True:
        stats = await get_system_stats()
        yield {"type": "system_stats", "data": stats}
        await asyncio.sleep(1) # Emit every second
