'use client';

import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import {
  BrandPolicy,
  ThreatMention,
  ScanResult,
  ContentSubmission,
  AuditEvent,
  UserProfile,
  ReviewWorkflowStatus,
} from '@/types/brandguard';
import {
  DEFAULT_POLICIES,
  MOCK_THREATS,
  SAMPLE_PRESETS,
  analyzeBrandContent,
} from '@/lib/brandSafetyEngine';
import {
  DEMO_USERS,
  INITIAL_SUBMISSIONS,
  INITIAL_AUDIT_EVENTS,
} from '@/lib/workflowStore';
import { isSupabaseConfigured } from '@/lib/supabase';

interface BrandGuardContextType {
  policies: Record<string, BrandPolicy>;
  currentPolicyId: string;
  currentPolicy: BrandPolicy;
  setCurrentPolicyId: (id: string) => void;
  updatePolicy: (updated: BrandPolicy) => void;
  inputText: string;
  setInputText: (text: string) => void;
  threats: ThreatMention[];
  updateThreatStatus: (id: string, status: ThreatMention['status']) => void;
  addThreat: (threat: ThreatMention) => void;
  scanResult: ScanResult;
  isAuditModalOpen: boolean;
  setIsAuditModalOpen: (open: boolean) => void;

  // Persistence & Storage Mode
  storageMode: 'supabase' | 'local_demo';

  // Role & Approval Workflow
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  submissions: ContentSubmission[];
  auditEvents: AuditEvent[];
  createSubmission: (title: string, content: string, policyId?: string) => Promise<ContentSubmission>;
  submitReview: (submissionId: string, decision: 'approved' | 'rejected' | 'changes_requested', comments: string) => Promise<void>;
  reviseSubmission: (submissionId: string, newContent: string) => Promise<ContentSubmission>;
}

const BrandGuardContext = createContext<BrandGuardContextType | undefined>(undefined);

const STORAGE_KEYS = {
  POLICIES: 'bg_policies_v2',
  SUBMISSIONS: 'bg_submissions_v2',
  AUDIT_EVENTS: 'bg_audit_events_v2',
  CURRENT_USER_ROLE: 'bg_user_role_v2',
};

