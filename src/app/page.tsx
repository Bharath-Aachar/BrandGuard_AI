'use client';

import React, { useState, useMemo } from 'react';
import { Navbar } from '../components/Navbar';
import { ScannerTab } from '../components/ScannerTab';
import { ThreatRadarTab } from '../components/ThreatRadarTab';
import { GuidelinesTab } from '../components/GuidelinesTab';
import { AnalyticsTab } from '../components/AnalyticsTab';
import { AuditModal } from '../components/AuditModal';
import {
  DEFAULT_POLICIES,
  SAMPLE_PRESETS,
  MOCK_THREATS,
  analyzeBrandContent,
} from '../lib/brandSafetyEngine';
import { BrandPolicy, ThreatMention } from '../types/brandguard';
import { Shield, Sparkles, CheckCircle2, Lock, Radio } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'scanner' | 'threats' | 'guidelines' | 'analytics'>('scanner');
  const [policies, setPolicies] = useState<Record<string, BrandPolicy>>(DEFAULT_POLICIES);
  const [currentPolicyId, setCurrentPolicyId] = useState<string>('fintech');
  const [inputText, setInputText] = useState<string>(SAMPLE_PRESETS[0].text);
  const [threats, setThreats] = useState<ThreatMention[]>(MOCK_THREATS);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);

  const currentPolicy = useMemo(() => {
    return policies[currentPolicyId] || policies.fintech;
  }, [policies, currentPolicyId]);

  // Real-time analysis of the current input text against current policy
  const scanResult = useMemo(() => {
    return analyzeBrandContent(inputText, currentPolicy);
  }, [inputText, currentPolicy]);

  const handleUpdatePolicy = (updated: BrandPolicy) => {
    setPolicies((prev) => ({
      ...prev,
      [updated.id]: updated,
    }));
  };

  const handleUpdateThreatStatus = (id: string, status: ThreatMention['status']) => {
    setThreats((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    );
  };

  const handleAddThreat = (newThreat: ThreatMention) => {
    setThreats((prev) => [newThreat, ...prev]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080b11] text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Top Fixed Executive Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentPolicy={currentPolicy}
        onPolicyChange={setCurrentPolicyId}
        availablePolicies={policies}
        onOpenAudit={() => setIsAuditModalOpen(true)}
      />

      {/* Main App Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'scanner' && (
          <ScannerTab
            currentPolicy={currentPolicy}
            presets={SAMPLE_PRESETS}
            scanResult={scanResult}
            onScan={(text) => setInputText(text)}
            inputText={inputText}
            setInputText={setInputText}
            onOpenAudit={() => setIsAuditModalOpen(true)}
          />
        )}

        {activeTab === 'threats' && (
          <ThreatRadarTab
            threats={threats}
            onUpdateThreatStatus={handleUpdateThreatStatus}
            onAddThreat={handleAddThreat}
          />
        )}

        {activeTab === 'guidelines' && (
          <GuidelinesTab
            currentPolicy={currentPolicy}
            onUpdatePolicy={handleUpdatePolicy}
          />
        )}

        {activeTab === 'analytics' && <AnalyticsTab />}
      </main>

      {/* Global Formal Audit Modal */}
      <AuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        scanResult={scanResult}
        currentPolicy={currentPolicy}
      />

      {/* Enterprise Platform Footer */}
      <footer className="border-t border-white/5 bg-slate-950/80 py-8 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-bold text-slate-300">
              <Shield className="w-4 h-4 text-indigo-400" />
              BrandGuard AI Sentinel Platform
            </div>
            <span>•</span>
            <span>Version 4.2.0 (Build 9410)</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              All Engines Nominal
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              SOC-2 Type II Certified
            </span>
            <span>•</span>
            <span>FTC & SEC Truth-in-Advertising Aligned</span>
            <span>•</span>
            <span>GDPR Data Minimization</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
