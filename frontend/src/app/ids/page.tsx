"use client";
import React, { useEffect, useState } from "react";

type Alert = {
    id: string;
    timestamp: string;
    level: "Critical" | "High" | "Medium" | "Low";
    title: string;
    description: string;
    source: string;
};

export default function IDSPage() {
    const [alerts, setAlerts] = useState<Alert[]>([]);

    useEffect(() => {
        const ws = new WebSocket("ws://localhost:8000/ws");
        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                if (msg.type === "ids_alert") {
                    setAlerts((prev) => [msg.data, ...prev].slice(0, 50));
                }
            } catch (err) { }
        };
        return () => ws.close();
    }, []);

    const severityCounts = {
        Critical: alerts.filter((a) => a.level === "Critical").length,
        High: alerts.filter((a) => a.level === "High").length,
        Medium: alerts.filter((a) => a.level === "Medium").length,
        Low: alerts.filter((a) => a.level === "Low").length,
    };

    const total = alerts.length || 1; // avoid division by zero

    const levelStyles = {
        Critical: { bg: "bg-rose-500", text: "text-rose-500", border: "border-rose-500", bgm: "bg-rose-500/10", borderM: "border-rose-500/20" },
        High: { bg: "bg-orange-400", text: "text-orange-400", border: "border-orange-400", bgm: "bg-orange-400/10", borderM: "border-orange-400/20" },
        Medium: { bg: "bg-primary", text: "text-primary", border: "border-primary", bgm: "bg-primary/10", borderM: "border-primary/20" },
        Low: { bg: "bg-slate-400", text: "text-slate-400", border: "border-slate-500", bgm: "bg-slate-500/10", borderM: "border-slate-500/20" },
    };

    return (
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="max-w-[1400px] mx-auto space-y-8">
                {/* Analytics Header Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Detection Timeline */}
                    <div className="lg:col-span-2 bg-panel-dark/30 border border-border-dark p-6 rounded-xl">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                                    Detection Timeline
                                </p>
                                <h3 className="text-2xl font-bold dark:text-white">
                                    {alerts.length} Events{" "}
                                    <span className="text-emerald-400 text-sm font-normal ml-2">Live</span>
                                </h3>
                            </div>
                            <select className="bg-primary/5 border-none text-xs rounded-lg text-primary focus:ring-0">
                                <option>Active Session</option>
                            </select>
                        </div>
                        <div className="h-40 w-full relative">
                            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 40">
                                <defs>
                                    <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.2"></stop>
                                        <stop offset="100%" stopColor="#00d4ff" stopOpacity="0"></stop>
                                    </linearGradient>
                                </defs>
                                <path d="M0,35 Q10,32 20,38 T40,25 T60,30 T80,10 T100,20 L100,40 L0,40 Z" fill="url(#chartGradient)"></path>
                                <path d="M0,35 Q10,32 20,38 T40,25 T60,30 T80,10 T100,20" fill="none" stroke="#00d4ff" strokeWidth="0.5"></path>
                            </svg>
                            <div className="flex justify-between mt-2 text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                                <span>-60m</span><span>-45m</span><span>-30m</span><span>-15m</span><span>Now</span>
                            </div>
                        </div>
                    </div>
                    {/* Severity Distribution */}
                    <div className="bg-panel-dark/30 border border-border-dark p-6 rounded-xl">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-6">
                            Severity Distribution
                        </p>
                        <div className="space-y-4">
                            {["Critical", "High", "Medium", "Low"].map((level) => {
                                const count = severityCounts[level as keyof typeof severityCounts];
                                const pct = alerts.length === 0 ? 0 : (count / total) * 100;
                                const style = levelStyles[level as keyof typeof levelStyles];
                                return (
                                    <div key={level}>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className={`${style.text} font-bold`}>{level}</span>
                                            <span className="dark:text-white font-bold">{count}</span>
                                        </div>
                                        <div className="h-2 bg-background-dark/50 rounded-full overflow-hidden">
                                            <div className={`h-full ${style.bg} transition-all duration-500`} style={{ width: `${pct}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Event Stream Table */}
                <div className="bg-panel-dark/30 border border-border-dark rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-border-dark flex justify-between items-center bg-background-dark/20">
                        <h2 className="text-sm font-bold dark:text-white">Live Event Stream</h2>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase animate-pulse">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                            Live Monitoring Active
                        </div>
                    </div>
                    <div className="divide-y divide-border-dark">
                        {alerts.length === 0 ? (
                            <div className="p-6 text-center text-slate-500 text-sm">
                                No intrusion events detected yet...
                            </div>
                        ) : (
                            alerts.map((alert, i) => {
                                const style = levelStyles[alert.level];
                                return (
                                    <div key={i} className="px-6 py-4 flex items-center gap-6 hover:bg-primary/5 transition-colors group">
                                        <div className="text-[11px] font-mono text-slate-400 w-16">
                                            {alert.timestamp}
                                        </div>
                                        <div className="w-24">
                                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${style.bgm} ${style.text} border ${style.borderM}`}>
                                                {alert.level}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold dark:text-white truncate">{alert.title}</h4>
                                            <p className="text-xs text-slate-500 truncate">{alert.description}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-[11px] font-mono text-slate-400">Source: {alert.source}</p>
                                                <p className="text-[11px] font-bold text-primary">ID: {alert.id}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
