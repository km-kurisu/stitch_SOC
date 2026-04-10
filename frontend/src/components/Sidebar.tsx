import Link from "next/link";
import React from "react";

export default function Sidebar() {
    const navItems = [
        { name: "Dashboard", icon: "dashboard", href: "/", active: true },
        { name: "Monitoring", icon: "monitoring", href: "/monitoring", active: false },
        { name: "IDS", icon: "gpp_maybe", href: "/ids", active: false },
        { name: "Network", icon: "hub", href: "/network", active: false },
        { name: "File", icon: "folder_open", href: "/file", active: false },
        { name: "Password", icon: "key", href: "/password", active: false },
        { name: "Alerts", icon: "notifications_active", href: "/alerts", active: false, badge: 12 },
        { name: "Logs", icon: "history", href: "/logs", active: false },
        { name: "Settings", icon: "settings", href: "/settings", active: false },
    ];

    return (
        <aside className="w-64 flex-shrink-0 bg-background-light dark:bg-background-dark border-r border-border-dark flex flex-col h-full">
            <div className="p-6 flex items-center gap-3">
                <div className="size-10 rounded-full bg-primary flex items-center justify-center text-background-dark">
                    <span className="material-symbols-outlined font-bold">shield</span>
                </div>
                <div className="flex flex-col">
                    <h1 className="text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-slate-100">
                        CyberOps SOC
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-primary/70 uppercase tracking-widest font-semibold">
                        Security Command
                    </p>
                </div>
            </div>
            <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
                {navItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${item.active
                                ? "bg-primary/10 text-primary"
                                : "text-slate-600 dark:text-slate-400 hover:bg-border-dark/30 hover:text-primary"
                            }`}
                    >
                        <span className="material-symbols-outlined">{item.icon}</span>
                        <p className="text-sm font-medium">{item.name}</p>
                        {item.badge && (
                            <span className="ml-auto text-[10px] bg-accent-danger text-white px-1.5 rounded-full">
                                {item.badge}
                            </span>
                        )}
                    </Link>
                ))}
            </nav>
            <div className="p-4 border-t border-border-dark">
                <button className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 bg-primary text-background-dark font-bold text-sm hover:brightness-110 transition-all">
                    <span className="material-symbols-outlined text-sm">rocket_launch</span>
                    <span>New Scan</span>
                </button>
                <div className="mt-4 flex items-center gap-3">
                    <div
                        className="size-10 rounded-full bg-cover bg-center border border-border-dark"
                        style={{
                            backgroundImage:
                                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCXBt4ThzX-A3MeeDypJIoRu3NVvC3_I_wTMcOmLt3g9XPTPJgZi3IJ_YnewDxiYHEzagD1IJrsqznyGOJQb2roNUx94hqus-PNqi2VBXYzdaTnO38RtbMIG2salAErhQ4HMHco-MFnUNLqw0QYc_GbmCNG3oTgMJKr8W1HNofBSbrmt17Dx8P7bRxOGLjHU1RY624S3CPSfJW9zOxGzBDjtRdbGv1yFb1uKd10aCDNyopzkyYI2BTYCUdzvJAQEhMcnAf8XKD6jww')",
                        }}
                    ></div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium truncate">Admin Control</p>
                        <p className="text-[10px] text-slate-500 uppercase">Super User</p>
                    </div>
                    <span className="material-symbols-outlined text-slate-500 cursor-pointer">
                        logout
                    </span>
                </div>
            </div>
        </aside>
    );
}
