'use client';

import React from 'react';
import { Shield, Sparkles, Activity, FileText, Download, CheckCircle2 } from 'lucide-react';
import { BrandPolicy } from '../types/brandguard';

interface NavbarProps {
  activeTab: 'scanner' | 'threats' | 'guidelines' | 'analytics';
  setActiveTab: (tab: 'scanner' | 'threats' | 'guidelines' | 'analytics') => void;
  currentPolicy: BrandPolicy;
  onPolicyChange: (policyId: string) => void;
  availablePolicies: Record<string, BrandPolicy>;
  onOpenAudit: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentPolicy,
  onPolicyChange,
  availablePolicies,
  onOpenAudit,
}) => {
  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-white/10 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3.5">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/25">
              <div className="w-full h-full bg-[#0b0f19] rounded-[11px] flex items-center justify-center">
                <Shield className="w-6 h-6 text-cyan-400" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  BrandGuard<span className="text-indigo-400 font-extrabold">.AI</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Enterprise
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Real-Time Brand Safety & Compliance Intelligence</p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-xl border border-white/5">
            <button
              id="nav-scanner-tab"
              onClick={() => setActiveTab('scanner')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'scanner'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Content Scanner
            </button>

            <button
              id="nav-threats-tab"
              onClick={() => setActiveTab('threats')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'threats'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Activity className="w-4 h-4" />
              Threat Radar
              <span className="px-1.5 py-0.2 text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full font-bold">
                2 Alert
              </span>
            </button>

            <button
              id="nav-guidelines-tab"
              onClick={() => setActiveTab('guidelines')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'guidelines'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileText className="w-4 h-4" />
              Guidelines Studio
            </button>

            <button
              id="nav-analytics-tab"
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'analytics'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Health Analytics
            </button>
          </nav>

          {/* Right Controls: Policy selector & Export button */}
          <div className="flex items-center gap-3">
            {/* Active Policy Selector */}
            <div className="hidden lg:flex items-center gap-2 bg-slate-900/80 border border-white/10 rounded-xl px-3 py-1.5">
              <span className="text-xs text-slate-400 font-medium">Policy:</span>
              <select
                id="policy-selector"
                value={currentPolicy.id}
                onChange={(e) => onPolicyChange(e.target.value)}
                className="bg-transparent text-xs text-indigo-300 font-semibold focus:outline-none cursor-pointer pr-1"
              >
                {Object.values(availablePolicies).map((p) => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Audit Report Button */}
            <button
              id="export-audit-btn"
              onClick={onOpenAudit}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-all hover:border-slate-400/40"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              Audit Certificate
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Tab bar */}
      <div className="md:hidden flex items-center justify-around py-2.5 px-3 border-t border-white/5 bg-slate-950/80">
        <button
          onClick={() => setActiveTab('scanner')}
          className={`text-xs font-medium py-1 px-2.5 rounded-lg ${
            activeTab === 'scanner' ? 'bg-indigo-600 text-white' : 'text-slate-400'
          }`}
        >
          Scanner
        </button>
        <button
          onClick={() => setActiveTab('threats')}
          className={`text-xs font-medium py-1 px-2.5 rounded-lg ${
            activeTab === 'threats' ? 'bg-indigo-600 text-white' : 'text-slate-400'
          }`}
        >
          Radar
        </button>
        <button
          onClick={() => setActiveTab('guidelines')}
          className={`text-xs font-medium py-1 px-2.5 rounded-lg ${
            activeTab === 'guidelines' ? 'bg-indigo-600 text-white' : 'text-slate-400'
          }`}
        >
          Guidelines
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`text-xs font-medium py-1 px-2.5 rounded-lg ${
            activeTab === 'analytics' ? 'bg-indigo-600 text-white' : 'text-slate-400'
          }`}
        >
          Analytics
        </button>
      </div>
    </header>
  );
};
