import React from "react";

export default function NetworkChart() {
    // Simplified dynamic bars for the network chart illustration
    const simulatedBars = [
        { height: "40%", type: "normal" },
        { height: "45%", type: "normal" },
        { height: "30%", type: "normal" },
        { height: "50%", type: "normal" },
        { height: "75%", type: "normal" },
        { height: "95%", type: "spike" },
        { height: "60%", type: "normal" },
        { height: "40%", type: "normal" },
        { height: "35%", type: "normal" },
        { height: "55%", type: "normal" },
        { height: "45%", type: "normal" },
        { height: "50%", type: "normal" },
        { height: "70%", type: "normal" },
        { height: "85%", type: "normal" },
        { height: "65%", type: "normal" },
        { height: "40%", type: "normal" },
        { height: "30%", type: "normal" },
        { height: "25%", type: "normal" },
        { height: "45%", type: "normal" },
        { height: "55%", type: "normal" },
    ];

    return (
        <div className="xl:col-span-4 bg-panel-dark rounded-xl border border-border-dark p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold">Network Activity</h3>
                    <p className="text-xs text-slate-500">
                        Throughput visualization across all edge nodes
                    </p>
                </div>
                <div className="flex gap-2">
                    <span className="px-3 py-1 rounded-full bg-border-dark text-[10px] font-bold text-primary">
                        1H
                    </span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold text-slate-500 cursor-pointer hover:text-slate-300">
                        6H
                    </span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold text-slate-500 cursor-pointer hover:text-slate-300">
                        24H
                    </span>
                </div>
            </div>
            <div className="relative h-64 w-full flex items-end gap-1">
                {/* Visual placeholders for chart grids */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
                    <div className="border-t border-slate-500 w-full"></div>
                    <div className="border-t border-slate-500 w-full"></div>
                    <div className="border-t border-slate-500 w-full"></div>
                    <div className="border-t border-slate-500 w-full"></div>
                </div>

                {/* Simplified bar visualization */}
                {simulatedBars.map((bar, idx) => (
                    <div
                        key={idx}
                        className={`flex-1 transition-colors rounded-t-sm ${bar.type === "spike"
                                ? "bg-accent-danger/40 hover:bg-accent-danger"
                                : "bg-primary/20 hover:bg-primary"
                            }`}
                        style={{ height: bar.height }}
                        title={bar.type === "spike" ? "SPIKE DETECTED" : "Normal Activity"}
                    ></div>
                ))}
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-slate-500 font-mono">
                <span>-60m</span>
                <span>-45m</span>
                <span>-30m</span>
                <span>-15m</span>
                <span>Now</span>
            </div>
        </div>
    );
}
