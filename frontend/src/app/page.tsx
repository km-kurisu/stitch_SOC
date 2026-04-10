"use client";
import React, { useEffect, useState } from "react";
import ThreatSummary from "@/components/dashboard/ThreatSummary";
import NetworkChart from "@/components/dashboard/NetworkChart";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    cpu: { usage_percent: 0 },
    memory: { percent: 0 },
    disk: { read_bytes: 0, write_bytes: 0 },
    network: { bytes_sent: 0, bytes_recv: 0 },
  });

  useEffect(() => {
    // We connect to our python backend websocket
    const ws = new WebSocket("ws://localhost:8000/ws");
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "system_stats") {
          setStats(msg.data);
        }
      } catch (err) {
        console.error("Error parsing WS data", err);
      }
    };
    return () => ws.close();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Real-time Stats */}
        <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* CPU Card */}
          <div className="bg-panel-dark p-5 rounded-xl border border-border-dark flex flex-col justify-between hover:border-primary/50 transition-colors group">
            <div className="flex justify-between items-start">
              <p className="text-slate-400 text-sm font-medium">CPU Usage</p>
              <span className="material-symbols-outlined text-primary">analytics</span>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <h3 className="text-3xl font-bold">{stats.cpu.usage_percent.toFixed(1)}%</h3>
            </div>
            <div className="mt-4 h-1 w-full bg-border-dark rounded-full overflow-hidden">
              <div
                className="h-full bg-primary"
                style={{ width: `${stats.cpu.usage_percent}%` }}
              ></div>
            </div>
          </div>

          {/* RAM Card */}
          <div className="bg-panel-dark p-5 rounded-xl border border-border-dark flex flex-col justify-between hover:border-primary/50 transition-colors">
            <div className="flex justify-between items-start">
              <p className="text-slate-400 text-sm font-medium">RAM Usage</p>
              <span className="material-symbols-outlined text-primary">memory</span>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <h3 className="text-3xl font-bold">{stats.memory.percent.toFixed(1)}%</h3>
            </div>
            <div className="mt-4 h-1 w-full bg-border-dark rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-success"
                style={{ width: `${stats.memory.percent}%` }}
              ></div>
            </div>
          </div>

          {/* Disk Card */}
          <div className="bg-panel-dark p-5 rounded-xl border border-border-dark flex flex-col justify-between hover:border-primary/50 transition-colors">
            <div className="flex justify-between items-start">
              <p className="text-slate-400 text-sm font-medium">Disk I/O</p>
              <span className="material-symbols-outlined text-primary">storage</span>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <h3 className="text-xl font-bold truncate">
                {(stats.disk.read_bytes / 1024 / 1024).toFixed(1)} MB/s
              </h3>
            </div>
            <div className="mt-4 h-1 w-full bg-border-dark rounded-full overflow-hidden">
              <div className="h-full bg-primary/60 w-[40%]"></div>
            </div>
          </div>

          {/* Network Card */}
          <div className="bg-panel-dark p-5 rounded-xl border border-border-dark flex flex-col justify-between hover:border-primary/50 transition-colors">
            <div className="flex justify-between items-start">
              <p className="text-slate-400 text-sm font-medium">Network Traffic</p>
              <span className="material-symbols-outlined text-primary">public</span>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <h3 className="text-xl font-bold truncate">
                {(stats.network.bytes_recv / 1024 / 1024).toFixed(1)} MB/s
              </h3>
            </div>
            <div className="mt-4 h-1 w-full bg-border-dark rounded-full overflow-hidden">
              <div className="h-full bg-primary w-[75%]"></div>
            </div>
          </div>
        </div>

        {/* Recent Alerts Panel (Right) */}
        <div className="xl:row-span-2 bg-panel-dark rounded-xl border border-border-dark flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border-dark flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-accent-danger text-lg">
                warning
              </span>
              Recent Alerts
            </h3>
            <span className="text-xs text-primary cursor-pointer hover:underline">
              Clear all
            </span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-3 bg-border-dark/30 rounded-lg border-l-4 border-accent-danger hover:bg-border-dark/50 transition-all"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-bold text-accent-danger uppercase">
                    Critical
                  </span>
                  <span className="text-[10px] text-slate-500">2m ago</span>
                </div>
                <p className="text-xs font-bold truncate">Alert example {i}</p>
                <p className="text-[10px] text-slate-400 truncate">Details...</p>
              </div>
            ))}
          </div>
          <div className="p-3 bg-background-dark/50 border-t border-border-dark text-center">
            <button className="text-xs font-bold text-primary hover:brightness-110">
              View Analysis Report
            </button>
          </div>
        </div>

        <ThreatSummary />
        <NetworkChart />
      </div>
    </div>
  );
}
