'use client';

import DashboardLayout from "@/components/DashboardLayout";
import { AnalyticsTab } from "@/components/AnalyticsTab";

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white">Brand Health Analytics & Compliance Scorecards</h1>
        <p className="text-sm text-slate-400">
          Executive telemetry across channels, campaign safety scores, historical audit logs, and risk velocity.
        </p>
      </div>

      <AnalyticsTab />
    </DashboardLayout>
  );
}
