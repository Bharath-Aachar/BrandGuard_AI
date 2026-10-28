'use client';

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  RotateCcw,
  CheckCheck,
  Copy,
  AlertOctagon,
  AlertTriangle,
  Scale,
  ShieldCheck,
  CheckCircle,
  Lock,
  Wand2,
  FileCheck,
  Clock,
  Layers,
  Undo2,
  XCircle,
  Eye,
  Send,
  HelpCircle,
  Cpu,
} from 'lucide-react';
import { BrandPolicy, PresetSample, ScanResult, Violation } from '../types/brandguard';
import { applyViolationFix } from '@/lib/brandSafetyEngine';
import { ScoreGauge } from './ScoreGauge';

interface ScannerTabProps {
  currentPolicy: BrandPolicy;
  presets: PresetSample[];
  scanResult: ScanResult;
  onScan: (text: string) => void;
  inputText: string;
  setInputText: (text: string) => void;
  onOpenAudit: () => void;
  onSubmitForReview?: (text: string, title?: string) => void;
}

export const ScannerTab: React.FC<ScannerTabProps> = ({
  currentPolicy,
  presets,
  scanResult,
  onScan,
  inputText,
  setInputText,
  onOpenAudit,
  onSubmitForReview,
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [activeView, setActiveView] = useState<'violations' | 'annotated' | 'remediation' | 'compare'>('violations');
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedFixed, setCopiedFixed] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [rejectedFindingIds, setRejectedFindingIds] = useState<Set<string>>(new Set());
  const [originalBaselineText, setOriginalBaselineText] = useState<string>(inputText);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const handleSelectPreset = (preset: PresetSample) => {
    setOriginalBaselineText(preset.text);
    setUndoStack([]);
    setRejectedFindingIds(new Set());
    setInputText(preset.text);
    triggerAnalysis(preset.text);
  };

  const triggerAnalysis = (textToScan: string) => {
    setIsAnalyzing(true);
    setTimeout(() => {
      onScan(textToScan);
      setIsAnalyzing(false);
    }, 350);
  };

  // Accept a suggested correction
  const handleAcceptFix = (violation: Violation) => {
    setUndoStack((prev) => [...prev, inputText]);
    const updated = applyViolationFix(inputText, violation);
    setInputText(updated);
    triggerAnalysis(updated);
  };

  // Reject a suggested correction
  const handleRejectFix = (violationId: string) => {
    setRejectedFindingIds((prev) => {
      const next = new Set(prev);
      next.add(violationId);
      return next;
    });
  };

  // Undo the last applied correction
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previousText = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, prev.length - 1));
    setInputText(previousText);
    triggerAnalysis(previousText);
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

  const handleSubmit = () => {
    if (!inputText.trim()) return;
    if (onSubmitForReview) {
      onSubmitForReview(inputText);
      setSubmissionSuccess(true);
      setTimeout(() => setSubmissionSuccess(false), 3000);
    }
  };

  // Filter out rejected findings and apply severity filtering
  const activeViolations = useMemo(() => {
    return scanResult.violations.filter((v) => !rejectedFindingIds.has(v.id));
  }, [scanResult.violations, rejectedFindingIds]);

  const filteredViolations = useMemo(() => {
    return activeViolations.filter((v) => {
      if (selectedSeverity === 'all') return true;
      return v.severity === selectedSeverity;
    });
  }, [activeViolations, selectedSeverity]);

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

  // Slices inputText into non-overlapping highlighted segments for the Annotated View
  const annotatedSegments = useMemo(() => {
    if (!inputText) return [];
    // Get violations with real positive ranges within current text
    const validSpans = activeViolations
      .filter((v) => v.startIndex >= 0 && v.endIndex > v.startIndex && v.endIndex <= inputText.length)
      .sort((a, b) => a.startIndex - b.startIndex);

    const segments: Array<{ text: string; violation?: Violation }> = [];
    let cursor = 0;

    for (const v of validSpans) {
      if (v.startIndex > cursor) {
        segments.push({ text: inputText.slice(cursor, v.startIndex) });
      }
      // Only highlight if within bounds
      if (v.startIndex >= cursor) {
        segments.push({
          text: inputText.slice(v.startIndex, v.endIndex),
          violation: v,
        });
        cursor = v.endIndex;
      }
    }

    if (cursor < inputText.length) {
      segments.push({ text: inputText.slice(cursor) });
    }

    return segments;
  }, [inputText, activeViolations]);

  const isTextEmpty = !inputText.trim();

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Scenarios */}
      <div className="glass-panel rounded-2xl p-5 border border-white/10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Active Policy: {currentPolicy.name}
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
              <span className="text-xs text-slate-400">{currentPolicy.industry}</span>
              <span className="ml-2 inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300">
                <Cpu className="w-3 h-3 text-cyan-400" />
                {scanResult.analysisMethod === 'contextual_ai' ? 'AI Augmented' : 'Deterministic Sentinel'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
              AI Content Safety & Compliance Scanner
            </h1>
            <p className="text-sm text-slate-300 mt-0.5">
              Verify marketing copy against regulatory guidelines, restricted claims, trademark rules, and voice calibration.
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

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Text Input & Controls */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="glass-panel rounded-2xl p-5 flex flex-col flex-1 border border-white/10 relative overflow-hidden">
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
                onChange={(e) => {
                  setInputText(e.target.value);
                }}
                placeholder="Type or paste ad text, product launch announcements, or marketing slogans here to scan for brand risk, trademark safety, and regulatory violations..."
                className="w-full h-full min-h-[220px] p-3.5 bg-slate-950/60 rounded-xl border border-white/10 text-slate-100 text-sm leading-relaxed placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-y"
              />

              {isAnalyzing && (
                <div
                  className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-3 z-10"
                  aria-busy="true"
                >
                  <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-medium text-indigo-300 animate-pulse">
                    Evaluating Rules & Statutory Standards...
                  </span>
                </div>
              )}
            </div>

            {/* Bottom Controls */}
            <div className="mt-4 flex items-center justify-between flex-wrap gap-2 pt-3 border-t border-white/5">
              <div className="flex items-center gap-2">
                <button
                  id="undo-correction-btn"
                  onClick={handleUndo}
                  disabled={undoStack.length === 0}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
                  title="Undo last applied suggestion"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  Undo ({undoStack.length})
                </button>
                <button
                  id="clear-input-btn"
                  onClick={() => {
                    setUndoStack((prev) => [...prev, inputText]);
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

              <div className="flex items-center gap-2">
                {onSubmitForReview && (
                  <button
                    id="submit-review-btn"
                    onClick={handleSubmit}
                    disabled={isTextEmpty || isAnalyzing}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600/30 hover:bg-emerald-600 text-emerald-200 hover:text-white border border-emerald-500/40 transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {submissionSuccess ? 'Submitted for Review!' : 'Submit for Review'}
                  </button>
                )}
                <button
                  id="trigger-scan-btn"
                  onClick={() => triggerAnalysis(inputText)}
                  disabled={isAnalyzing || isTextEmpty}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                  Analyze with BrandGuard
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Score & Health Verdict */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel rounded-2xl p-5 border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Safety & Compliance Rating
              </span>
              <span className="text-xs text-slate-400">
                {isTextEmpty ? 'No Content' : `Scanned ${scanResult.scannedAt}`}
              </span>
            </div>

            {/* Circular Gauge */}
            <div className="py-2">
              <ScoreGauge
                score={isTextEmpty ? 0 : scanResult.overallScore}
                status={isTextEmpty ? 'not_scanned' : scanResult.status}
                size={170}
              />
            </div>

            {/* Verdict Summary Box */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 mt-1">
              <div className="flex items-start gap-2.5">
                {isTextEmpty ? (
                  <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                ) : scanResult.status === 'approved' ? (
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
                        isTextEmpty
                          ? 'text-slate-500'
                          : cat.score >= 85
                          ? 'text-emerald-400'
                          : cat.score >= 65
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {isTextEmpty ? '0%' : `${cat.score}%`}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isTextEmpty
                          ? 'bg-slate-700'
                          : cat.score >= 85
                          ? 'bg-gradient-to-r from-teal-500 to-emerald-400'
                          : cat.score >= 65
                          ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                          : 'bg-gradient-to-r from-red-600 to-rose-400'
                      }`}
                      style={{ width: `${isTextEmpty ? 0 : cat.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Audit Trigger */}
            <button
              onClick={onOpenAudit}
              disabled={isTextEmpty}
              className="mt-4 w-full py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-xs font-semibold text-slate-200 border border-white/5 flex items-center justify-center gap-2 transition-all hover:border-slate-500/40 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
              Generate Audit Certificate
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Explainable Results Tabs */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10">
        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
          <div className="flex items-center gap-2 flex-wrap">
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
              Findings & Explainable Fixes ({activeViolations.length})
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
              Clean Remediated Copy
            </button>

            <button
              id="view-compare-btn"
              onClick={() => setActiveView('compare')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeView === 'compare'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white bg-white/5'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-indigo-300" />
              Compare Baseline vs Revised
            </button>
          </div>

          {/* Filter Pills */}
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

        {/* View 1: Detailed Explainable Violations List */}
        {activeView === 'violations' && (
          <div className="mt-4 space-y-3.5">
            {isTextEmpty ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <HelpCircle className="w-10 h-10 text-slate-500 mb-2" />
                <h3 className="text-sm font-bold text-white">No Content Evaluated</h3>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  Enter copy in the box above or choose a test scenario to inspect compliance findings.
                </p>
              </div>
            ) : filteredViolations.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                  <CheckCheck className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-base font-bold text-white">Zero Active Violations</h3>
                <p className="text-xs text-slate-400 max-w-md mt-1">
                  The analyzed text satisfies all active brand safety parameters, regulatory guidelines, and tone thresholds.
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
                        {v.sourcePolicy && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                            {v.sourcePolicy}
                          </span>
                        )}
                        {v.confidence && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {Math.round(v.confidence * 100)}% conf
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <button
                          onClick={() => handleRejectFix(v.id)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 bg-white/5 hover:bg-white/10 transition-all flex items-center gap-1"
                          title="Dismiss this finding"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Dismiss
                        </button>
                        {v.suggestedFix && (
                          <button
                            onClick={() => handleAcceptFix(v)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/40 transition-all flex items-center gap-1.5"
                          >
                            <Wand2 className="w-3.5 h-3.5 text-cyan-300" />
                            Accept Correction
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{v.explanation}</p>

                    {/* Problem Phrase vs Suggested Replacement */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-slate-950/70 border border-rose-500/20">
                        <span className="text-[10px] uppercase font-bold text-rose-400 block mb-1">
                          Flagged Text Excerpt
                        </span>
                        <span className="font-mono text-rose-200 line-through break-all">
                          &ldquo;{v.phrase}&rdquo;
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-950/70 border border-emerald-500/20">
                        <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">
                          Suggested Compliant Replacement
                        </span>
                        <span className="font-mono text-emerald-200 font-medium break-all">
                          &ldquo;{v.suggestedFix}&rdquo;
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
              Interactive Risk Map & Span Highlights
            </h4>
            <div className="p-4 bg-slate-900/60 rounded-xl border border-white/5 whitespace-pre-wrap text-slate-200 font-mono text-xs leading-relaxed">
              {annotatedSegments.length > 0 ? (
                annotatedSegments.map((segment, idx) => {
                  if (!segment.violation) {
                    return <span key={idx}>{segment.text}</span>;
                  }
                  const sev = segment.violation.severity;
                  const hlClass =
                    sev === 'critical'
                      ? 'bg-rose-500/30 text-rose-200 border-b-2 border-rose-500'
                      : sev === 'warning'
                      ? 'bg-amber-500/30 text-amber-200 border-b-2 border-amber-500'
                      : 'bg-cyan-500/30 text-cyan-200 border-b-2 border-cyan-500';

                  return (
                    <mark
                      key={idx}
                      className={`px-1 py-0.5 rounded ${hlClass} cursor-pointer`}
                      title={`${segment.violation.title}: ${segment.violation.explanation}`}
                    >
                      {segment.text}
                    </mark>
                  );
                })
              ) : (
                <span className="text-slate-500 italic">No content available to annotate.</span>
              )}
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs text-slate-400 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-rose-500/30 border border-rose-500 inline-block"></span>
                Critical Violation
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-500/30 border border-amber-500 inline-block"></span>
                Advisory Warning
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-cyan-500/30 border border-cyan-500 inline-block"></span>
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
                    BrandGuard Clean Remediated Output
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                    Audit-Ready
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (scanResult.aiRewrittenText) {
                        setUndoStack((prev) => [...prev, inputText]);
                        setInputText(scanResult.aiRewrittenText);
                        triggerAnalysis(scanResult.aiRewrittenText);
                      }
                    }}
                    disabled={!scanResult.aiRewrittenText}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 border border-indigo-500/30 flex items-center gap-1.5 transition-all disabled:opacity-40"
                  >
                    Use as Current Draft
                  </button>
                  <button
                    id="copy-remediated-btn"
                    onClick={() => copyToClipboard(scanResult.aiRewrittenText || inputText, true)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 transition-all"
                  >
                    {copiedFixed ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedFixed ? 'Copied' : 'Copy Clean Copy'}
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                All prohibited terms, exaggerated promises, trademark disparagements, and compliance omissions have been replaced with compliant alternatives.
              </p>
              <div className="p-4 rounded-xl bg-slate-950/90 border border-white/10 font-sans text-sm text-slate-100 whitespace-pre-wrap leading-relaxed shadow-inner">
                {scanResult.aiRewrittenText || 'No remediation required.'}
              </div>
            </div>
          </div>
        )}

        {/* View 4: Side-by-side Baseline vs Revised Comparison */}
        {activeView === 'compare' && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block pb-2 border-b border-white/5">
                Original Draft Baseline
              </span>
              <p className="font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                {originalBaselineText || <span className="text-slate-600 italic">No baseline recorded</span>}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/20 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Current Revised Copy
                </span>
                <span className="text-[10px] text-slate-400">
                  {undoStack.length} edits applied
                </span>
              </div>
              <p className="font-mono text-xs text-emerald-200 whitespace-pre-wrap leading-relaxed">
                {inputText || <span className="text-slate-600 italic">No current text</span>}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
