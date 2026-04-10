import React from "react";

export default function TopBar() {
    return (
        <header className="h-16 border-b border-border-dark flex items-center justify-between px-8 bg-background-light dark:bg-background-dark/50 backdrop-blur-md">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-accent-success">
                    <span className="material-symbols-outlined">check_circle</span>
                    <h2 className="font-bold text-lg">System Health: Optimal</h2>
                </div>
                <div className="h-4 w-px bg-border-dark"></div>
                <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                    <span>UPTIME: 24d 14h 03m</span>
                    <span>NODES: 154 Active</span>
                </div>
            </div>
            <div className="flex items-center gap-6">
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                        search
                    </span>
                    <input
                        className="bg-border-dark/50 border-none rounded-lg pl-9 pr-4 py-1.5 text-sm w-64 focus:ring-1 focus:ring-primary outline-none text-slate-100"
                        placeholder="Search incidents..."
                        type="text"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <button className="p-2 rounded-lg bg-border-dark/30 text-slate-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-xl">wifi</span>
                    </button>
                    <button className="p-2 rounded-lg bg-border-dark/30 text-slate-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-xl">
                            battery_charging_90
                        </span>
                    </button>
                    <button className="p-2 rounded-lg bg-border-dark/30 text-slate-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-xl">memory</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
