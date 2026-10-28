'use client';

import React, { useState } from 'react';
import {
  Download,
  Filter,
  CheckCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { useBrandGuard } from '@/context/BrandGuardContext';

interface AuditLogItem {
  id: string;
  campaign: string;
  channel: string;
  date: string;
  score: number;
  status: 'passed' | 'warning' | 'rejected';
  author: string;
}

const MOCK_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'AUD-901',
    campaign: 'Q4 Enterprise Cloud Infrastructure Launch',
    channel: 'LinkedIn Sponsored',
    date: 'Oct 26, 2026',
    score: 98,
    status: 'passed',
    author: 'Elena Rostova (Marketing VP)',
  },
  {
    id: 'AUD-902',
    campaign: 'Crypto High Yield Promo Draft #2',
    channel: 'Twitter/X Ads',
    date: 'Oct 25, 2026',
    score: 54,
    status: 'rejected',
    author: 'Liam Vance (Growth Lead)',
  },
  {
    id: 'AUD-903',
    campaign: 'D2C Skincare Fall Influencer Brief',
    channel: 'TikTok Creator Marketplace',
    date: 'Oct 24, 2026',
    score: 78,
    status: 'warning',
    author: 'Chloe Simmons (Affiliate Mgr)',
  },
  {
    id: 'AUD-904',
    campaign: 'Annual ESG & Sustainability Statement',
    channel: 'PR Newswire / Investor Relations',
    date: 'Oct 22, 2026',
    score: 100,
    status: 'passed',
    author: 'Corporate Legal Sentinel',
  },
  {
    id: 'AUD-905',
    campaign: 'Competitive Comparison Landing Page vs Hubspot',
    channel: 'Google Search Ads',
    date: 'Oct 20, 2026',
    score: 72,
    status: 'warning',
    author: 'Marcus Brody (PPC Specialist)',
  },
];

