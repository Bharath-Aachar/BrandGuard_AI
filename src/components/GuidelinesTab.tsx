'use client';

import React, { useState } from 'react';
import {
  FileText,
  Sliders,
  Plus,
  X,
  Save,
  Download,
  ShieldCheck,
  AlertCircle,
  Check,
  CheckCircle,
} from 'lucide-react';
import { BrandPolicy } from '../types/brandguard';

interface GuidelinesTabProps {
  currentPolicy: BrandPolicy;
  onUpdatePolicy: (updated: BrandPolicy) => void;
}

export const GuidelinesTab: React.FC<GuidelinesTabProps> = ({
  currentPolicy,
  onUpdatePolicy,
}) => {
  const [newTerm, setNewTerm] = useState('');
  const [newCompetitor, setNewCompetitor] = useState('');
  const [newDisclaimer, setNewDisclaimer] = useState('');
  const [newClaim, setNewClaim] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSliderChange = (
    field: 'formality' | 'boldness' | 'technicality',
    value: number
  ) => {
    onUpdatePolicy({
      ...currentPolicy,
      tone: {
        ...currentPolicy.tone,
        [field]: value,
      },
    });
  };

  const addProhibitedTerm = () => {
    if (!newTerm.trim()) return;
    if (currentPolicy.prohibitedTerms.includes(newTerm.trim())) return;
    onUpdatePolicy({
      ...currentPolicy,
      prohibitedTerms: [...currentPolicy.prohibitedTerms, newTerm.trim()],
    });
    setNewTerm('');
  };

  const removeProhibitedTerm = (term: string) => {
    onUpdatePolicy({
      ...currentPolicy,
      prohibitedTerms: currentPolicy.prohibitedTerms.filter((t) => t !== term),
    });
  };

  const addRestrictedClaim = () => {
    if (!newClaim.trim()) return;
    if ((currentPolicy.restrictedClaims || []).includes(newClaim.trim())) return;
    onUpdatePolicy({
      ...currentPolicy,
      restrictedClaims: [...(currentPolicy.restrictedClaims || []), newClaim.trim()],
    });
    setNewClaim('');
  };

  const removeRestrictedClaim = (claim: string) => {
    onUpdatePolicy({
      ...currentPolicy,
      restrictedClaims: (currentPolicy.restrictedClaims || []).filter((c) => c !== claim),
    });
  };

  const addCompetitor = () => {
    if (!newCompetitor.trim()) return;
    if (currentPolicy.competitorExclusions.includes(newCompetitor.trim())) return;
    onUpdatePolicy({
      ...currentPolicy,
      competitorExclusions: [...currentPolicy.competitorExclusions, newCompetitor.trim()],
    });
    setNewCompetitor('');
  };

  const removeCompetitor = (comp: string) => {
    onUpdatePolicy({
      ...currentPolicy,
      competitorExclusions: currentPolicy.competitorExclusions.filter((c) => c !== comp),
    });
  };

  const addDisclaimer = () => {
    if (!newDisclaimer.trim()) return;
    onUpdatePolicy({
      ...currentPolicy,
      mandatoryDisclaimers: [...currentPolicy.mandatoryDisclaimers, newDisclaimer.trim()],
    });
    setNewDisclaimer('');
  };

  const removeDisclaimer = (index: number) => {
    onUpdatePolicy({
      ...currentPolicy,
      mandatoryDisclaimers: currentPolicy.mandatoryDisclaimers.filter((_, i) => i !== index),
    });
  };

  const handleExportPolicyJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentPolicy, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${currentPolicy.id}_brand_policy.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleSave = () => {
    onUpdatePolicy(currentPolicy);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel rounded-2xl p-5 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Rulebook Governance
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
            <span className="text-xs text-slate-400">{currentPolicy.industry}</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Enterprise Brand Guidelines & Voice Studio
          </h1>
          <p className="text-sm text-slate-300 mt-0.5">
            Define tone thresholds, banned terminology, competitor exclusions, and mandatory regulatory disclaimers enforced across all marketing channels.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportPolicyJson}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            Export Policy (JSON)
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
          >
            {saveSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
            {saveSuccess ? 'Rulebook Persisted' : 'Save Rules'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Tone & Persona Sliders (5 Cols) */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-5 border border-white/10 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Voice Tone Calibration
              </h2>
            </div>
            <span className="text-xs text-slate-400">Real-time enforcement</span>
          </div>

          {/* Formality Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Formality Index</span>
              <span className="font-mono font-bold text-indigo-400">{currentPolicy.tone.formality}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={currentPolicy.tone.formality}
              onChange={(e) => handleSliderChange('formality', Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Casual & Conversational</span>
              <span>Executive & Corporate</span>
            </div>
          </div>

          {/* Boldness Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Audacity & Boldness</span>
              <span className="font-mono font-bold text-cyan-400">{currentPolicy.tone.boldness}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={currentPolicy.tone.boldness}
              onChange={(e) => handleSliderChange('boldness', Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Conservative / Humble</span>
              <span>Disruptive & Provocative</span>
            </div>
          </div>

          {/* Technicality Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Technical Depth</span>
              <span className="font-mono font-bold text-purple-400">{currentPolicy.tone.technicality}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={currentPolicy.tone.technicality}
              onChange={(e) => handleSliderChange('technicality', Number(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Plain Consumer Language</span>
              <span>Deep Architecture Specs</span>
            </div>
          </div>

          {/* AI Persona Note */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 text-xs text-slate-300 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-indigo-300">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Automated Sentinel Guardian
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              When content deviates beyond these calibrated voice parameters, the scanner flags a tone misalignment warning and offers suggested rewrites.
            </p>
          </div>
        </div>

        {/* Right Column: Prohibited Terms, Restricted Claims, Competitors & Disclaimers (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Prohibited Terms Manager */}
          <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Prohibited Lexicon ({currentPolicy.prohibitedTerms.length})
                </h3>
              </div>
              <span className="text-xs text-slate-400">Triggers critical block</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newTerm}
                onChange={(e) => setNewTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addProhibitedTerm()}
                placeholder="Add banned term (e.g. 'unbreakable', 'free tokens')..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={addProhibitedTerm}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {currentPolicy.prohibitedTerms.map((term) => (
                <span
                  key={term}
                  className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-1.5 font-medium"
                >
                  &ldquo;{term}&rdquo;
                  <button
                    onClick={() => removeProhibitedTerm(term)}
                    className="hover:text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Restricted Claims Manager */}
          <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Restricted Claims ({(currentPolicy.restrictedClaims || []).length})
                </h3>
              </div>
              <span className="text-xs text-slate-400">Requires proof</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newClaim}
                onChange={(e) => setNewClaim(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addRestrictedClaim()}
                placeholder="Add restricted claim (e.g. 'instant recovery', 'zero latency')..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={addRestrictedClaim}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {(currentPolicy.restrictedClaims || []).map((claim) => (
                <span
                  key={claim}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-1.5 font-medium"
                >
                  &ldquo;{claim}&rdquo;
                  <button
                    onClick={() => removeRestrictedClaim(claim)}
                    className="hover:text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Competitor Exclusions Manager */}
          <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Protected & Excluded Competitor Trademarks ({currentPolicy.competitorExclusions.length})
                </h3>
              </div>
              <span className="text-xs text-slate-400">Prevents disparagement lawsuits</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newCompetitor}
                onChange={(e) => setNewCompetitor(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCompetitor()}
                placeholder="Add competitor trademark (e.g. 'Salesforce', 'Stripe')..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={addCompetitor}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {currentPolicy.competitorExclusions.map((comp) => (
                <span
                  key={comp}
                  className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs flex items-center gap-1.5 font-medium"
                >
                  {comp}
                  <button
                    onClick={() => removeCompetitor(comp)}
                    className="hover:text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Mandatory Disclaimers */}
          <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Mandatory Legal Notices & Disclaimers ({currentPolicy.mandatoryDisclaimers.length})
                </h3>
              </div>
              <span className="text-xs text-slate-400">Checked by complete text</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newDisclaimer}
                onChange={(e) => setNewDisclaimer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addDisclaimer()}
                placeholder="Add required disclaimer (e.g. 'Subject to terms. #ad')..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={addDisclaimer}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>

            <div className="space-y-2 pt-1">
              {currentPolicy.mandatoryDisclaimers.map((disclaimer, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-950/80 border border-white/10 text-xs text-slate-300 flex items-start justify-between gap-2"
                >
                  <span className="font-mono text-slate-300 leading-relaxed italic">
                    &ldquo;{disclaimer}&rdquo;
                  </span>
                  <button
                    onClick={() => removeDisclaimer(idx)}
                    className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
