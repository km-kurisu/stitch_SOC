import asyncio
import time
import psutil
import datetime

class IDSEngine:
    def __init__(self):
        self.packet_counts = {}
        self.port_scans = {}
        self.threshold = 1000 # packets per interval

    async def analyze_traffic(self, network_data):
        alerts = []
        try:
            conns = psutil.net_connections(kind='inet')
            ip_counts = {}
            unusual_ports = [22, 23, 3389, 445] # SSH, Telnet, RDP, SMB
            
            for conn in conns:
                # Count connections per remote IP
                if conn.raddr:
                    ip = conn.raddr.ip
                    port = conn.raddr.port
                    ip_counts[ip] = ip_counts.get(ip, 0) + 1
                    
                    if port in unusual_ports and conn.status == 'ESTABLISHED':
                        alerts.append({
                            "id": f"DX-{int(time.time())}",
                            "timestamp": datetime.datetime.now().strftime("%H:%M:%S"),
                            "level": "High",
                            "title": f"Sensitive Port Activity ({port})",
                            "description": f"Active connection to port {port} detected",
                            "source": ip
                        })

            for ip, count in ip_counts.items():
                if count > 50: # Arbitrary threshold for "many connections"
                    alerts.append({
                        "id": f"DX-{int(time.time())}",
                        "timestamp": datetime.datetime.now().strftime("%H:%M:%S"),
                        "level": "Critical",
                        "title": "High Connection Volume",
                        "description": f"Host has {count} active connections",
                        "source": ip
                    })
        except psutil.AccessDenied:
            pass
            
        return alerts

ids_engine = IDSEngine()

async def ids_generator():
    while True:
        alerts = await ids_engine.analyze_traffic(None)
        for alert in alerts:
            yield {"type": "ids_alert", "data": alert}
        await asyncio.sleep(5)

