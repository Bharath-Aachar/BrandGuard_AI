'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import { useBrandGuard } from "@/context/BrandGuardContext";
import {
  FileCheck2,
  ShieldCheck,
  Award,
  Hash,
  ExternalLink,
} from "lucide-react";

export default function AuditReportsPage() {
  const { currentPolicy, scanResult, setIsAuditModalOpen } = useBrandGuard();
  const [digest, setDigest] = useState('Computing hash...');

  useEffect(() => {
    let isMounted = true;
    const payload = `${currentPolicy.name}:${scanResult.overallScore}:${scanResult.status}:${scanResult.violations.length}`;

    async function hashPayload() {
      try {
        if (typeof window !== 'undefined' && window.crypto?.subtle) {
          const buffer = new TextEncoder().encode(payload);
          const hashBuf = await window.crypto.subtle.digest('SHA-256', buffer);
          const hex = '0x' + Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
          if (isMounted) setDigest(hex);
        } else {
          if (isMounted) setDigest('0xLocalDigestReady');
        }
      } catch {
        if (isMounted) setDigest('0xHashUnavailable');
      }
    }
    hashPayload();
    return () => { isMounted = false; };
  }, [currentPolicy, scanResult]);

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Compliance Audit & Certificate Registry</h1>
          <p className="text-sm text-slate-400">
            Generate, sign, and export verifiable brand safety certificates for enterprise legal clearance.
          </p>
        </div>
        <button
          onClick={() => setIsAuditModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all"
        >
          <Award className="w-4 h-4" />
          Generate Audit Certificate
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <div className="glass-card p-5 rounded-xl border border-white/10">
          <div className="flex items-center gap-3 mb-2 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-wider">Active Policy</span>
          </div>
          <div className="text-xl font-bold text-white">{currentPolicy.name}</div>
          <p className="text-xs text-slate-400 mt-1">{currentPolicy.industry} Standards</p>
        </div>

        <div className="glass-card p-5 rounded-xl border border-white/10">
          <div className="flex items-center gap-3 mb-2 text-indigo-400">
            <Award className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-wider">Latest Safety Score</span>
          </div>
          <div className="text-xl font-bold text-white flex items-center gap-2">
            <span>{scanResult.overallScore}/100</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${
              scanResult.overallScore >= 85 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
            }`}>
              {scanResult.status}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Multi-Vector Category Clearance</p>
        </div>

        <div className="glass-card p-5 rounded-xl border border-white/10">
          <div className="flex items-center gap-3 mb-2 text-cyan-400">
            <Hash className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-wider">Verification Ledger</span>
          </div>
          <div className="text-xl font-bold text-white font-mono text-sm truncate" title={digest}>
            {digest.slice(0, 18)}...
          </div>
          <p className="text-xs text-slate-400 mt-1">SHA-256 Payload Hash (Local Integrity)</p>
        </div>
      </div>

      <div className="glass-card p-6 rounded-xl border border-white/10">
        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-indigo-400" />
              Compliance Certificate Preview
            </h2>
            <p className="text-xs text-slate-400">
              Evaluated against SEC Rule 156, FTC Truth in Advertising, and active brand voice rules.
            </p>
          </div>
          <button
            onClick={() => setIsAuditModalOpen(true)}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
          >
            Open Full Certificate <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-4 text-xs font-mono bg-slate-950/80 p-5 rounded-lg border border-white/5 text-slate-300">
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-slate-500">ISSUER:</span>
            <span className="text-slate-200">BrandGuard AI Sentinel Engine</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-slate-500">GOVERNANCE POLICY:</span>
            <span className="text-slate-200">{currentPolicy.name} ({currentPolicy.id})</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-slate-500">RISK FINDINGS:</span>
            <span className="text-slate-200">{scanResult.violations.length} total infractions flagged</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-slate-500">STATUS:</span>
            <span className="text-emerald-400 font-bold uppercase">{scanResult.status}</span>
          </div>
          <div className="flex justify-between pt-1">
            <span className="text-slate-500">PAYLOAD HASH:</span>
            <span className="text-cyan-400 truncate max-w-xs">{digest}</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
