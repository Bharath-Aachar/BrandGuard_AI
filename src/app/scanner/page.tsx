'use client';

import DashboardLayout from "@/components/DashboardLayout";
import { ScannerTab } from "@/components/ScannerTab";
import { useBrandGuard } from "@/context/BrandGuardContext";
import { SAMPLE_PRESETS } from "@/lib/brandSafetyEngine";

export default function ScannerPage() {
  const {
    currentPolicy,
    scanResult,
    inputText,
    setInputText,
    setIsAuditModalOpen,
    policies,
    currentPolicyId,
    setCurrentPolicyId,
    createSubmission,
  } = useBrandGuard();

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">AI Content Safety & Compliance Scanner</h1>
          <p className="text-sm text-slate-400">Scan marketing, social, and ad copy against regulatory guidelines, trademark rules, and brand voice.</p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="scanner-policy-select" className="text-xs text-slate-400">Active Policy:</label>
          <select
            id="scanner-policy-select"
            value={currentPolicyId}
            onChange={(e) => setCurrentPolicyId(e.target.value)}
            className="rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {Object.values(policies).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ScannerTab
        currentPolicy={currentPolicy}
        presets={SAMPLE_PRESETS}
        scanResult={scanResult}
        onScan={(text) => setInputText(text)}
        inputText={inputText}
        setInputText={setInputText}
        onOpenAudit={() => setIsAuditModalOpen(true)}
        onSubmitForReview={async (text, title) => {
          await createSubmission(title || 'Campaign Copy from Scanner', text, currentPolicyId);
        }}
      />
    </DashboardLayout>
  );
}
