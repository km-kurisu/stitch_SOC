"use client";
import React, { useEffect, useState, useRef } from "react";

type Connection = {
    laddr_ip: string;
    laddr_port: number;
    raddr_ip: string;
    raddr_port: number;
    status: string;
    type: string;
    pid: number | null;
};

type NetStats = {
    bytes_sent: number;
    bytes_recv: number;
    packets_sent: number;
    packets_recv: number;
    errin: number;
    errout: number;
    dropin: number;
    dropout: number;
};

function formatBytes(b: number) {
    if (b > 1e9) return (b / 1e9).toFixed(1) + " GB";
    if (b > 1e6) return (b / 1e6).toFixed(1) + " MB";
    if (b > 1e3) return (b / 1e3).toFixed(1) + " KB";
    return b + " B";
}

const COMMON_PORTS: Record<number, string> = {
    80: "HTTP", 443: "HTTPS", 22: "SSH", 21: "FTP",
    53: "DNS", 8080: "ALT-HTTP", 3306: "MySQL", 3389: "RDP",
    5432: "PgSQL", 27017: "MongoDB",
};

export default function NetworkPage() {
    const [connections, setConnections] = useState<Connection[]>([]);
    const [stats, setStats] = useState<Record<string, NetStats>>({});
    const [totalRecv, setTotalRecv] = useState(0);
    const [totalSent, setTotalSent] = useState(0);
    const prevStatsRef = useRef<Record<string, NetStats>>({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [connRes, statsRes] = await Promise.all([
                    fetch("http://localhost:8000/api/network-connections"),
                    fetch("http://localhost:8000/api/network-stats"),
                ]);
                const connData: Connection[] = await connRes.json();
                const statsData: Record<string, NetStats> = await statsRes.json();

                setConnections(connData);
                setStats(statsData);

                const sent = Object.values(statsData).reduce((a, s) => a + s.bytes_sent, 0);
                const recv = Object.values(statsData).reduce((a, s) => a + s.bytes_recv, 0);
                setTotalSent(sent);
                setTotalRecv(recv);
            } catch (err) {
                console.error(err);
            }
        };

        fetchData();
        const inv = setInterval(fetchData, 3000);
        return () => clearInterval(inv);
    }, []);

    const established = connections.filter((c) => c.status === "ESTABLISHED");
    const listening = connections.filter((c) => c.status === "LISTEN");

    return (
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-6">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Network Traffic</h2>
                    <p className="text-slate-400 mt-1">Real-time packet inspection and interface telemetry</p>
                </div>
                <div className="flex gap-3">
                    <span className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold rounded-lg bg-accent-success/10 text-accent-success uppercase">
                        <span className="size-1.5 rounded-full bg-accent-success animate-pulse"></span>
                        Live Analysis
                    </span>
                </div>
            </div>

            {/* Top Row: Bandwidth + Top Destinations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Packet Activity Chart */}
                <div className="lg:col-span-2 bg-panel-dark/30 border border-border-dark rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold">Bandwidth Usage</h3>
                            <p className="text-xs text-slate-500">Total I/O since session start</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="size-2 rounded-full bg-primary"></div>
                                <span className="text-xs text-slate-400">Incoming</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="size-2 rounded-full bg-accent-success"></div>
                                <span className="text-xs text-slate-400">Outgoing</span>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-4 bg-background-dark/40 rounded-lg border border-border-dark">
                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Total Received</p>
                            <p className="text-2xl font-bold text-primary">{formatBytes(totalRecv)}</p>
                        </div>
                        <div className="p-4 bg-background-dark/40 rounded-lg border border-border-dark">
                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Total Sent</p>
                            <p className="text-2xl font-bold text-accent-success">{formatBytes(totalSent)}</p>
                        </div>
                    </div>
                    {/* Network interfaces breakdown */}
                    <div className="space-y-3">
                        {Object.entries(stats).slice(0, 3).map(([nic, s]) => (
                            <div key={nic}>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="font-mono text-slate-400">{nic}</span>
                                    <span className="text-primary">{formatBytes(s.bytes_recv)} recv</span>
                                </div>
                                <div className="h-1.5 bg-border-dark rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(100, (s.bytes_recv / Math.max(1, totalRecv)) * 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Summary stats */}
                <div className="bg-panel-dark/30 border border-border-dark rounded-xl p-6 space-y-4">
                    <h3 className="text-lg font-bold mb-2">Connection Summary</h3>
                    <div className="p-4 bg-background-dark/40 rounded-lg border border-border-dark flex items-center justify-between">
                        <span className="text-sm text-slate-400">Established</span>
                        <span className="text-xl font-bold text-accent-success">{established.length}</span>
                    </div>
                    <div className="p-4 bg-background-dark/40 rounded-lg border border-border-dark flex items-center justify-between">
                        <span className="text-sm text-slate-400">Listening</span>
                        <span className="text-xl font-bold text-primary">{listening.length}</span>
                    </div>
                    <div className="p-4 bg-background-dark/40 rounded-lg border border-border-dark flex items-center justify-between">
                        <span className="text-sm text-slate-400">Total</span>
                        <span className="text-xl font-bold">{connections.length}</span>
                    </div>
                    <div className="p-4 bg-background-dark/40 rounded-lg border border-border-dark flex items-center justify-between">
                        <span className="text-sm text-slate-400">Interfaces</span>
                        <span className="text-xl font-bold">{Object.keys(stats).length}</span>
                    </div>
                </div>
            </div>

            {/* Active Connections Table */}
            <div className="bg-panel-dark/30 border border-border-dark rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-border-dark flex justify-between items-center">
                    <h3 className="text-lg font-bold">Active Connections</h3>
                    <div className="flex gap-2">
                        <span className="px-2 py-1 bg-background-dark/50 text-[10px] font-bold border border-border-dark rounded uppercase tracking-tighter">Live Feed</span>
                        <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded uppercase">{established.length} Active</span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-background-dark/30 text-slate-400 text-xs font-bold uppercase tracking-wider">
                                <th className="px-6 py-3">Local</th>
                                <th className="px-6 py-3">Remote IP</th>
                                <th className="px-6 py-3">Port</th>
                                <th className="px-6 py-3">Protocol</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">PID</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-dark text-sm">
                            {connections.slice(0, 25).map((c, i) => (
                                <tr key={i} className="hover:bg-primary/5 transition-colors">
                                    <td className="px-6 py-3 font-mono text-primary text-xs">
                                        {c.laddr_port} {COMMON_PORTS[c.laddr_port] ? `(${COMMON_PORTS[c.laddr_port]})` : ""}
                                    </td>
                                    <td className="px-6 py-3 font-mono text-xs">{c.raddr_ip || "—"}</td>
                                    <td className="px-6 py-3 font-mono text-xs">{c.raddr_port || "—"} {c.raddr_port && COMMON_PORTS[c.raddr_port] ? `(${COMMON_PORTS[c.raddr_port]})` : ""}</td>
                                    <td className="px-6 py-3">
                                        <span className="px-2 py-0.5 bg-border-dark rounded text-xs">{c.type}</span>
                                    </td>
                                    <td className="px-6 py-3">
                                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${c.status === "ESTABLISHED" ? "text-accent-success" : "text-slate-400"}`}>
                                            <div className={`size-1.5 rounded-full ${c.status === "ESTABLISHED" ? "bg-accent-success" : "bg-slate-400"}`}></div>
                                            {c.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 font-mono text-xs text-slate-400">{c.pid ?? "—"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-3 bg-background-dark/30 border-t border-border-dark text-center">
                    <p className="text-xs text-slate-500">Showing {Math.min(25, connections.length)} of {connections.length} connections</p>
                </div>
            </div>

            {/* Footer Stats: NIC details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-panel-dark/30 border border-border-dark rounded-lg">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Total Packets In</p>
                    <p className="text-xl font-bold text-primary">
                        {Object.values(stats).reduce((a, s) => a + s.packets_recv, 0).toLocaleString()}
                    </p>
                </div>
                <div className="p-4 bg-panel-dark/30 border border-border-dark rounded-lg">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Total Packets Out</p>
                    <p className="text-xl font-bold text-accent-success">
                        {Object.values(stats).reduce((a, s) => a + s.packets_sent, 0).toLocaleString()}
                    </p>
                </div>
                <div className="p-4 bg-panel-dark/30 border border-border-dark rounded-lg">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Input Errors</p>
                    <p className="text-xl font-bold text-rose-400">
                        {Object.values(stats).reduce((a, s) => a + s.errin, 0)}
                    </p>
                </div>
                <div className="p-4 bg-panel-dark/30 border border-border-dark rounded-lg">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Dropped Packets</p>
                    <p className="text-xl font-bold text-orange-400">
                        {Object.values(stats).reduce((a, s) => a + s.dropin, 0)}
                    </p>
                </div>
            </div>
        </div>
    );
}
