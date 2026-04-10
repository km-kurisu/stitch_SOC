"use client";
import React, { useEffect, useState } from "react";

type Process = {
    pid: number;
    name: string;
    cpu_percent: number;
    memory_percent: number;
    username: string;
    status: string;
};

export default function MonitoringPage() {
    const [stats, setStats] = useState({
        cpu: { usage_percent: 0 },
        memory: { percent: 0 },
        network: { bytes_sent: 0, bytes_recv: 0 },
    });

    const [processes, setProcesses] = useState<Process[]>([]);

    useEffect(() => {
        // Real-time system stats
        const ws = new WebSocket("ws://localhost:8000/ws");
        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                if (msg.type === "system_stats") {
                    setStats(msg.data);
                }
            } catch (err) { }
        };

        // Polling processes every 2 seconds
        const fetchProcs = async () => {
            try {
                const res = await fetch("http://localhost:8000/api/processes");
                const data = await res.json();
                setProcesses(data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchProcs();
        const inv = setInterval(fetchProcs, 2000);

        return () => {
            ws.close();
            clearInterval(inv);
        };
    }, []);

    return (
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold">System Performance</h2>
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-accent-success/10 text-accent-success text-[10px] font-bold">
                        <span className="size-1.5 rounded-full bg-accent-success animate-pulse"></span>
                        LIVE
                    </span>
                </div>
            </div>

            {/* Real-time Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* CPU Usage */}
                <div className="bg-panel-dark/30 border border-border-dark rounded-xl p-6 flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">CPU Usage</p>
                            <h3 className="text-3xl font-bold text-primary">{stats.cpu.usage_percent.toFixed(1)}%</h3>
                        </div>
                    </div>
                    <div className="flex-1 h-32 w-full grid-lines relative rounded-lg overflow-hidden border border-border-dark/50">
                        {/* Visual simulation of chart based on real data percentage */}
                        <div className="absolute bottom-0 left-0 right-0 bg-primary/20 transition-all duration-1000" style={{ height: `${stats.cpu.usage_percent}%` }}></div>
                    </div>
                </div>

                {/* Memory Usage */}
                <div className="bg-panel-dark/30 border border-border-dark rounded-xl p-6 flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Memory Usage</p>
                            <h3 className="text-3xl font-bold text-primary">{stats.memory.percent.toFixed(1)}%</h3>
                        </div>
                    </div>
                    <div className="flex-1 h-32 w-full grid-lines relative rounded-lg overflow-hidden border border-border-dark/50">
                        <div className="absolute bottom-0 left-0 right-0 bg-accent-success/20 transition-all duration-1000" style={{ height: `${stats.memory.percent}%` }}></div>
                    </div>
                </div>

                {/* Network Bandwidth */}
                <div className="bg-panel-dark/30 border border-border-dark rounded-xl p-6 flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Network Speed</p>
                            <h3 className="text-3xl font-bold text-primary">
                                {((stats.network.bytes_recv) / 1024 / 1024).toFixed(1)} MB/s
                            </h3>
                        </div>
                    </div>
                    <div className="flex-1 h-32 w-full grid-lines relative rounded-lg overflow-hidden border border-border-dark/50">
                        {/* Simple visual bar using live data mod */}
                        <div className="absolute bottom-0 left-0 right-0 bg-primary/20 transition-all duration-1000" style={{ height: `${Math.min(100, (stats.network.bytes_recv % 100))}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Process Activity Table Section */}
            <div className="bg-panel-dark/30 border border-border-dark rounded-xl overflow-hidden">
                <div className="p-6 border-b border-border-dark flex items-center justify-between">
                    <h4 className="font-bold text-lg">Process Activity</h4>
                    <div className="flex gap-2">
                        <button className="px-3 py-1.5 text-[10px] font-bold rounded-lg border border-border-dark hover:bg-primary/5 transition-colors">KILL TASK</button>
                        <button className="px-3 py-1.5 text-[10px] font-bold rounded-lg bg-primary text-background-dark">REFRESH TABLE</button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-background-dark/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <th className="px-6 py-4">PID</th>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4 text-right">CPU %</th>
                                <th className="px-6 py-4 text-right">Memory %</th>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-dark text-sm font-medium">
                            {processes.map((proc) => (
                                <tr key={proc.pid} className="hover:bg-primary/5 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs">{proc.pid}</td>
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <span className="material-symbols-outlined text-primary text-lg">terminal</span>
                                        {proc.name}
                                    </td>
                                    <td className="px-6 py-4 text-right text-primary">
                                        {proc.cpu_percent ? proc.cpu_percent.toFixed(1) : "0.0"}%
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {proc.memory_percent ? proc.memory_percent.toFixed(1) : "0.0"}%
                                    </td>
                                    <td className="px-6 py-4 text-slate-400">{proc.username || 'unknown'}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-0.5 rounded text-[10px] bg-accent-success/10 text-accent-success uppercase">
                                            {proc.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
