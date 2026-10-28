'use client';

import DashboardLayout from "@/components/DashboardLayout";
import { Settings, Shield, Sliders, Key } from "lucide-react";

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-400" />
          Platform Settings & Engine Configuration
        </h1>
        <p className="text-sm text-slate-400">
          Configure multi-vector sensitivity, API integrations, compliance frameworks, and notification hooks.
        </p>
      </div>

      <div className="space-y-6">
        {/* Compliance Frameworks */}
        <div className="glass-card p-6 rounded-xl border border-white/10">
          <h2 className="text-base font-semibold text-white mb-1 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            Active Regulatory & Compliance Standards
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            Rules and heuristics active during content scans and reputation radar evaluation.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { name: 'SEC Rule 156', desc: 'Investment & yield claim substantiation', status: 'Enforced' },
              { name: 'FTC Guides 16 CFR § 255', desc: 'Endorsements & mandatory #ad disclosures', status: 'Enforced' },
              { name: 'FDA Section 201(p)', desc: 'Health, cure, and wellness prevention claims', status: 'Enforced' },
              { name: 'Lanham Act § 43(a)', desc: 'Trademark disparagement & competitor slander', status: 'Enforced' },
              { name: 'Truth in Advertising Guidelines', desc: 'Substantiation of absolute guarantees', status: 'Enforced' },
              { name: 'Security Audit Trail', desc: 'Locally computed SHA-256 payload audit records', status: 'Active' },
            ].map((rule) => (
              <div key={rule.name} className="p-3 rounded-lg bg-slate-900/60 border border-white/5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                    <span>{rule.name}</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      {rule.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{rule.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Engine Sensitivity */}
        <div className="glass-card p-6 rounded-xl border border-white/10">
          <h2 className="text-base font-semibold text-white mb-1 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            Sentinel Engine Parameters
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            Engine sensitivity weights for multi-vector threat categorization.
          </p>

          <div className="space-y-4 max-w-xl">
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Legal & Regulatory Penalty Weight</span>
                <span className="font-mono text-indigo-400 font-bold">35% (Critical: -35 pts)</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Claim Substantiation Weight</span>
                <span className="font-mono text-indigo-400 font-bold">25% (Warning: -15 pts)</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '70%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Trademark & IP Protection Weight</span>
                <span className="font-mono text-indigo-400 font-bold">20% (Info/Warning)</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-cyan-500 h-full rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Brand Tone & Voice Alignment Weight</span>
                <span className="font-mono text-indigo-400 font-bold">20% (Warning)</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Credentials - Honestly labeled */}
        <div className="glass-card p-6 rounded-xl border border-white/10">
          <h2 className="text-base font-semibold text-white mb-1 flex items-center gap-2">
            <Key className="w-4 h-4 text-cyan-400" />
            Telemetry & Social Webhook Connectors
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            Stream channels configured for Threat Radar demonstration.
          </p>

          <div className="space-y-3">
            {[
              { name: 'X / Twitter Stream API v2', status: 'Sandbox Simulated (No external token configured)', ping: 'Local Heuristic' },
              { name: 'Domain Registrar WHOIS Feed', status: 'Sandbox Simulated (Local mock probe)', ping: 'Local Heuristic' },
              { name: 'Ad Network Heuristic Ingestion', status: 'Sandbox Simulated (Local mock probe)', ping: 'Local Heuristic' },
            ].map((feed) => (
              <div key={feed.name} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/40 border border-white/5 text-xs">
                <div>
                  <div className="font-semibold text-slate-200">{feed.name}</div>
                  <div className="text-[11px] text-amber-400 flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    {feed.status}
                  </div>
                </div>
                <span className="font-mono text-slate-500 text-[11px]">{feed.ping}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
