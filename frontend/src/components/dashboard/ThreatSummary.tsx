import React from "react";

export default function ThreatSummary() {
    return (
        <div className="xl:col-span-3 bg-panel-dark rounded-xl border border-border-dark overflow-hidden flex flex-col @container">
            <div className="flex flex-col @xl:flex-row h-full">
                <div
                    className="w-full @xl:w-1/3 bg-cover bg-center h-48 @xl:h-auto relative"
                    style={{
                        backgroundImage:
                            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA58w2H0pNyGgQN2FhcwHmHIheeHJ626UNz6b3v0osS_Lzj-TTIqPxVXwtfST-Si_ECxL-TJu2IXp1V9ypWKHiPXe0Ad6fJsaVqExo9ykOQ3XFjH23SzqbFt320NBNKqqAH_3hNvC5iO7LjttdynNaGPn3hQh7DoGg2qX_wl45koacbydRvO0wonIsubz3GwbMtI0S_AJ_hjYvSayJHqtf0e-wikK_y2NWKe6iL3bjIZz-4VNF4mPr3cTJpQtNWdO8Do_uh-LFnn5k')",
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-panel-dark via-transparent to-transparent hidden @xl:block"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-panel-dark via-transparent to-transparent @xl:hidden"></div>
                    <div className="absolute bottom-4 left-4">
                        <span className="px-2 py-1 bg-accent-danger text-white text-[10px] font-bold rounded uppercase">
                            Live Feed
                        </span>
                    </div>
                </div>
                <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                        <p className="text-primary text-sm font-semibold mb-1 uppercase tracking-wider">
                            Live Monitoring
                        </p>
                        <h2 className="text-2xl font-bold mb-3">Threat Detection Summary</h2>
                        <p className="text-slate-400 text-sm mb-6 leading-relaxed max-w-2xl">
                            High-level overview of active security threats and vulnerabilities
                            detected in the last 24 hours. The heuristic engine is currently
                            analyzing traffic patterns across 3 key vectors.
                        </p>
                        <div className="grid grid-cols-3 gap-4 border-t border-border-dark pt-6">
                            <div className="text-center">
                                <p className="text-2xl font-bold">12</p>
                                <p className="text-[10px] text-slate-500 uppercase">
                                    Total Threats
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-accent-danger">2</p>
                                <p className="text-[10px] text-slate-500 uppercase">Critical</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-accent-success">10</p>
                                <p className="text-[10px] text-slate-500 uppercase">Resolved</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button className="px-6 py-2 bg-primary/20 text-primary border border-primary/30 rounded-lg text-sm font-bold hover:bg-primary/30 transition-all flex items-center gap-2">
                            View Live Details
                            <span className="material-symbols-outlined text-sm">
                                arrow_forward
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
