'use client';

import React from 'react';
import { ShieldCheck, AlertTriangle, XCircle, Award } from 'lucide-react';

interface ScoreGaugeProps {
  score: number;
  status: 'approved' | 'review_required' | 'rejected';
  size?: number;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, status, size = 180 }) => {
  const radius = 68;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  let colorGradient = 'from-emerald-400 to-teal-500';
  let strokeColor = '#10b981';
  let grade = 'A+';
  let badgeLabel = 'Compliant';
  let badgeBg = 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400';
  let Icon = ShieldCheck;

  if (score < 70 || status === 'rejected') {
    colorGradient = 'from-rose-500 to-red-600';
    strokeColor = '#f43f5e';
    grade = 'F';
    badgeLabel = 'Critical Risk';
    badgeBg = 'bg-rose-500/15 border-rose-500/30 text-rose-400';
    Icon = XCircle;
  } else if (score < 85 || status === 'review_required') {
    colorGradient = 'from-amber-400 to-orange-500';
    strokeColor = '#f59e0b';
    grade = 'B';
    badgeLabel = 'Advisory Warning';
    badgeBg = 'bg-amber-500/15 border-amber-500/30 text-amber-400';
    Icon = AlertTriangle;
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        {/* Glow backdrop */}
        <div
          className="absolute inset-4 rounded-full blur-2xl opacity-20 pointer-events-none"
          style={{ backgroundColor: strokeColor }}
        />

        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
          {/* Background circle track */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Animated score circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center content */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-black tracking-tight text-white">{score}</span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">/ 100 Safety</span>
          <div className="flex items-center gap-1 mt-1">
            <Award className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs font-bold text-indigo-300">Grade {grade}</span>
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className={`mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${badgeBg}`}>
        <Icon className="w-3.5 h-3.5" />
        <span>{badgeLabel}</span>
      </div>
    </div>
  );
};