export const BrandGuardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [policies, setPolicies] = useState<Record<string, BrandPolicy>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.POLICIES);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn('Could not load cached policies:', e);
      }
    }
    return DEFAULT_POLICIES;
  });

  const [currentPolicyId, setCurrentPolicyId] = useState<string>('fintech');
  const [inputText, setInputText] = useState<string>(SAMPLE_PRESETS[0].text);
  const [threats, setThreats] = useState<ThreatMention[]>(MOCK_THREATS);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);

  const [submissions, setSubmissions] = useState<ContentSubmission[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn('Could not load cached submissions:', e);
      }
    }
    return INITIAL_SUBMISSIONS;
  });

  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_EVENTS);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn('Could not load cached audit events:', e);
      }
    }
    return INITIAL_AUDIT_EVENTS;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedRole = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ROLE);
        if (savedRole && DEMO_USERS[savedRole]) {
          return DEMO_USERS[savedRole];
        }
      } catch (e) {
        console.warn('Could not load cached user role:', e);
      }
    }
    return DEMO_USERS.creator;
  });

  const storageMode: 'supabase' | 'local_demo' = isSupabaseConfigured ? 'supabase' : 'local_demo';

  // Save changes to localStorage when updated
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.POLICIES, JSON.stringify(policies));
    } catch (e) {
      console.warn('Could not save policies to storage:', e);
    }
  }, [policies]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
    } catch (e) {
      console.warn('Could not save submissions to storage:', e);
    }
  }, [submissions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.AUDIT_EVENTS, JSON.stringify(auditEvents));
    } catch (e) {
      console.warn('Could not save audit events to storage:', e);
    }
  }, [auditEvents]);

  const currentPolicy = useMemo(() => {
    return policies[currentPolicyId] || policies.fintech || DEFAULT_POLICIES.fintech;
  }, [policies, currentPolicyId]);

  // Evaluates text against the active policy dynamically
  const scanResult = useMemo(() => {
    return analyzeBrandContent(inputText, currentPolicy);
  }, [inputText, currentPolicy]);

  const updatePolicy = useCallback((updated: BrandPolicy) => {
    setPolicies((prev) => ({
      ...prev,
      [updated.id]: updated,
    }));

    // Record audit event for policy modification
    const auditItem: AuditEvent = {
      id: `aud-pol-${Date.now()}`,
      eventType: 'policy_updated',
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      targetId: updated.id,
      details: `Updated brand guidelines & thresholds for "${updated.name}".`,
      timestamp: new Date().toISOString(),
    };
    setAuditEvents((prev) => [auditItem, ...prev]);
  }, [currentUser]);

  const updateThreatStatus = useCallback((id: string, status: ThreatMention['status']) => {
    setThreats((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    );
  }, []);

  const addThreat = useCallback((newThreat: ThreatMention) => {
    setThreats((prev) => [newThreat, ...prev]);
  }, []);

  const handleSetCurrentUser = useCallback((user: UserProfile) => {
    setCurrentUser(user);
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ROLE, user.role);
    } catch (e) {
      console.warn('Could not cache user role:', e);
    }
  }, []);

  // Submit new content for review (Creator workflow)
  const createSubmission = useCallback(async (
    title: string,
    content: string,
    policyId?: string
  ): Promise<ContentSubmission> => {
    const targetPolicyId = policyId || currentPolicyId;
    const pol = policies[targetPolicyId] || currentPolicy;
    const calculatedScan = analyzeBrandContent(content, pol);
    const now = new Date().toISOString();

    const newSub: ContentSubmission = {
      id: `sub-${Date.now().toString().slice(-5)}`,
      title: title || 'New Campaign Draft',
      content,
      policyId: targetPolicyId,
      version: 1,
      creatorId: currentUser.id,
      creatorName: currentUser.name,
      status: 'pending_review',
      scanResult: calculatedScan,
      reviews: [],
      createdAt: now,
      updatedAt: now,
    };

    setSubmissions((prev) => [newSub, ...prev]);

    const auditItem: AuditEvent = {
      id: `aud-sub-${Date.now()}`,
      eventType: 'submission_created',
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      targetId: newSub.id,
      details: `Submitted "${newSub.title}" for compliance sign-off (Safety Score: ${calculatedScan.overallScore}/100).`,
      timestamp: now,
    };
    setAuditEvents((prev) => [auditItem, ...prev]);

    // Also trigger server endpoint if online
    try {
      await fetch('/api/workflow/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newSub.title,
          content: newSub.content,
          policyId: targetPolicyId,
          creator: currentUser,
        }),
      });
    } catch (err) {
      console.warn('API sync deferred; saved locally:', err);
    }

    return newSub;
  }, [currentPolicyId, policies, currentPolicy, currentUser]);

  // Submit revised version of an existing submission (Creator workflow)
  const reviseSubmission = useCallback(async (
    submissionId: string,
    newContent: string
  ): Promise<ContentSubmission> => {
    const existing = submissions.find((s) => s.id === submissionId);
    if (!existing) {
      throw new Error(`Submission "${submissionId}" not found.`);
    }

    const pol = policies[existing.policyId] || currentPolicy;
    const calculatedScan = analyzeBrandContent(newContent, pol);
    const now = new Date().toISOString();

    const updatedSub: ContentSubmission = {
      ...existing,
      content: newContent,
      version: existing.version + 1,
      status: 'pending_review',
      scanResult: calculatedScan,
      updatedAt: now,
    };

    setSubmissions((prev) =>
      prev.map((s) => (s.id === submissionId ? updatedSub : s))
    );

    const auditItem: AuditEvent = {
      id: `aud-rev-${Date.now()}`,
      eventType: 'submission_revised',
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      targetId: updatedSub.id,
      details: `Revised "${updatedSub.title}" to version ${updatedSub.version}. Re-evaluated safety score: ${calculatedScan.overallScore}/100.`,
      timestamp: now,
    };
    setAuditEvents((prev) => [auditItem, ...prev]);

    return updatedSub;
  }, [submissions, policies, currentPolicy, currentUser]);

  // Submit Review Decision (Reviewer workflow - strictly enforced)
  const submitReview = useCallback(async (
    submissionId: string,
    decision: 'approved' | 'rejected' | 'changes_requested',
    comments: string
  ): Promise<void> => {
    // Client-side check before API call
    if (currentUser.role !== 'reviewer' && currentUser.role !== 'admin') {
      throw new Error(
        `Permission Denied: User role "${currentUser.role}" is not authorized to submit reviews. Only authorized reviewers or compliance officers can approve, reject, or request changes.`
      );
    }

    // Call server API for strict server-enforced validation
    const response = await fetch('/api/workflow/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        submissionId,
        decision,
        comments,
        reviewer: currentUser,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Review submission failed with HTTP ${response.status}`);
    }

    const now = new Date().toISOString();
    setSubmissions((prev) =>
      prev.map((s) => {
        if (s.id !== submissionId) return s;
        const newReview = {
          id: `rev-${Date.now().toString().slice(-4)}`,
          submissionId: s.id,
          reviewerId: currentUser.id,
          reviewerName: currentUser.name,
          reviewerRole: currentUser.role,
          status: decision as ReviewWorkflowStatus,
          comments: comments.trim(),
          revisionVersion: s.version,
          createdAt: now,
        };
        return {
          ...s,
          status: decision,
          reviews: [newReview, ...s.reviews],
          updatedAt: now,
        };
      })
    );

    const auditItem: AuditEvent = {
      id: `aud-dec-${Date.now()}`,
      eventType: 'review_decided',
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      targetId: submissionId,
      details: `Review decision "${decision}" recorded for submission ${submissionId} by ${currentUser.name}.`,
      timestamp: now,
    };
    setAuditEvents((prev) => [auditItem, ...prev]);
  }, [currentUser]);

  return (
    <BrandGuardContext.Provider
      value={{
        policies,
        currentPolicyId,
        currentPolicy,
        setCurrentPolicyId,
        updatePolicy,
        inputText,
        setInputText,
        threats,
        updateThreatStatus,
        addThreat,
        scanResult,
        isAuditModalOpen,
        setIsAuditModalOpen,
        storageMode,
        currentUser,
        setCurrentUser: handleSetCurrentUser,
        submissions,
        auditEvents,
        createSubmission,
        submitReview,
        reviseSubmission,
      }}
    >
      {children}
    </BrandGuardContext.Provider>
  );
};

export const useBrandGuard = () => {
  const context = useContext(BrandGuardContext);
  if (!context) {
    throw new Error('useBrandGuard must be used within a BrandGuardProvider');
  }
  return context;
};
