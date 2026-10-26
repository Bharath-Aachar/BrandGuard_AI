'use client';

import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ShieldAlert,
  Globe,
  Radio,
  ExternalLink,
  CheckCircle,
  FileWarning,
  Send,
  PlusCircle,
  Clock,
  Eye,
  Filter,
} from 'lucide-react';
import { ThreatMention } from '../types/brandguard';

interface ThreatRadarTabProps {
  threats: ThreatMention[];
  onUpdateThreatStatus: (id: string, status: ThreatMention['status']) => void;
  onAddThreat: (threat: ThreatMention) => void;
}

export const ThreatRadarTab: React.FC<ThreatRadarTabProps> = ({
  threats,
  onUpdateThreatStatus,
  onAddThreat,
}) => {
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterThreatLevel, setFilterThreatLevel] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSimulateNewThreat = () => {
    const sources: ThreatMention['source'][] = ['Twitter/X', 'Reddit', 'Ad Network', 'TikTok', 'Web Domain'];
    const types: ThreatMention['type'][] = ['Counterfeit Ad', 'Trademark Misuse', 'Spoofed Domain', 'Unauthorized Endorsement'];
    const randomSource = sources[Math.floor(Math.random() * sources.length)];
    const randomType = types[Math.floor(Math.random() * types.length)];

    const newThreat: ThreatMention = {
      id: `thm-${Date.now().toString().slice(-4)}`,
      source: randomSource,
      author: 'Unknown Actor ' + Math.floor(Math.random() * 900 + 100),
      handle: `@threat_node_${Math.floor(Math.random() * 900)}`,
      timestamp: 'Just now',
      content: `Suspicious advertising campaign detected targeting BrandGuard trademarks with unauthorized coupon incentives.`,
      threatLevel: Math.random() > 0.5 ? 'high' : 'medium',
      type: randomType,
      sentimentScore: -0.65,
      status: 'unresolved',
      reachEstimated: `${Math.floor(Math.random() * 50 + 10)}K views`,
    };

    onAddThreat(newThreat);
    showNotification('🚨 New threat signature detected by Sentinel Radar!');
  };

  const filteredThreats = threats.filter((t) => {
    if (filterSource !== 'all' && t.source !== filterSource) return false;
    if (filterThreatLevel !== 'all' && t.threatLevel !== filterThreatLevel) return false;
    return true;
  });

  const highThreatCount = threats.filter((t) => t.threatLevel === 'high' && t.status !== 'mitigated').length;

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-slate-900 border border-indigo-500/40 text-slate-100 shadow-2xl flex items-center gap-3 animate-bounce">
          <Activity className="w-5 h-5 text-indigo-400" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Threat Intelligence Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              Active High Alerts
            </span>
            <div className="text-2xl font-black text-rose-400">{highThreatCount} Critical</div>
            <span className="text-[11px] text-slate-400">Requires triage</span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0">
            <Radio className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              Monitored Nodes
            </span>
            <div className="text-2xl font-black text-white">1,480/sec</div>
            <span className="text-[11px] text-emerald-400">DNS, Ads, Social</span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center shrink-0">
            <Globe className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              Domains Guarded
            </span>
            <div className="text-2xl font-black text-white">42 TLDs</div>
            <span className="text-[11px] text-slate-400">Anti-typosquatting on</span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <CheckCircle className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              Mitigation Speed
            </span>
            <div className="text-2xl font-black text-emerald-400">3.8 mins</div>
            <span className="text-[11px] text-slate-400">Avg takedown trigger</span>
          </div>
        </div>

      </div>

      {/* Main Section: Radar Visualizer & Threat Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Radar Graphic (4 Cols) */}
        <div className="lg:col-span-4 glass-panel rounded-2xl p-5 border border-white/10 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="flex items-center justify-between w-full pb-3 border-b border-white/5 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Live Sentinel Sweep
            </span>
            <span className="text-[11px] font-mono text-cyan-400">RADAR ACTIVE</span>
          </div>

          {/* Animated Circular Radar Screen */}
          <div className="relative w-64 h-64 rounded-full border-2 border-indigo-500/30 bg-slate-950/80 flex items-center justify-center my-3 shadow-2xl shadow-indigo-500/10">
            
            {/* Concentric rings */}
            <div className="absolute w-48 h-48 rounded-full border border-indigo-500/20"></div>
            <div className="absolute w-32 h-32 rounded-full border border-indigo-500/20"></div>
            <div className="absolute w-16 h-16 rounded-full border border-indigo-500/25"></div>

            {/* Crosshairs */}
            <div className="absolute w-full h-[1px] bg-indigo-500/20"></div>
            <div className="absolute h-full w-[1px] bg-indigo-500/20"></div>

            {/* Rotating Radar Sweep Cone */}
            <div
              className="absolute inset-0 rounded-full animate-radar pointer-events-none"
              style={{
                background:
                  'conic-gradient(from 0deg at 50% 50%, rgba(99, 102, 241, 0.4) 0deg, rgba(6, 182, 212, 0.1) 45deg, transparent 90deg, transparent 360deg)',
              }}
            ></div>

            {/* Simulated Blips / Targets */}
            <div className="absolute top-12 left-20 w-3 h-3 rounded-full bg-rose-500 animate-ping"></div>
            <div className="absolute top-12 left-20 w-3 h-3 rounded-full bg-rose-400"></div>

            <div className="absolute bottom-16 right-16 w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></div>

            <div className="absolute top-28 right-14 w-2 h-2 rounded-full bg-cyan-400"></div>

            {/* Center icon */}
            <div className="z-10 w-8 h-8 rounded-full bg-indigo-600/60 border border-indigo-400 flex items-center justify-center">
              <Radio className="w-4 h-4 text-cyan-300" />
            </div>
          </div>

          <p className="text-xs text-slate-400 text-center mt-2 max-w-xs">
            Continuously ingesting open web crawls, registrar feeds, and social media firehoses for unauthorized brand asset usage.
          </p>

          <button
            id="simulate-threat-btn"
            onClick={handleSimulateNewThreat}
            className="mt-4 w-full py-2.5 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
            Simulate Incoming Threat
          </button>
        </div>

        {/* Threat Stream Feed (8 Cols) */}
        <div className="lg:col-span-8 glass-panel rounded-2xl p-5 border border-white/10 flex flex-col">
          
          {/* Header & Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/5 gap-3">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Activity className="w-4 h-4 text-rose-400" />
                Live Reputation & Trademark Triage Feed
              </h2>
              <p className="text-xs text-slate-400">
                Displaying real-time detected infractions with instant legal and mitigation workflows.
              </p>
            </div>

            {/* Source & Severity Filter */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <div className="flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded-lg border border-white/5">
                <Filter className="w-3 h-3 text-slate-400" />
                <select
                  value={filterSource}
                  onChange={(e) => setFilterSource(e.target.value)}
                  className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="all" className="bg-slate-900">All Sources</option>
                  <option value="Twitter/X" className="bg-slate-900">Twitter/X</option>
                  <option value="Reddit" className="bg-slate-900">Reddit</option>
                  <option value="Web Domain" className="bg-slate-900">Web Domains</option>
                  <option value="TikTok" className="bg-slate-900">TikTok</option>
                  <option value="Ad Network" className="bg-slate-900">Ad Networks</option>
                </select>
              </div>

              <div className="flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded-lg border border-white/5">
                <select
                  value={filterThreatLevel}
                  onChange={(e) => setFilterThreatLevel(e.target.value)}
                  className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="all" className="bg-slate-900">All Severities</option>
                  <option value="high" className="bg-slate-900">Critical High</option>
                  <option value="medium" className="bg-slate-900">Medium</option>
                  <option value="low" className="bg-slate-900">Low / Monitored</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stream Cards */}
          <div className="mt-4 space-y-3.5 flex-1 overflow-y-auto max-h-[500px] pr-1">
            {filteredThreats.map((threat) => {
              const isHigh = threat.threatLevel === 'high';
              const isMitigated = threat.status === 'mitigated';

              return (
                <div
                  key={threat.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isMitigated
                      ? 'bg-slate-900/40 border-emerald-500/20 opacity-70'
                      : isHigh
                      ? 'bg-rose-950/20 border-rose-500/30 hover:border-rose-500/50'
                      : 'bg-slate-900/60 border-white/10 hover:border-indigo-500/30'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/10 text-slate-200 border border-white/15">
                        {threat.source}
                      </span>
                      <span className="text-xs font-bold text-white">{threat.author}</span>
                      <span className="text-xs text-slate-400 font-mono">{threat.handle}</span>
                      <span className="text-[11px] text-slate-500">• {threat.timestamp}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          threat.threatLevel === 'high'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : threat.threatLevel === 'medium'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        }`}
                      >
                        {threat.type}
                      </span>

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          threat.status === 'mitigated'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : threat.status === 'investigating'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {threat.status}
                      </span>
                    </div>
                  </div>

                  {/* Threat Description */}
                  <p className="text-xs text-slate-200 leading-relaxed font-sans mb-3">
                    {threat.content}
                  </p>

                  {/* Metrics & Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/5 text-xs">
                    <div className="flex items-center gap-4 text-slate-400 text-[11px]">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        Reach: {threat.reachEstimated}
                      </span>
                      <span>
                        Sentiment Risk:{' '}
                        <strong className="text-rose-400">
                          {Math.round(threat.sentimentScore * 100)}%
                        </strong>
                      </span>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex items-center gap-2">
                      {threat.status !== 'mitigated' ? (
                        <>
                          <button
                            onClick={() => {
                              onUpdateThreatStatus(threat.id, 'investigating');
                              showNotification(`Dispatched incident ${threat.id} to Legal Sentinel`);
                            }}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-all border border-amber-500/30"
                          >
                            Investigate
                          </button>
                          <button
                            onClick={() => {
                              onUpdateThreatStatus(threat.id, 'mitigated');
                              showNotification(`Cease & Desist transmitted for ${threat.id}`);
                            }}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" />
                            Trigger Takedown
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Mitigated & Recorded
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
};
