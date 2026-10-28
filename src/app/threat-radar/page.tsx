'use client';

import DashboardLayout from "@/components/DashboardLayout";
import { ThreatRadarTab } from "@/components/ThreatRadarTab";
import { useBrandGuard } from "@/context/BrandGuardContext";

export default function ThreatRadarPage() {
  const { threats, updateThreatStatus, addThreat } = useBrandGuard();

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white">Live Sentinel Threat Radar</h1>
        <p className="text-sm text-slate-400">
          Autonomous real-time scanning of social media, registrar WHOIS feeds, ad networks, and forums for brand abuse.
        </p>
      </div>

      <ThreatRadarTab
        threats={threats}
        onUpdateThreatStatus={updateThreatStatus}
        onAddThreat={addThreat}
      />
    </DashboardLayout>
  );
}
