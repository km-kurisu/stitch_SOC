"use client";
import React, { useState } from "react";

export default function PasswordAnalyzerPage() {
    const [password, setPassword] = useState("");
    const [analysis, setAnalysis] = useState<any>(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleAnalyze = async (val: string) => {
        setPassword(val);
        if (!val) {
            setAnalysis(null);
            return;
        }
        try {
            const res = await fetch("http://localhost:8000/api/analyze-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: val }),
            });
            const data = await res.json();
            setAnalysis(data);
        } catch (err) {
            console.error(err);
        }
    };

    const generatePassword = () => {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
        const array = new Uint32Array(16);
        window.crypto.getRandomValues(array);
        let retVal = "";
        for (let i = 0; i < 16; i++) {
            retVal += charset.charAt(array[i] % charset.length);
        }
        handleAnalyze(retVal);
    };

    const getStrengthLabel = (score: number) => {
        if (score === 4) return "Strong";
        if (score === 3) return "Good";
        if (score === 2) return "Fair";
        return "Weak";
    };

    return (
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <header className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Password Analyzer
                </h2>
                <p className="text-slate-500 dark:text-primary/60 mt-1">
                    Real-time cryptographic strength & entropy analysis
                </p>
            </header>
            <div className="grid grid-cols-12 gap-8">
                {/* Analysis Column */}
                <div className="col-span-12 lg:col-span-7 space-y-8">
                    {/* Input Section */}
                    <div className="bg-panel-dark/30 p-8 rounded-xl border border-border-dark shadow-sm">
                        <label className="block mb-6">
                            <span className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                                Target Phrase
                            </span>
                            <div className="mt-3 relative">
                                <input
                                    className="w-full bg-background-dark border border-border-dark rounded-lg py-4 px-5 text-xl font-mono text-primary focus:ring-2 focus:ring-primary outline-none transition-all pr-12"
                                    placeholder="Enter password to analyze..."
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => handleAnalyze(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors focus:outline-none"
                                >
                                    <span className="material-symbols-outlined">
                                        {showPassword ? "visibility_off" : "visibility"}
                                    </span>
                                </button>
                            </div>
                        </label>
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <span className="text-accent-success font-bold text-lg flex items-center gap-2">
                                    Strength: {analysis ? getStrengthLabel(analysis.score) : "N/A"}
                                    {analysis && analysis.score >= 3 && (
                                        <span className="material-symbols-outlined text-accent-success text-sm">
                                            verified
                                        </span>
                                    )}
                                </span>
                                <span className="text-slate-400 text-sm font-mono">
                                    {analysis ? (analysis.score * 25) : 0}% Secure
                                </span>
                            </div>
                            <div className="h-3 w-full bg-border-dark rounded-full overflow-hidden shadow-[0_0_15px_rgba(0,212,255,0.1)]">
                                <div
                                    className="h-full bg-gradient-to-r from-primary to-accent-success relative transition-all"
                                    style={{ width: `${analysis ? (analysis.score * 25) : 0}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 italic">
                                {analysis?.feedback?.warning || "Enter a password to begin analysis."}
                            </p>
                        </div>
                    </div>
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-panel-dark/30 p-6 rounded-xl border border-border-dark shadow-sm hover:border-primary/50 transition-colors">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="material-symbols-outlined text-primary">
                                    query_stats
                                </span>
                                <span className="text-sm font-medium text-slate-400 uppercase tracking-tighter">
                                    Crack Time Display
                                </span>
                            </div>
                            <div className="text-2xl font-bold text-white mb-1 truncate">
                                {analysis?.crack_times_display?.offline_slow_hashing_1e4_per_second || "N/A"}
                            </div>
                            <div className="text-xs text-accent-success flex items-center gap-1 font-medium">
                                Offline Hashing
                            </div>
                        </div>
                        <div className="bg-panel-dark/30 p-6 rounded-xl border border-border-dark shadow-sm hover:border-primary/50 transition-colors">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="material-symbols-outlined text-primary">
                                    timer
                                </span>
                                <span className="text-sm font-medium text-slate-400 uppercase tracking-tighter">
                                    Online Throttled
                                </span>
                            </div>
                            <div className="text-2xl font-bold text-white mb-1 truncate">
                                {analysis?.crack_times_display?.online_throttling_100_per_hour || "N/A"}
                            </div>
                            <div className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                                100 attempts / hour
                            </div>
                        </div>
                    </div>
                    {/* Pattern Analysis */}
                    <div className="bg-panel-dark/30 p-6 rounded-xl border border-border-dark shadow-sm">
                        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">
                                analytics
                            </span>
                            Detailed Feedback
                        </h3>
                        <div className="space-y-3">
                            {analysis?.feedback?.suggestions?.length > 0 ? (
                                analysis.feedback.suggestions.map((sug: string, i: number) => (
                                    <div
                                        key={i}
                                        className="flex justify-between p-3 rounded bg-background-dark border border-border-dark/50"
                                    >
                                        <span className="text-sm text-slate-400">{sug}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="p-3 rounded bg-background-dark border border-border-dark/50">
                                    <span className="text-sm text-slate-400">No suggestions. Password looks good!</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recommendations / Sidebar Details */}
                <div className="col-span-12 lg:col-span-5 space-y-6">
                    <div className="bg-panel-dark/30 p-8 rounded-xl border border-border-dark shadow-sm h-full">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">
                                lightbulb
                            </span>
                            Security Recommendations
                        </h3>
                        <ul className="space-y-6">
                            <li className="flex gap-4">
                                <div className="mt-1 flex-shrink-0 bg-accent-success/20 p-1 rounded-full text-accent-success h-6 w-6 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-sm">check</span>
                                </div>
                                <div>
                                    <p className="font-medium text-slate-100 text-sm">
                                        Length Optimization
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                        Longer passwords increase entropy significantly.
                                    </p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="mt-1 flex-shrink-0 bg-accent-success/20 p-1 rounded-full text-accent-success h-6 w-6 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-sm">check</span>
                                </div>
                                <div>
                                    <p className="font-medium text-slate-100 text-sm">
                                        Special Characters
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                        Use non-alphanumeric characters to boost entropy.
                                    </p>
                                </div>
                            </li>
                            <li className="flex gap-4 opacity-50">
                                <div className="mt-1 flex-shrink-0 bg-slate-400/20 p-1 rounded-full text-slate-400 h-6 w-6 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-sm">circle</span>
                                </div>
                                <div>
                                    <p className="font-medium text-slate-100 text-sm">
                                        2FA Integration
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                        No password is 100% safe. Always combine strong credentials with multi-factor authentication.
                                    </p>
                                </div>
                            </li>
                        </ul>
                        <div className="mt-10 pt-6 border-t border-border-dark">
                            <button 
                                onClick={generatePassword}
                                className="w-full bg-primary hover:bg-primary/90 text-background-dark font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary/20"
                            >
                                <span className="material-symbols-outlined text-lg">sync</span>
                                Generate Secure Password
                            </button>
                            <p className="text-center text-[10px] text-slate-400 mt-4 uppercase tracking-[0.2em]">
                                Secured by CyberGuard Cryptography Engine
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
