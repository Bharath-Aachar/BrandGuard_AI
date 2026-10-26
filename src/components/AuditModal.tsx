'use client';

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle,
  Copy,
  CheckCheck,
  Printer,
  Award,
  Hash,
  Clock,
  FileText,
} from 'lucide-react';
import { BrandPolicy, ScanResult } from '../types/brandguard';

interface AuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  scanResult: ScanResult;
  currentPolicy: BrandPolicy;
}

export const AuditModal: React.FC<AuditModalProps> = ({
  isOpen,
  onClose,
  scanResult,
  currentPolicy,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const certificateId = 'BG-CERT-884920';
  const certDate = 'October 26, 2026';
  const certHash = '0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069';

  const generateReportText = () => {
    return `=====================================================
BRANDGUARD AI ENTERPRISE COMPLIANCE CERTIFICATE
=====================================================
Certificate ID: ${certificateId}
Date of Audit: ${certDate}
Verification Hash: ${certHash}
Enforced Rulebook: ${currentPolicy.name} (${currentPolicy.industry})
Overall Safety Score: ${scanResult.overallScore}/100
Verdict: ${scanResult.status.toUpperCase()}

CATEGORY VERIFICATION BREAKDOWN:
- Regulatory & Legal Compliance: ${scanResult.categories.legal.score}% (${scanResult.categories.legal.status.toUpperCase()})
- Claim Substantiation: ${scanResult.categories.claims.score}% (${scanResult.categories.claims.status.toUpperCase()})
- Trademark & IP Defense: ${scanResult.categories.trademark.score}% (${scanResult.categories.trademark.status.toUpperCase()})
- Brand Voice & Tone Alignment: ${scanResult.categories.tone.score}% (${scanResult.categories.tone.status.toUpperCase()})
- Safety & Toxicity Index: ${scanResult.categories.brandSafety.score}% (${scanResult.categories.brandSafety.status.toUpperCase()})

VIOLATION SUMMARY:
Total Detected Issues: ${scanResult.violations.length}
${scanResult.violations.map((v, i) => `  ${i + 1}. [${v.severity.toUpperCase()}] ${v.title} - Rule: ${v.ruleViolated}`).join('\n')}

CERTIFICATION SIGN-OFF:
Verified by BrandGuard AI Autonomous Sentinel Engine v4.2.
Complies with SOC-2, FTC Truth in Advertising, and Enterprise Governance Standards.
=====================================================`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateReportText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-panel rounded-3xl p-6 sm:p-8 border border-indigo-500/30 shadow-2xl space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Header */}
        <div className="text-center space-y-2 border-b border-white/10 pb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-600 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/25 mx-auto">
            <div className="w-full h-full bg-[#0b0f19] rounded-[15px] flex items-center justify-center">
              <Award className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
            Official Brand Safety Audit Certificate
          </h2>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            Cryptographically timestamped compliance certificate issued by BrandGuard AI Autonomous Sentinel Engine.
          </p>
        </div>

        {/* Certificate Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-950/80 p-4 rounded-2xl border border-white/5">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Certificate No.</span>
            <span className="font-mono font-bold text-indigo-400">{certificateId}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Date Issued</span>
            <span className="font-medium text-white">{certDate}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Policy Profile</span>
            <span className="font-medium text-cyan-300">{currentPolicy.name}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Overall Score</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">{scanResult.overallScore}%</span>
          </div>
        </div>

        {/* Categories Checklist */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Multi-Vector Governance Verification
          </h3>

          <div className="space-y-2">
            {Object.entries(scanResult.categories).map(([key, cat]) => (
              <div
                key={key}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-slate-200 font-semibold">{cat.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 text-[11px]">Weight {cat.weight}%</span>
                  <span className="font-mono font-bold text-white">{cat.score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verification Cryptographic Hash */}
        <div className="p-3 rounded-xl bg-slate-950/90 border border-white/5 text-[11px] font-mono text-slate-400 space-y-1">
          <div className="flex items-center gap-1.5 text-indigo-300 font-bold">
            <Hash className="w-3.5 h-3.5" />
            Verification Hash
          </div>
          <div className="break-all text-slate-300">{certHash}</div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <button
            onClick={handleCopy}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-all flex items-center gap-1.5"
          >
            {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Audit Copied' : 'Copy Audit Text'}
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Save Certificate
          </button>
        </div>

      </div>
    </div>
  );
};
