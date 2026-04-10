"use client";
import React, { useEffect, useState } from "react";

type Alert = {
    id: string;
    timestamp: string;
    level: "Critical" | "High" | "Medium" | "Low";
    title: string;
    description: string;
    source: string;
    resolved: boolean;
};

const levelStyles = {
    Critical: { text: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20", icon: "gpp_maybe" },
    High: { text: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/20", icon: "warning" },
    Medium: { text: "text-primary", bg: "bg-primary/10", border: "border-primary/20", icon: "info" },
    Low: { text: "text-slate-400", bg: "bg-slate-400/10", border: "border-slate-400/20", icon: "notifications" },
};

export default function AlertsPage() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [filter, setFilter] = useState<string>("All");

    useEffect(() => {
        const ws = new WebSocket("ws://localhost:8000/ws");
        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                if (msg.type === "ids_alert") {
                    setAlerts((prev) => [{ ...msg.data, resolved: false }, ...prev].slice(0, 100));
                }
            } catch (err) { }
        };
        return () => ws.close();
    }, []);

    const filtered = filter === "All" ? alerts : alerts.filter((a) => a.level === filter);
    const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    alerts.forEach((a) => counts[a.level] = (counts[a.level] || 0) + 1);

    const resolve = (id: string) => {
        setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, resolved: true } : a));
    };

    return (
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Threat Alerts</h2>
                    <p className="text-slate-400 mt-1">Live security incident monitoring and response</p>
                </div>
                <span className="flex items-center gap-2 text-[10px] font-bold text-rose-400 uppercase animate-pulse">
                    <span className="size-1.5 rounded-full bg-rose-400"></span>
                    {alerts.filter((a) => !a.resolved).length} Active
                </span>
            </div>

            {/* Severity counts */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(["Critical", "High", "Medium", "Low"] as const).map((level) => {
                    const s = levelStyles[level];
                    return (
                        <button
                            key={level}
                            onClick={() => setFilter(filter === level ? "All" : level)}
                            className={`p-4 rounded-xl border transition-all text-left ${filter === level ? `${s.bg} ${s.border}` : "bg-panel-dark/30 border-border-dark"}`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className={`text-xs font-bold uppercase ${s.text}`}>{level}</span>
                                <span className="material-symbols-outlined text-sm text-slate-400">{s.icon}</span>
                            </div>
                            <p className={`text-3xl font-bold ${s.text}`}>{counts[level]}</p>
                        </button>
                    );
                })}
            </div>

            {/* Alerts list */}
            <div className="bg-panel-dark/30 border border-border-dark rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-border-dark flex items-center justify-between">
                    <h3 className="font-bold">Alert Stream</h3>
                    <div className="flex gap-2">
                        {["All", "Critical", "High", "Medium", "Low"].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-colors ${filter === f ? "bg-primary text-background-dark" : "bg-background-dark/50 text-slate-400 hover:text-primary"}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="divide-y divide-border-dark">
                    {filtered.length === 0 ? (
                        <div className="px-6 py-12 text-center text-slate-500">
                            <span className="material-symbols-outlined text-4xl block mb-2 text-slate-600">check_circle</span>
                            No alerts for this filter. System is secure.
                        </div>
                    ) : (
                        filtered.map((alert, i) => {
                            const s = levelStyles[alert.level];
                            return (
                                <div key={i} className={`px-6 py-5 flex items-start gap-5 transition-colors hover:bg-primary/5 ${alert.resolved ? "opacity-40" : ""}`}>
                                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center ${s.text}`}>
                                        <span className="material-symbols-outlined">{s.icon}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[10px] font-bold uppercase ${s.text}`}>{alert.level}</span>
                                            <span className="text-slate-500 text-[10px] font-mono">{alert.timestamp}</span>
                                            {alert.resolved && <span className="text-[10px] font-bold text-accent-success uppercase">Resolved</span>}
                                        </div>
                                        <h4 className="text-sm font-bold">{alert.title}</h4>
                                        <p className="text-xs text-slate-500 mt-0.5">{alert.description}</p>
                                        <p className="text-[10px] font-mono text-primary mt-1">Source: {alert.source} · ID: {alert.id}</p>
                                    </div>
                                    {!alert.resolved && (
                                        <button
                                            onClick={() => resolve(alert.id)}
                                            className="flex-shrink-0 px-3 py-1.5 text-[10px] font-bold uppercase border border-border-dark rounded hover:bg-accent-success/10 hover:text-accent-success hover:border-accent-success/30 transition-colors"
                                        >
                                            Resolve
                                        </button>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
