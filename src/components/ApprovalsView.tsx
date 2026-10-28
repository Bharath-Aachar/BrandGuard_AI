'use client';

import React, { useState } from 'react';
import {
  ClipboardCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Send,
  ShieldCheck,
  FileEdit,
  User,
  History,
  AlertOctagon,
} from 'lucide-react';
import { useBrandGuard } from '@/context/BrandGuardContext';
import { ReviewWorkflowStatus } from '@/types/brandguard';
import { DEMO_USERS } from '@/lib/workflowStore';

export default function ApprovalsView() {
  const {
    submissions,
    currentUser,
    setCurrentUser,
    submitReview,
    reviseSubmission,
    policies,
  } = useBrandGuard();

  const [selectedSubId, setSelectedSubId] = useState<string>(
    submissions[0]?.id || ''
  );
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [reviewComments, setReviewComments] = useState<string>('');
  const [editingContent, setEditingContent] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const selectedSubmission =
    submissions.find((s) => s.id === selectedSubId) || submissions[0];

  const filteredSubmissions = submissions.filter((s) => {
    if (filterStatus === 'all') return true;
    return s.status === filterStatus;
  });

  const getStatusBadge = (status: ReviewWorkflowStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle className="w-3.5 h-3.5" /> Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
      case 'changes_requested':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" /> Changes Requested
          </span>
        );
      case 'pending_review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 animate-pulse">
            <Clock className="w-3.5 h-3.5" /> Pending Review
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-500/15 text-slate-400 border border-slate-500/30">
            Draft
          </span>
        );
    }
  };

  const handleReviewAction = async (decision: 'approved' | 'rejected' | 'changes_requested') => {
    if (!selectedSubmission) return;
    if (!reviewComments.trim()) {
      setErrorMessage('Please provide review comments or rationale before making a decision.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await submitReview(selectedSubmission.id, decision, reviewComments);
      setReviewComments('');
      setActionSuccess(`Decision "${decision.replace('_', ' ')}" recorded successfully.`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Review action failed';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveRevision = async () => {
    if (!selectedSubmission || !editingContent.trim()) return;
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await reviseSubmission(selectedSubmission.id, editingContent);
      setIsEditing(false);
      setActionSuccess('New revision submitted for compliance review.');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Revision submission failed';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Role Notice */}
      <div className="glass-panel rounded-2xl p-5 border border-white/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Governance Workflow
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
              <span className="text-xs text-slate-400">Human-In-The-Loop Clearance</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
              <ClipboardCheck className="w-6 h-6 text-indigo-400" />
              Content Reviews & Governance Approvals
            </h1>
            <p className="text-sm text-slate-300 mt-0.5">
              Multi-stakeholder sign-off. Creators submit campaigns and revisions; authorized reviewers inspect findings, leave comments, and grant approval.
            </p>
          </div>

          {/* Quick Role Toggle Bar for Demonstration */}
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-white/10 flex items-center gap-3">
            <div className="text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Acting As</span>
              <span className="font-semibold text-white flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                {currentUser.name}
              </span>
            </div>
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/5">
              <button
                onClick={() => setCurrentUser(DEMO_USERS.creator)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  currentUser.role === 'creator'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Creator Role
              </button>
              <button
                onClick={() => setCurrentUser(DEMO_USERS.reviewer)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  currentUser.role === 'reviewer'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Reviewer Role
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Notification */}
      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2 animate-shake">
          <AlertOctagon className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Grid: Submissions List (Left 4 cols) & Submission Detail/Review (Right 8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Submissions Queue */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Submissions Queue ({filteredSubmissions.length})
            </span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs rounded-lg bg-slate-900 border border-white/10 px-2 py-1 text-slate-300 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="pending_review">Pending Review</option>
              <option value="changes_requested">Changes Requested</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="space-y-2.5">
            {filteredSubmissions.map((sub) => {
              const isSelected = selectedSubmission?.id === sub.id;
              const policyName = policies[sub.policyId]?.name || sub.policyId;

              return (
                <div
                  key={sub.id}
                  onClick={() => {
                    setSelectedSubId(sub.id);
                    setIsEditing(false);
                    setErrorMessage(null);
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-500/10'
                      : 'bg-slate-900/40 border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-white truncate">{sub.title}</span>
                    {getStatusBadge(sub.status)}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                    <span>{policyName}</span>
                    <span className="font-mono">v{sub.version}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                    <span>By {sub.creatorName.split(' ')[0]}</span>
                    {sub.scanResult && (
                      <span className="font-semibold text-slate-300">
                        Score: {sub.scanResult.overallScore}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Review & Detail Panel */}
        <div className="lg:col-span-8">
          {selectedSubmission ? (
            <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-6">
              {/* Submission Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedSubmission.status)}
                    <span className="text-xs text-slate-400 font-mono">
                      Revision v{selectedSubmission.version}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white mt-1">
                    {selectedSubmission.title}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Policy: {policies[selectedSubmission.policyId]?.name || selectedSubmission.policyId} · Submitted by {selectedSubmission.creatorName}
                  </p>
                </div>

                {selectedSubmission.scanResult && (
                  <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2 rounded-xl border border-white/5">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Safety Score</span>
                      <span className="font-mono text-base font-bold text-emerald-400">
                        {selectedSubmission.scanResult.overallScore}/100
                      </span>
                    </div>
                    <div className="text-right border-l border-white/10 pl-3">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Violations</span>
                      <span className="font-mono text-base font-bold text-amber-400">
                        {selectedSubmission.scanResult.violations.length}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Content Body & Creator Revision Mode */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Submitted Copy Content
                  </span>
                  {!isEditing && (
                    <button
                      onClick={() => {
                        setEditingContent(selectedSubmission.content);
                        setIsEditing(true);
                      }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1.5"
                    >
                      <FileEdit className="w-3.5 h-3.5" />
                      Submit New Revision
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-3 p-4 rounded-xl bg-slate-950/80 border border-indigo-500/30">
                    <span className="text-xs text-indigo-300 font-semibold block">
                      Editing New Version (will create Revision v{selectedSubmission.version + 1}):
                    </span>
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      rows={6}
                      className="w-full p-3 bg-slate-900 rounded-lg border border-white/10 text-slate-100 text-xs font-mono leading-relaxed focus:outline-none focus:border-indigo-500"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-white/5"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveRevision}
                        disabled={isSubmitting}
                        className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Submit Revision v{selectedSubmission.version + 1}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-white/5 text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {selectedSubmission.content}
                  </div>
                )}
              </div>

              {/* Reviewer Action Desk (Authorized Reviewers Only) */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-indigo-500/25 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Reviewer Decision & Sign-Off Desk
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Authorized Human Oversight
                  </span>
                </div>

                <div className="space-y-2">
                  <label htmlFor="review-comments" className="text-xs text-slate-300 font-medium">
                    Reviewer Notes / Compliance Feedback:
                  </label>
                  <textarea
                    id="review-comments"
                    value={reviewComments}
                    onChange={(e) => setReviewComments(e.target.value)}
                    placeholder="Enter compliance feedback, disclaimer verification, or requirements for the creator..."
                    rows={3}
                    className="w-full p-3 rounded-xl bg-slate-950/90 border border-white/10 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <p className="text-[11px] text-slate-400 italic">
                    * Content score alone never grants approval. An authorized compliance reviewer decision is legally required.
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReviewAction('changes_requested')}
                      disabled={isSubmitting}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Request Changes
                    </button>
                    <button
                      onClick={() => handleReviewAction('rejected')}
                      disabled={isSubmitting}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject Content
                    </button>
                    <button
                      onClick={() => handleReviewAction('approved')}
                      disabled={isSubmitting}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Approve for Broadcast
                    </button>
                  </div>
                </div>
              </div>

              {/* Review History Trail */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <History className="w-3.5 h-3.5" />
                  Review Decision History ({selectedSubmission.reviews.length})
                </div>

                {selectedSubmission.reviews.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-3 bg-slate-950/40 rounded-xl">
                    No decisions recorded yet. Content is pending initial review.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedSubmission.reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-3.5 rounded-xl bg-slate-950/70 border border-white/5 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getStatusBadge(rev.status)}
                            <span className="font-semibold text-slate-200">{rev.reviewerName}</span>
                            <span className="text-slate-500 text-[10px]">({rev.reviewerRole})</span>
                          </div>
                          <span className="text-slate-500 text-[10px] font-mono">
                            Revision v{rev.revisionVersion} · {new Date(rev.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-slate-300 pl-2 border-l border-white/10 font-sans mt-1">
                          {rev.comments}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-12 text-center text-slate-400">
              Select a submission from the queue to view details and review.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
