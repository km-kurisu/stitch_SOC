"use client";
import React, { useState } from "react";

type SettingsCategory = "General" | "Monitoring" | "Alerts" | "Network" | "About";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<SettingsCategory>("General");
    const [settings, setSettings] = useState({
        backendUrl: "http://localhost:8000",
        refreshInterval: "1",
        cpuAlertThreshold: "90",
        memAlertThreshold: "85",
        diskAlertThreshold: "90",
        enableIds: true,
        enableFileMonitor: true,
        enablePasswordAnalyzer: true,
        darkMode: true,
        wsEnabled: true,
    });

    const update = (k: string, v: string | boolean) => setSettings((p) => ({ ...p, [k]: v }));

    const tabs: SettingsCategory[] = ["General", "Monitoring", "Alerts", "Network", "About"];

    return (
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                <p className="text-slate-400 mt-1">Configure the Stitch SOC application</p>
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Sidebar */}
                <div className="col-span-12 lg:col-span-3">
                    <div className="bg-panel-dark/30 border border-border-dark rounded-xl overflow-hidden">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-colors border-b border-border-dark last:border-0 ${activeTab === tab ? "bg-primary/10 text-primary" : "text-slate-400 hover:text-primary hover:bg-primary/5"}`}
                            >
                                <span className="material-symbols-outlined text-lg">
                                    {tab === "General" ? "settings" : tab === "Monitoring" ? "monitoring" : tab === "Alerts" ? "warning" : tab === "Network" ? "lan" : "info"}
                                </span>
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Panel */}
                <div className="col-span-12 lg:col-span-9">
                    <div className="bg-panel-dark/30 border border-border-dark rounded-xl p-8 space-y-6">
                        {activeTab === "General" && (
                            <>
                                <h3 className="text-lg font-bold border-b border-border-dark pb-4">General Settings</h3>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-300 mb-2">Backend API URL</label>
                                        <input
                                            className="w-full bg-background-dark border border-border-dark rounded-lg py-3 px-4 text-sm font-mono focus:ring-2 focus:ring-primary outline-none transition-all"
                                            value={settings.backendUrl}
                                            onChange={(e) => update("backendUrl", e.target.value)}
                                        />
                                        <p className="text-xs text-slate-500 mt-1">URL of the FastAPI backend server</p>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-background-dark/50 rounded-lg border border-border-dark">
                                        <div>
                                            <p className="text-sm font-bold">Dark Mode</p>
                                            <p className="text-xs text-slate-500">Always enabled for this application</p>
                                        </div>
                                        <span className="px-3 py-1 rounded bg-primary/10 text-primary text-xs font-bold">ON</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-background-dark/50 rounded-lg border border-border-dark">
                                        <div>
                                            <p className="text-sm font-bold">WebSocket Real-time Updates</p>
                                            <p className="text-xs text-slate-500">Enable live data streaming from backend</p>
                                        </div>
                                        <button
                                            onClick={() => update("wsEnabled", !settings.wsEnabled)}
                                            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${settings.wsEnabled ? "bg-primary" : "bg-border-dark"}`}
                                        >
                                            <span className={`inline-block size-4 rounded-full bg-white shadow transition-transform ${settings.wsEnabled ? "translate-x-6" : "translate-x-1"}`} />
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                        {activeTab === "Monitoring" && (
                            <>
                                <h3 className="text-lg font-bold border-b border-border-dark pb-4">Monitoring Settings</h3>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-300 mb-2">Stats Refresh Interval (seconds)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="60"
                                            className="w-full bg-background-dark border border-border-dark rounded-lg py-3 px-4 text-sm font-mono focus:ring-2 focus:ring-primary outline-none"
                                            value={settings.refreshInterval}
                                            onChange={(e) => update("refreshInterval", e.target.value)}
                                        />
                                    </div>
                                    {[
                                        { key: "enableIds", label: "Intrusion Detection System", desc: "Monitor network connections for anomalies" },
                                        { key: "enableFileMonitor", label: "File System Monitor", desc: "Track file system changes via watchdog" },
                                        { key: "enablePasswordAnalyzer", label: "Password Analyzer", desc: "Enable zxcvbn-based entropy analysis" },
                                    ].map(({ key, label, desc }) => (
                                        <div key={key} className="flex items-center justify-between p-4 bg-background-dark/50 rounded-lg border border-border-dark">
                                            <div>
                                                <p className="text-sm font-bold">{label}</p>
                                                <p className="text-xs text-slate-500">{desc}</p>
                                            </div>
                                            <button
                                                onClick={() => update(key, !(settings as any)[key])}
                                                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${(settings as any)[key] ? "bg-primary" : "bg-border-dark"}`}
                                            >
                                                <span className={`inline-block size-4 rounded-full bg-white shadow transition-transform ${(settings as any)[key] ? "translate-x-6" : "translate-x-1"}`} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                        {activeTab === "Alerts" && (
                            <>
                                <h3 className="text-lg font-bold border-b border-border-dark pb-4">Alert Thresholds</h3>
                                <div className="space-y-6">
                                    {[
                                        { key: "cpuAlertThreshold", label: "CPU Alert Threshold (%)" },
                                        { key: "memAlertThreshold", label: "Memory Alert Threshold (%)" },
                                        { key: "diskAlertThreshold", label: "Disk Alert Threshold (%)" },
                                    ].map(({ key, label }) => (
                                        <div key={key}>
                                            <label className="block text-sm font-bold text-slate-300 mb-2">{label}</label>
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="range"
                                                    min="50"
                                                    max="99"
                                                    className="flex-1 accent-primary"
                                                    value={(settings as any)[key]}
                                                    onChange={(e) => update(key, e.target.value)}
                                                />
                                                <span className="text-primary font-bold text-lg w-12 text-right">{(settings as any)[key]}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                        {activeTab === "Network" && (
                            <>
                                <h3 className="text-lg font-bold border-b border-border-dark pb-4">Network Settings</h3>
                                <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                                    <p className="text-sm font-bold text-amber-400">Deep Packet Inspection</p>
                                    <p className="text-xs text-slate-400 mt-1">Full DPI requires elevated/root privileges and Scapy or Pyshark. Run the backend with administrator rights to enable.</p>
                                </div>
                            </>
                        )}
                        {activeTab === "About" && (
                            <>
                                <h3 className="text-lg font-bold border-b border-border-dark pb-4">About Stitch SOC</h3>
                                <div className="space-y-4">
                                    {[
                                        ["Application", "Stitch SOC"],
                                        ["Version", "1.0.0"],
                                        ["Frontend", "Next.js 16 + Tailwind CSS"],
                                        ["Backend", "Python 3.10 + FastAPI + psutil"],
                                        ["Shell", "Electron"],
                                        ["Platform", "Windows & Linux"],
                                        ["License", "MIT"],
                                    ].map(([key, val]) => (
                                        <div key={key} className="flex justify-between py-3 border-b border-border-dark last:border-0">
                                            <span className="text-sm text-slate-400">{key}</span>
                                            <span className="text-sm font-bold font-mono">{val}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                        {activeTab !== "About" && (
                            <div className="pt-4">
                                <button className="px-6 py-2.5 bg-primary text-background-dark font-bold rounded-lg text-sm hover:bg-primary/90 transition-colors">
                                    Save Changes
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