export const AnalyticsTab: React.FC = () => {
  const { auditEvents } = useBrandGuard();
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Generate real CSV file from actual audit history events and demo logs
  const handleExportCsv = () => {
    setIsExporting(true);
    try {
      const headers = ['Audit ID', 'Target / Campaign', 'Type / Channel', 'Author / Actor', 'Date', 'Score / Status', 'Details'];
      
      const realRows = auditEvents.map((evt) => [
        `"${evt.id}"`,
        `"${evt.targetId || 'Platform Policy'}"`,
        `"${evt.eventType}"`,
        `"${evt.actorName}"`,
        `"${evt.timestamp}"`,
        `"Logged"`,
        `"${(evt.details || '').replace(/"/g, '""')}"`,
      ]);

      const demoRows = MOCK_AUDIT_LOGS.map((log) => [
        `"${log.id}"`,
        `"${log.campaign}"`,
        `"${log.channel}"`,
        `"${log.author}"`,
        `"${log.date}"`,
        `"${log.score}% (${log.status})"`,
        `"Historical simulated campaign scan log"`,
      ]);

      const csvContent = [headers.join(','), ...realRows.map((r) => r.join(',')), ...demoRows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', url);
      downloadAnchor.setAttribute('download', `brandguard_compliance_audit_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('CSV export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const filteredLogs = MOCK_AUDIT_LOGS.filter((item) => {
    if (selectedChannel !== 'all' && !item.channel.toLowerCase().includes(selectedChannel.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel rounded-2xl p-5 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Audit & Governance Analytics
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="text-xs text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              Demo Analytics (Sample Telemetry)
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Enterprise Brand Health & Compliance Metrics
          </h1>
          <p className="text-sm text-slate-300 mt-0.5">
            Cross-channel compliance velocity, risk incident suppression rates, and verified audit logs for executive reporting.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            disabled={isExporting}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            {isExporting ? 'Generating...' : 'Export Audit History (CSV)'}
          </button>
        </div>
      </div>

      {/* KPI Stats Grid - Clearly labeled as Demo Analytics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400">Global Health Index</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              +4.8% MoM
            </span>
          </div>
          <div className="text-3xl font-black text-white mt-2">94.6%</div>
          <p className="text-xs text-slate-400 mt-1">Grade A+ across 1,248 assets (Demo Sample)</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400">Monthly Scans</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
              +18% MoM
            </span>
          </div>
          <div className="text-3xl font-black text-white mt-2">1,248</div>
          <p className="text-xs text-slate-400 mt-1">Broadcast copy & media assets</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400">Threats Suppressed</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              100% Rate
            </span>
          </div>
          <div className="text-3xl font-black text-cyan-400 mt-2">14</div>
          <p className="text-xs text-slate-400 mt-1">Typosquats & counterfeit ads (Simulated)</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400">Regulatory Violations</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Zero Fines
            </span>
          </div>
          <div className="text-3xl font-black text-emerald-400 mt-2">0</div>
          <p className="text-xs text-slate-400 mt-1">Zero FTC/SEC sanctions incurred</p>
        </div>
      </div>

      {/* Channel Breakdown & Incident Category Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Channel Compliance Health */}
        <div className="lg:col-span-6 glass-panel rounded-2xl p-5 border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Channel Compliance Scorecards
            </h2>
            <span className="text-xs text-slate-400">Sample Benchmarks</span>
          </div>

          <div className="space-y-3.5">
            {[
              { channel: 'Investor Relations & PR Wire', score: 99.4, count: '142 releases', color: 'bg-emerald-500' },
              { channel: 'LinkedIn Corporate Page & Execs', score: 98.2, count: '412 posts', color: 'bg-emerald-400' },
              { channel: 'Meta Paid Ads (Facebook & IG)', score: 92.5, count: '318 campaigns', color: 'bg-teal-400' },
              { channel: 'Twitter / X Marketing Ads', score: 88.6, count: '240 promos', color: 'bg-amber-400' },
              { channel: 'TikTok & Creator Partnerships', score: 84.1, count: '136 videos', color: 'bg-orange-400' },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-200 font-semibold">{item.channel}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">{item.count}</span>
                    <span className="font-bold text-white font-mono">{item.score}%</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${item.color}`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Distribution Breakdown */}
        <div className="lg:col-span-6 glass-panel rounded-2xl p-5 border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Risk Incident Classification
            </h2>
            <span className="text-xs text-slate-400">Demo Heuristic Distribution</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
              <span className="text-xs font-semibold text-rose-300">Regulatory & Legal Claims</span>
              <div className="text-2xl font-black text-white">41%</div>
              <p className="text-[11px] text-slate-400">Missing disclaimers & yield promises</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
              <span className="text-xs font-semibold text-amber-300">Technical Superlatives</span>
              <div className="text-2xl font-black text-white">28%</div>
              <p className="text-[11px] text-slate-400">&ldquo;100% unhackable&rdquo;, &ldquo;zero latency&rdquo;</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
              <span className="text-xs font-semibold text-cyan-300">Competitor Trademark Bashes</span>
              <div className="text-2xl font-black text-white">19%</div>
              <p className="text-[11px] text-slate-400">Direct mentions without fair disclaimers</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
              <span className="text-xs font-semibold text-purple-300">Brand Voice Misalignment</span>
              <div className="text-2xl font-black text-white">12%</div>
              <p className="text-[11px] text-slate-400">Excessive slang & off-brand copy</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Automated checks flag noncompliant phrases before public release.</span>
          </div>
        </div>
      </div>

      {/* Real Live Audit Events Log Table (Derived from actual workflow actions) */}
      <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/5 gap-2">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
              Live Recorded Workflow & Audit Trail ({auditEvents.length} Events)
            </h2>
            <p className="text-xs text-slate-400">
              Derives from actual user actions in the workspace: scan executions, submissions, revisions, and reviewer sign-offs.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-white/5">
              <tr>
                <th className="py-3 px-4">Event ID</th>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Target</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200 font-mono text-[11px]">
              {auditEvents.slice(0, 10).map((evt) => (
                <tr key={evt.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 text-indigo-400 font-bold">{evt.id}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                      {evt.eventType}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white font-sans">{evt.actorName}</td>
                  <td className="py-3 px-4 text-cyan-300">{evt.targetId || '–'}</td>
                  <td className="py-3 px-4 text-slate-400">{new Date(evt.timestamp).toLocaleString()}</td>
                  <td className="py-3 px-4 font-sans text-slate-300 max-w-xs truncate">{evt.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historical Sample Scans Table */}
      <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/5 gap-2">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Sample Historical Campaign Logs
            </h2>
            <p className="text-xs text-slate-400">
              Reference sample records across enterprise distribution channels.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-white/10 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-slate-900">All Channels</option>
                <option value="LinkedIn" className="bg-slate-900">LinkedIn</option>
                <option value="Twitter" className="bg-slate-900">Twitter/X</option>
                <option value="TikTok" className="bg-slate-900">TikTok</option>
                <option value="PR" className="bg-slate-900">PR Newswire</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-white/5">
              <tr>
                <th className="py-3 px-4">Audit ID</th>
                <th className="py-3 px-4">Campaign Name</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Author / Owner</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-center">Score</th>
                <th className="py-3 px-4 text-right">Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 font-mono text-indigo-400 font-bold">{log.id}</td>
                  <td className="py-3.5 px-4 font-semibold text-white">{log.campaign}</td>
                  <td className="py-3.5 px-4 text-slate-300">{log.channel}</td>
                  <td className="py-3.5 px-4 text-slate-400">{log.author}</td>
                  <td className="py-3.5 px-4 text-slate-400">{log.date}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`font-mono font-bold ${
                        log.score >= 85
                          ? 'text-emerald-400'
                          : log.score >= 70
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {log.score}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        log.status === 'passed'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : log.status === 'warning'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
