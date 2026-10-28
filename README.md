# 🛡️ BrandGuard AI — Enterprise Brand Safety, Compliance & Governance Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.4.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.0-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.0-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![pnpm](https://img.shields.io/badge/pnpm-12.15.0-orange?style=for-the-badge&logo=pnpm)](https://pnpm.io/)
[![Vitest](https://img.shields.io/badge/Vitest-5.0.5-729B1B?style=for-the-badge&logo=vitest)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)](LICENSE)

> Next-generation brand governance, truth-in-advertising auditing, trademark defense, explainable AI remediation, and human-in-the-loop review workflow for marketing and enterprise legal teams.

---

## 🌟 Executive Overview

**BrandGuard AI** is a brand-governance and regulatory risk intelligence platform engineered to prevent PR crises, trademark litigation, and regulatory fines before copy is published.

Featuring a heuristic risk engine and human-in-the-loop sign-off workflow, BrandGuard AI evaluates content against SEC/FTC truth-in-advertising standards, brand voice parameters, competitor trademark protection rules, and mandatory disclaimers.

---

## 🚀 Key Modules & Capabilities

### 1. 🔍 Explainable AI Content Safety & Compliance Scanner
- **Multi-Vector Risk Detection**:
  - **Regulatory & Legal**: Detects unverified yield claims, financial promises, and missing mandatory FTC `#ad` disclaimers.
  - **Claim Substantiation**: Flags superlatives and unverifiable guarantees (*"100% safe"*, *"unhackable"*, *"zero latency"*).
  - **Trademark & IP Defense**: Protects against competitor trademark disparagement (*"crush Salesforce"*, *"legacy bloatware"*).
  - **Tone & Persona Consistency**: Identifies off-brand sarcasm, informal slang, and passive-aggressive copy based on calibrated sliders.
- **Explainable Findings**:
  - Exact problematic phrase with character-accurate text coordinates (`startIndex`, `endIndex`).
  - Regulatory or policy explanation and rule violation reference.
  - Category severity and confidence rating.
  - Suggested compliant replacement preserving original intent.
- **Interactive Correction Workflow**:
  - **Accept**: 1-click replacement by exact text range without index drift or unintentional replacement of duplicate phrases.
  - **Dismiss / Reject**: Acknowledge and dismiss findings.
  - **Undo**: History stack enabling step-by-step undos.
  - **Compare**: Side-by-side comparison between original draft baseline and current revised text.
  - **Submit for Review**: 1-click submission directly from scanner into the governance review queue.
- **Dynamic Policy Responsiveness**: Changes to prohibited lexicons, restricted claims, tone thresholds, or disclaimers immediately re-evaluate content on subsequent scans.
- **Empty State Protection**: Empty and whitespace-only text returns a clear `not_scanned` status (score 0); empty content is never marked as approved.

### 2. 👥 Human-In-The-Loop Approval Workflow
- **Role-Based Governance**:
  - **Creator**: Drafts content, analyzes safety score, applies fixes, and submits new revisions (`v1, v2, ...`).
  - **Reviewer / Compliance Officer**: Inspects findings, evaluates content revisions, leaves comments, and decides (`approved`, `rejected`, `changes_requested`).
- **Server-Enforced Permissions**:
  - Approval decisions strictly require an authorized human reviewer (`reviewer` or `admin` role). Content score alone never grants automatic approval.
  - Creator role attempting to self-approve is blocked by server authorization (`HTTP 403 Forbidden`).
- **Audit History & Feedback**: Full decision log recording reviewer, timestamp, decision, revision number, and compliance notes.
- **Role Switcher**: Built-in switcher in the navigation sidebar allows testing both creator and reviewer perspectives during live hackathon demos.

### 3. 💾 Resilient Dual-Storage Architecture (Supabase + Local Demo)
- **Supabase PostgreSQL & Auth Ready**:
  - Dedicated PostgreSQL migrations with Row-Level Security (RLS) policies.
  - Tables: `profiles`, `brand_policies`, `content_scans`, `scan_violations`, `content_submissions`, `reviews`, `audit_events`.
- **Zero-Crash Local Fallback**:
  - When Supabase environment variables are omitted, BrandGuard AI seamlessly runs in resilient Local Demo Storage mode (`localStorage` + in-memory store).
  - Page refreshes preserve custom policy additions, scanner drafts, submissions, reviews, and audit events.

### 4. 📜 Cryptographic Audit Certificate Generator
- **Real SHA-256 Payload Hash**: Computes an integrity fingerprint using the Web Crypto API across the scan payload (content, active policy, overall score, verdict, and findings).
- **Honest Verification Qualifications**: Clearly explains verification boundaries (local payload integrity verification vs. external notarization).
- **Real CSV Export**: Generates and downloads standard CSV audit logs from recorded workflow events.

### 5. 📡 Simulated Threat Radar Sandbox
- **Incident Stream Simulation**: Demonstrates automated counterfeit ad detection, typosquatted domain probes, and unauthorized influencer endorsements.
- **Explicit Sandbox Labeling**: Honestly labeled as a simulated telemetry sandbox with test injection controls.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (Turbopack, App Router)
- **Language**: TypeScript 5 (Strict Mode, 100% type-safe)
- **Styling**: Tailwind CSS v4 + Glassmorphism Design System
- **Icons**: Lucide React
- **Database / Auth**: Supabase PostgreSQL + Row-Level Security (RLS)
- **Testing**: Vitest 5
- **Package Manager**: pnpm v12

---

## 📦 Project Structure

```text
BrandGuard_AI/
├── public/                 # Static public assets
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql # PostgreSQL schema, tables, and RLS policies
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── scan/route.ts                 # Server-side scan endpoint
│   │   │   └── workflow/
│   │   │       ├── submissions/route.ts      # Creator submissions API
│   │   │       ├── reviews/route.ts          # Server-enforced reviewer API
│   │   │       └── audit-events/route.ts     # Live audit events API
│   │   ├── approvals/page.tsx                # Reviews & approvals workflow screen
│   │   ├── scanner/page.tsx                  # AI content safety scanner
│   │   ├── brand-guidelines/page.tsx         # Guidelines & tone calibration studio
│   │   ├── analytics/page.tsx                # Health analytics & real CSV export
│   │   ├── audit-reports/page.tsx            # Compliance certificates & verification
│   │   ├── threat-radar/page.tsx             # Simulated threat radar sandbox
│   │   ├── settings/page.tsx                 # Engine parameters & standards
│   │   ├── globals.css                       # Design tokens & glassmorphism
│   │   ├── layout.tsx                        # Master layout & BrandGuardProvider
│   │   └── page.tsx                          # App redirect
│   ├── components/
│   │   ├── ApprovalsView.tsx                 # Human-in-the-loop approval desk
│   │   ├── ScannerTab.tsx                    # Explainable scanner & diff comparator
│   │   ├── GuidelinesTab.tsx                 # Voice sliders & banned keyword studio
│   │   ├── AnalyticsTab.tsx                  # Real CSV exporter & event history
│   │   ├── AuditModal.tsx                    # Dynamic SHA-256 certificate modal
│   │   ├── ScoreGauge.tsx                    # SVG safety score radial gauge
│   │   └── Sidebar.tsx                       # Navigation & active role switcher
│   ├── context/
│   │   └── BrandGuardContext.tsx             # Central state & persistent store
│   ├── lib/
│   │   ├── brandSafetyEngine.ts              # Boundary regex, heuristics, and scoring
│   │   ├── workflowStore.ts                  # Server permissions & submission management
│   │   ├── supabase.ts                       # Client-side Supabase helper
│   │   ├── supabaseServer.ts                 # Server-side Supabase client
│   │   └── __tests__/
│   │       ├── brandSafetyEngine.test.ts     # Engine unit tests (18 tests)
│   │       └── workflow.test.ts              # Workflow & permissions tests (10 tests)
│   └── types/
│       └── brandguard.ts                     # TypeScript interfaces & domain models
├── .env.example            # Environment variables template
├── package.json            # Scripts & dependencies
└── tsconfig.json           # TypeScript configuration
```

---

## 💻 Setup & Development Instructions

### Prerequisites
Make sure you have [Node.js (>= 20)](https://nodejs.org/) and [pnpm](https://pnpm.io/) installed:
```powershell
node -v
pnpm -v
```

### 1. Install Dependencies
```powershell
pnpm install
```

### 2. Environment Configuration (Optional for Supabase)
Copy the `.env.example` file to `.env.local`:
```powershell
cp .env.example .env.local
```
Fill in your Supabase credentials (found in Supabase Project Settings -> API):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```
> **Note**: If you do not configure Supabase, BrandGuard AI automatically activates **Demo Storage Mode** via local persistence. The application works out-of-the-box without requiring a database setup.

### 3. Database Migration (If Using Supabase)
In your Supabase project dashboard, open the **SQL Editor** and execute the migration script located at:
```text
supabase/migrations/001_initial_schema.sql
```
This provisions:
- `profiles` with role-based check constraints (`creator`, `reviewer`, `admin`)
- `brand_policies` for rulebooks and tone settings
- `content_scans` and `scan_violations`
- `content_submissions` and `reviews`
- `audit_events` with Row-Level Security (RLS) policies

### 4. Run the Development Server
```powershell
pnpm dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 5. Run Automated Tests
```powershell
pnpm test
```
Runs the Vitest suite covering empty content, clean content, prohibited terms, regex boundaries, disclaimers, repeated phrases, scoring, server permissions, and database fallback.

### 6. Run Linter
```powershell
pnpm lint
```

### 7. Production Build
```powershell
pnpm build
pnpm start
```

---

## 🔒 Scoring, Status & Compliance Documentation

### Scoring Formula
The Safety Index (0–100) is calculated from four weighted category vectors:
$$\text{Score} = (\text{Legal} \times 0.35) + (\text{Claims} \times 0.25) + (\text{Trademark} \times 0.20) + (\text{Tone} \times 0.20)$$

- **Starting Base Score**: 100 points per category.
- **Penalty Deductions**:
  - Critical Violation: `-35` points per occurrence
  - Advisory Warning: `-15` points per occurrence
  - Informational Notice: `-5` points per occurrence
- **Scan Status Thresholds**:
  - `not_scanned`: Empty or whitespace-only content (Score = 0).
  - `rejected`: Any Critical violation or Overall Score `< 70`.
  - `review_required`: Any Warning violation or Overall Score `< 85`.
  - `approved` (Checks Passed): Zero Critical/Warning violations and Score `≥ 85`.
- **Human Approval Rule**: Content score alone never marks workflow approval; an authorized human reviewer decision is mandatory.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
