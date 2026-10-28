'use client';

import DashboardLayout from "@/components/DashboardLayout";
import { GuidelinesTab } from "@/components/GuidelinesTab";
import { useBrandGuard } from "@/context/BrandGuardContext";

export default function BrandGuidelinesPage() {
  const {
    currentPolicy,
    updatePolicy,
    policies,
    currentPolicyId,
    setCurrentPolicyId,
  } = useBrandGuard();

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Brand Guidelines & Governance Studio</h1>
          <p className="text-sm text-slate-400">
            Calibrate voice sliders, manage prohibited lexicons, and configure mandatory regulatory disclosures.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="guidelines-policy-select" className="text-xs text-slate-400">Editing Policy:</label>
          <select
            id="guidelines-policy-select"
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

      <GuidelinesTab
        currentPolicy={currentPolicy}
        onUpdatePolicy={updatePolicy}
      />
    </DashboardLayout>
  );
}
