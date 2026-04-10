"use client";
import React, { useEffect, useState } from "react";


type FileEvent = {
    timestamp: string;
    path: string;
    action: "Modified" | "Created" | "Deleted" | "Moved";
    user: string;
    suspicious: boolean;
};

type DiskInfo = {
    device: string;
    mountpoint: string;
    fstype: string;
    total: number;
    used: number;
    free: number;
    percent: number;
};

function formatBytes(b: number) {
    if (b > 1e12) return (b / 1e12).toFixed(1) + " TB";
    if (b > 1e9) return (b / 1e9).toFixed(1) + " GB";
    if (b > 1e6) return (b / 1e6).toFixed(1) + " MB";
    return b + " B";
}

const actionColors: Record<string, string> = {
    Modified: "bg-blue-500/10 text-blue-400",
    Created: "bg-amber-500/10 text-amber-400",
    Deleted: "bg-purple-500/10 text-purple-400",
    Moved: "bg-emerald-500/10 text-emerald-400",
};

export default function FileMonitorPage() {
    const [fileEvents, setFileEvents] = useState<FileEvent[]>([]);
    const [disks, setDisks] = useState<DiskInfo[]>([]);

    useEffect(() => {
        const fetchDisks = async () => {
            try {
                const res = await fetch("http://localhost:8000/api/disk-partitions");
                const data = await res.json();
                setDisks(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchDisks();
        const inv = setInterval(fetchDisks, 10000);

        const ws = new WebSocket("ws://localhost:8000/ws");
        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                if (msg.type === "file_event") {
                    setFileEvents((prev) => [msg.data, ...prev].slice(0, 50));
                }
            } catch (err) { }
        };

        return () => {
            clearInterval(inv);
            ws.close();
        };
    }, []);

    const suspicious = fileEvents.filter((e) => e.suspicious);

    return (
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold tracking-tight">File System Monitor</h2>
                <p className="text-slate-500 dark:text-primary/60">
                    Real-time monitoring of file modifications and integrity across all volumes.
                </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-panel-dark/30 border border-border-dark p-5 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-medium text-slate-400">Integrity Status</p>
                        <span className="material-symbols-outlined text-accent-success">verified_user</span>
                    </div>
                    <h3 className="text-2xl font-bold text-accent-success">{suspicious.length > 0 ? "AT RISK" : "SECURE"}</h3>
                </div>
                <div className="bg-panel-dark/30 border border-border-dark p-5 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-medium text-slate-400">Events Tracked</p>
                        <span className="material-symbols-outlined text-primary">data_usage</span>
                    </div>
                    <h3 className="text-2xl font-bold">{fileEvents.length}</h3>
                </div>
                <div className="bg-panel-dark/30 border border-border-dark p-5 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-medium text-slate-400">Pending Alerts</p>
                        <span className="material-symbols-outlined text-rose-500">warning</span>
                    </div>
                    <h3 className="text-2xl font-bold text-rose-400">{suspicious.length} Suspicious</h3>
                </div>
                <div className="bg-panel-dark/30 border border-border-dark p-5 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-medium text-slate-400">Volumes Monitored</p>
                        <span className="material-symbols-outlined text-slate-400">history</span>
                    </div>
                    <h3 className="text-2xl font-bold">{disks.length}</h3>
                </div>
            </div>

            {/* Main split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* File Activity Table */}
                <section className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">list_alt</span>
                            Live File Activity Log
                        </h3>
                        <span className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase animate-pulse">
                            <span className="size-1.5 rounded-full bg-primary"></span>
                            Monitoring Active
                        </span>
                    </div>
                    <div className="bg-panel-dark/30 border border-border-dark rounded-xl overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-background-dark/30 text-[10px] uppercase tracking-widest text-slate-500 font-bold border-b border-border-dark">
                                    <th className="px-6 py-4">Timestamp</th>
                                    <th className="px-6 py-4">File Path</th>
                                    <th className="px-6 py-4">Action</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-border-dark">
                                {fileEvents.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                            Waiting for file system events...
                                        </td>
                                    </tr>
                                ) : (
                                    fileEvents.map((ev, i) => (
                                        <tr key={i} className="hover:bg-primary/5 transition-colors">
                                            <td className="px-6 py-4 text-slate-400 font-mono text-xs">{ev.timestamp}</td>
                                            <td className="px-6 py-4 font-medium truncate max-w-[200px] text-xs font-mono">{ev.path}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${actionColors[ev.action] || "bg-slate-500/10 text-slate-400"}`}>
                                                    {ev.action}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`flex items-center gap-2 ${ev.suspicious ? "text-rose-500" : "text-accent-success"}`}>
                                                    <span className="material-symbols-outlined text-sm">{ev.suspicious ? "warning" : "check_circle"}</span>
                                                    <span className="text-xs font-medium">{ev.suspicious ? "Suspicious" : "Normal"}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Disk Partitions + Alerts */}
                <section className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">storage</span>
                        Disk Volumes
                    </h3>
                    <div className="space-y-3">
                        {disks.map((d, i) => (
                            <div key={i} className="bg-panel-dark/30 border border-border-dark rounded-xl p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="text-sm font-bold font-mono">{d.mountpoint}</p>
                                        <p className="text-[10px] text-slate-500">{d.device} • {d.fstype}</p>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${d.percent > 85 ? "text-rose-400 bg-rose-500/10" : "text-accent-success bg-accent-success/10"}`}>
                                        {d.percent.toFixed(0)}%
                                    </span>
                                </div>
                                <div className="h-2 bg-border-dark rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${d.percent > 85 ? "bg-rose-500" : "bg-primary"}`}
                                        style={{ width: `${d.percent}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between mt-1 text-[10px] text-slate-500">
                                    <span>Used: {formatBytes(d.used)}</span>
                                    <span>Free: {formatBytes(d.free)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    {suspicious.length > 0 && (
                        <div className="space-y-3 mt-4">
                            <h3 className="text-sm font-bold flex items-center gap-2 text-rose-400">
                                <span className="material-symbols-outlined text-rose-500">error</span>
                                Suspicious Activity
                            </h3>
                            {suspicious.slice(0, 3).map((ev, i) => (
                                <div key={i} className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-4 flex gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-500">
                                        <span className="material-symbols-outlined">gpp_maybe</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold uppercase text-rose-500 mb-1">Suspicious Activity</p>
                                        <p className="text-sm font-bold truncate">{ev.path}</p>
                                        <p className="text-xs text-slate-500 mt-1">{ev.action} at {ev.timestamp}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
