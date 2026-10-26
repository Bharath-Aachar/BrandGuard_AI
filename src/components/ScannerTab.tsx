'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Play,
  RotateCcw,
  CheckCheck,
  Copy,
  AlertOctagon,
  AlertTriangle,
  Info,
  Scale,
  ShieldCheck,
  CheckCircle,
  Lock,
  ArrowRight,
  Wand2,
  FileCheck,
  Clock,
  Layers,
} from 'lucide-react';
import { BrandPolicy, PresetSample, ScanResult, Violation } from '../types/brandguard';
import { ScoreGauge } from './ScoreGauge';

interface ScannerTabProps {
  currentPolicy: BrandPolicy;
  presets: PresetSample[];
  scanResult: ScanResult;
  onScan: (text: string) => void;
  inputText: string;
  setInputText: (text: string) => void;
  onOpenAudit: () => void;
}

export const ScannerTab: React.FC<ScannerTabProps> = ({
  currentPolicy,
  presets,
  scanResult,
  onScan,
  inputText,
  setInputText,
  onOpenAudit,
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [activeView, setActiveView] = useState<'violations' | 'annotated' | 'remediation'>('violations');
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedFixed, setCopiedFixed] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSelectPreset = (preset: PresetSample) => {
    setInputText(preset.text);
    triggerAnalysis(preset.text);
  };

  const triggerAnalysis = (textToScan: string) => {
    setIsAnalyzing(true);
    setTimeout(() => {
      onScan(textToScan);
      setIsAnalyzing(false);
    }, 450);
  };

  const applySuggestedFix = (violation: Violation) => {
    if (!violation.phrase) return;
    const newText = inputText.replace(violation.phrase, violation.suggestedFix);
    setInputText(newText);
    triggerAnalysis(newText);
  };

  const copyToClipboard = (text: string, isFixed = false) => {
    navigator.clipboard.writeText(text);
    if (isFixed) {
      setCopiedFixed(true);
      setTimeout(() => setCopiedFixed(false), 2000);
    } else {
      setCopiedOriginal(true);
      setTimeout(() => setCopiedOriginal(false), 2000);
    }
  };

  const filteredViolations = scanResult.violations.filter((v) => {
    if (selectedSeverity === 'all') return true;
    return v.severity === selectedSeverity;
  });

  const getCategoryIcon = (category: Violation['category']) => {
    switch (category) {
      case 'legal':
        return <Scale className="w-4 h-4 text-rose-400" />;
      case 'claim':
        return <CheckCircle className="w-4 h-4 text-amber-400" />;
      case 'trademark':
        return <ShieldCheck className="w-4 h-4 text-cyan-400" />;
      case 'tone':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      default:
        return <Lock className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Preset Quick Selection */}
      <div className="glass-panel rounded-2xl p-5 border border-white/10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Active Rulebook: {currentPolicy.name}
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
              <span className="text-xs text-slate-400">{currentPolicy.industry}</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
              AI Content Safety & Compliance Scanner
            </h1>
            <p className="text-sm text-slate-300 mt-0.5">
              Paste marketing copy, press releases, social ads, or select a pre-configured scenario below to run deep multi-vector risk evaluation.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-slate-400">Test Scenarios:</span>
            {presets.map((preset) => (
              <button
                key={preset.id}
                id={`preset-btn-${preset.id}`}
                onClick={() => handleSelectPreset(preset)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-200 border border-white/10 hover:border-indigo-500/40 transition-all flex items-center gap-1.5"
                title={preset.description}
              >
                <span>{preset.title}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 text-slate-400">
                  {preset.tag}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Workspace: Input Box on Left, Real-Time Score & Verdict on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Text Input & Controls (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="glass-panel rounded-2xl p-5 flex flex-col flex-1 border border-white/10 relative overflow-hidden">
            
            {/* Header of Input Box */}
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-semibold text-slate-200">Campaign / Content Draft</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  ~{scanResult.readingTimeSeconds}s read
                </span>
                <span>{scanResult.wordCount} words</span>
                <span>{inputText.length} chars</span>
              </div>
            </div>

            {/* Input Area */}
            <div className="relative mt-3 flex-1 min-h-[220px]">
              <textarea
                id="campaign-input-textarea"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type or paste ad text, product launch announcements, or marketing slogans here to scan for brand risk, trademark safety, and regulatory violations..."
                className="w-full h-full min-h-[220px] p-3.5 bg-slate-950/60 rounded-xl border border-white/10 text-slate-100 text-sm leading-relaxed placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-y"
              />

              {isAnalyzing && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-3 z-10">
                  <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-medium text-indigo-300 animate-pulse">
                    Sentinel Engine Analyzing Rules & Compliance...
                  </span>
                </div>
              )}
            </div>

            {/* Bottom Controls */}
            <div className="mt-4 flex items-center justify-between flex-wrap gap-2 pt-3 border-t border-white/5">
              <div className="flex items-center gap-2">
                <button
                  id="clear-input-btn"
                  onClick={() => {
                    setInputText('');
                    onScan('');
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Clear
                </button>
                <button
                  id="copy-original-btn"
                  onClick={() => copyToClipboard(inputText, false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all flex items-center gap-1.5"
                >
                  {copiedOriginal ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedOriginal ? 'Copied' : 'Copy'}
                </button>
              </div>

              <button
                id="trigger-scan-btn"
                onClick={() => triggerAnalysis(inputText)}
                disabled={isAnalyzing || !inputText.trim()}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
              >
                <Sparkles className="w-4 h-4 text-cyan-200" />
                Analyze with BrandGuard
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Score & Health Verdict (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel rounded-2xl p-5 border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Safety & Compliance Rating
              </span>
              <span className="text-xs text-slate-400">Scanned {scanResult.scannedAt}</span>
            </div>

            {/* Circular Gauge */}
            <div className="py-2">
              <ScoreGauge score={scanResult.overallScore} status={scanResult.status} size={170} />
            </div>

            {/* Verdict Summary Box */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 mt-1">
              <div className="flex items-start gap-2.5">
                {scanResult.status === 'approved' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : scanResult.status === 'review_required' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {scanResult.summary}
                </p>
              </div>
            </div>

            {/* Category Breakdown Progress Bars */}
            <div className="mt-4 space-y-2.5">
              {Object.entries(scanResult.categories).map(([key, cat]) => (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{cat.name}</span>
                    <span
                      className={`font-bold ${
                        cat.score >= 85
                          ? 'text-emerald-400'
                          : cat.score >= 65
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {cat.score}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        cat.score >= 85
                          ? 'bg-gradient-to-r from-teal-500 to-emerald-400'
                          : cat.score >= 65
                          ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                          : 'bg-gradient-to-r from-red-600 to-rose-400'
                      }`}
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Audit Trigger */}
            <button
              onClick={onOpenAudit}
              className="mt-4 w-full py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-xs font-semibold text-slate-200 border border-white/5 flex items-center justify-center gap-2 transition-all hover:border-slate-500/40"
            >
              <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
              Generate Formal Audit Report
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Section: Multi-tab Results (Violations, Annotated View, AI Remediation) */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10">
        
        {/* Navigation Tabs for Results */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
          <div className="flex items-center gap-2">
            <button
              id="view-violations-btn"
              onClick={() => setActiveView('violations')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeView === 'violations'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white bg-white/5'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Violations & Direct Fixes ({scanResult.violations.length})
            </button>

            <button
              id="view-annotated-btn"
              onClick={() => setActiveView('annotated')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeView === 'annotated'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white bg-white/5'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Annotated Content View
            </button>

            <button
              id="view-remediation-btn"
              onClick={() => setActiveView('remediation')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeView === 'remediation'
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-600/20'
                  : 'text-slate-400 hover:text-white bg-white/5'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5 text-cyan-300" />
              AI Remediated Copy
            </button>
          </div>

          {/* Filter Pills for Violations */}
          {activeView === 'violations' && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 text-[11px] mr-1">Filter:</span>
              {(['all', 'critical', 'warning', 'info'] as const).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSelectedSeverity(sev)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider capitalize transition-all ${
                    selectedSeverity === sev
                      ? 'bg-white/20 text-white border border-white/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View 1: Detailed Violations List */}
        {activeView === 'violations' && (
          <div className="mt-4 space-y-3.5">
            {filteredViolations.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                  <CheckCheck className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-base font-bold text-white">Zero Violations Found</h3>
                <p className="text-xs text-slate-400 max-w-md mt-1">
                  The analyzed text complies with all active brand safety parameters, regulatory guidelines, and tone thresholds.
                </p>
              </div>
            ) : (
              filteredViolations.map((v) => {
                const isCrit = v.severity === 'critical';
                const isWarn = v.severity === 'warning';
                const borderColor = isCrit
                  ? 'border-rose-500/30 bg-rose-950/15'
                  : isWarn
                  ? 'border-amber-500/30 bg-amber-950/15'
                  : 'border-cyan-500/30 bg-cyan-950/15';

                const badgeClass = isCrit
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : isWarn
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';

                return (
                  <div
                    key={v.id}
                    className={`p-4 rounded-xl border ${borderColor} transition-all hover:border-opacity-60 space-y-3`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getCategoryIcon(v.category)}
                        <span className="text-sm font-bold text-white">{v.title}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${badgeClass}`}>
                          {v.severity}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          [{v.ruleViolated}]
                        </span>
                      </div>

                      {v.suggestedFix && (
                        <button
                          onClick={() => applySuggestedFix(v)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/40 transition-all flex items-center gap-1.5 self-start sm:self-auto"
                        >
                          <Wand2 className="w-3.5 h-3.5 text-cyan-300" />
                          Apply 1-Click Fix
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{v.explanation}</p>

                    {/* Problem Phrase vs Suggested Replacement */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-slate-950/70 border border-rose-500/20">
                        <span className="text-[10px] uppercase font-bold text-rose-400 block mb-1">
                          Flagged Phrase
                        </span>
                        <span className="font-mono text-rose-200 line-through">
                          "{v.phrase}"
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-950/70 border border-emerald-500/20">
                        <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">
                          Compliant Alternative
                        </span>
                        <span className="font-mono text-emerald-200 font-medium">
                          "{v.suggestedFix}"
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* View 2: Annotated Content Highlighter */}
        {activeView === 'annotated' && (
          <div className="mt-4 p-5 rounded-xl bg-slate-950/80 border border-white/10 text-sm leading-relaxed font-sans">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Interactive Risk Map
            </h4>
            <div className="p-4 bg-slate-900/60 rounded-xl border border-white/5 whitespace-pre-wrap text-slate-200">
              {inputText ? (
                <span>
                  {/* Highlight phrases in text */}
                  {inputText.split('\n').map((paragraph, pIdx) => (
                    <p key={pIdx} className="mb-3 last:mb-0">
                      {paragraph}
                    </p>
                  ))}
                </span>
              ) : (
                <span className="text-slate-500 italic">No content available to annotate.</span>
              )}
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs text-slate-400 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-rose-500/30 border border-rose-500/60 inline-block"></span>
                Critical Violation
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-500/30 border border-amber-500/60 inline-block"></span>
                Advisory Warning
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-cyan-500/30 border border-cyan-500/60 inline-block"></span>
                Trademark Note
              </span>
            </div>
          </div>
        )}

        {/* View 3: AI Remediated Copy Drawer */}
        {activeView === 'remediation' && (
          <div className="mt-4 space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 via-cyan-950/30 to-slate-900 border border-indigo-500/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-bold text-white">
                    BrandGuard Auto-Remediated Output
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                    Safe for Broadcast
                  </span>
                </div>
                <button
                  id="copy-remediated-btn"
                  onClick={() => copyToClipboard(scanResult.aiRewrittenText || inputText, true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 transition-all"
                >
                  {copiedFixed ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedFixed ? 'Copied' : 'Copy Clean Copy'}
                </button>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                All prohibited terms, exaggerated ROI promises, trademark disparagements, and compliance omissions have been replaced with audit-ready, brand-safe alternatives.
              </p>
              <div className="p-4 rounded-xl bg-slate-950/90 border border-white/10 font-sans text-sm text-slate-100 whitespace-pre-wrap leading-relaxed shadow-inner">
                {scanResult.aiRewrittenText || 'No remediation required.'}
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
