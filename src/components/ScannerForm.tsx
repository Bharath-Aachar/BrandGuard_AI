"use client";
import { useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import type { Finding } from "@/types";
import { levelFromScore } from "@/lib/risk";
import RiskBadge from "./RiskBadge";

const POLICIES = ["Financial promotions", "Health and wellness claims", "General brand voice"];
const RULES: { re: RegExp; title: string; severity: Finding["severity"]; explanation: string }[] = [
  { re: /guarantee[d]?/i, title: "Guaranteed outcome", severity: "Critical", explanation: "Guarantees are rarely substantiated and often prohibited." },
  { re: /\b(100%|zero risk|risk[- ]free)\b/i, title: "Absolute claim", severity: "High", explanation: "Absolute statements can mislead audiences." },
  { re: /\b(cure[sd]?|miracle)\b/i, title: "Medical claim", severity: "High", explanation: "Medical claims require evidence and regulatory approval." },
  { re: /\b(millionaire|get rich)\b/i, title: "Earnings promise", severity: "Critical", explanation: "Income promises are typically prohibited." },
  { re: /\b(best|biggest|#1)\b/i, title: "Unverified superlative", severity: "Medium", explanation: "Superlatives need a verifiable basis." },
];
const PENALTY = { Critical: 30, High: 20, Medium: 10, Low: 5 };

interface Result { score: number; findings: (Finding & { match: string })[] }

export default function ScannerForm() {
  const [text, setText] = useState("");
  const [policy, setPolicy] = useState(POLICIES[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  function analyze() {
    setError(""); setResult(null);
    if (text.trim().length < 10) { setError("Enter at least 10 characters of content to analyze."); return; }
    setLoading(true);
    setTimeout(() => {
      const findings = RULES.flatMap((r, i) => {
        const m = text.match(r.re);
        return m ? [{ id: `m${i}`, title: r.title, severity: r.severity, explanation: r.explanation, excerpt: m[0], match: m[0] }] : [];
      });
      const score = Math.max(5, 100 - findings.reduce((n, f) => n + PENALTY[f.severity], 0));
      setResult({ score, findings });
      setLoading(false);
    }, 900);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-3">
        <div>
          <label htmlFor="content" className="mb-1.5 block text-sm font-medium">Content to scan</label>
          <textarea id="content" rows={10} value={text} onChange={(e) => setText(e.target.value)}
            placeholder="Paste a post, ad, or email draft here."
            className="w-full resize-y rounded-lg border border-line bg-surface p-3 text-sm leading-relaxed placeholder:text-muted/70" />
        </div>
        <div>
          <label htmlFor="policy" className="mb-1.5 block text-sm font-medium">Policy</label>
          <select id="policy" value={policy} onChange={(e) => setPolicy(e.target.value)}
            className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm sm:w-72">
            {POLICIES.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
        {error && <p role="alert" className="flex items-center gap-2 text-sm text-critical"><AlertCircle size={16} aria-hidden />{error}</p>}
        <button onClick={analyze} disabled={loading}
          className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60">
          {loading && <Loader2 size={16} className="animate-spin" aria-hidden />}
          {loading ? "Analyzing…" : "Analyze"}
        </button>
      </div>

      <section aria-live="polite" aria-labelledby="res" className="rounded-lg border border-line bg-surface p-5 lg:col-span-2">
        <h2 id="res" className="text-base font-semibold">Result</h2>
        <p className="mt-0.5 text-xs text-muted">Demo result from simple keyword rules for {policy}. No AI analysis is running.</p>
        {!result ? (
          <p className="py-8 text-center text-sm text-muted">Analyze some content to see a score and findings.</p>
        ) : (
          <div className="mt-4">
            <p className="flex items-center gap-3 text-3xl font-semibold tabular-nums">{result.score}<span className="text-base font-normal text-muted">/ 100</span><RiskBadge level={levelFromScore(result.score)} /></p>
            {result.findings.length === 0
              ? <p className="mt-4 text-sm text-muted">No issues matched the demo rules.</p>
              : <ul className="mt-4 divide-y divide-line/60">
                  {result.findings.map((f) => (
                    <li key={f.id} className="py-3 text-sm">
                      <div className="flex items-center justify-between gap-3"><span className="font-medium">{f.title}</span><RiskBadge level={f.severity} /></div>
                      <p className="mt-1 text-muted">{f.explanation} Matched: “{f.match}”.</p>
                    </li>
                  ))}
                </ul>}
          </div>
        )}
      </section>
    </div>
  );
}
