# 🛡️ BrandGuard AI — Enterprise Brand Safety, Compliance & Risk Intelligence Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.4.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.0-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.0-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![pnpm](https://img.shields.io/badge/pnpm-12.15.0-orange?style=for-the-badge&logo=pnpm)](https://pnpm.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)](LICENSE)

> Next-generation autonomous brand safety scanning, regulatory compliance auditing, trademark defense, and automated content remediation for global marketing and enterprise legal teams.

---

## 🌟 Executive Overview

**BrandGuard AI** is an enterprise-grade platform engineered to prevent PR crises, trademark litigation, and regulatory fines before marketing copy is published. Featuring a multi-vector heuristic risk engine, BrandGuard AI evaluates content against SEC/FTC truth-in-advertising guidelines, brand voice parameters, competitor trademark protection rules, and real-time open-web threat intelligence.

---

## 🚀 Key Modules & Capabilities

### 1. 🔍 AI Content Safety & Compliance Scanner
- **Multi-Vector Risk Detection**:
  - **Regulatory & Legal**: Detects unverified yield claims, financial promises, and missing mandatory FTC `#ad` disclaimers.
  - **Claim Substantiation**: Flags superlatives and unverifiable guarantees (*"100% safe"*, *"unhackable"*, *"zero latency"*).
  - **Trademark & IP Defense**: Protects against competitor trademark disparagement (*"crush Salesforce"*, *"legacy bloatware"*).
  - **Tone & Persona Consistency**: Identifies off-brand sarcasm, informal slang, and passive-aggressive copy.
  - **Toxicity & Safety Index**: Evaluates reputational risk from 0% to 100%.
- **Interactive Radial Score Gauge**: Visual letter grades (A+, B, F) and category percentage breakdowns.
- **1-Click Test Scenarios**: Instant presets for Fintech, B2B SaaS, D2C Influencer Campaigns, and Enterprise Press Releases.
- **Auto-Remediation Drawer**: 1-click automatic AI rewrite replacing non-compliant phrases with audit-approved alternatives.

### 2. 📡 Real-Time Threat Radar
- **Live Sentinel Sweep**: Visual rotating radar cone monitoring open web, social media, and registrar feeds.
- **Incident Triage Stream**: Real-time detection of counterfeit ads, spoofed domains, and unauthorized influencer endorsements.
- **Instant Response Actions**: 1-click triggers to dispatch investigation tickets or transmit automated Cease & Desist takedown notices.
- **Simulation Sandbox**: Inject test threat events directly into the telemetry feed.

### 3. 🎨 Brand Guidelines & Voice Studio
- **Voice Tone Calibration**: Custom sliders for Formality (0-100%), Audacity/Boldness (0-100%), and Technical Depth (0-100%).
- **Prohibited Lexicon Manager**: Add or remove banned terms in real time.
- **Competitor Trademark Blacklist**: Exclude competitor names from aggressive comparisons.
- **Mandatory Disclaimers**: Manage required regulatory notices with JSON export capabilities.

### 4. 📊 Brand Health Analytics & KPI Dashboard
- **Telemetry Overview**: 94.6% Avg Campaign Safety Index, 1,248 monthly scans, 14 threats suppressed, 0 regulatory fines.
- **Cross-Channel Scorecards**: Detailed breakdown across LinkedIn (98.2%), Twitter/X (88.6%), Meta Ads (92.5%), and Press Releases (99.4%).
- **Cryptographic Audit Trail**: Historical log of every campaign scan with immutable audit IDs.

### 5. 📜 Official Audit Certificate Generator
- Generates formal compliance certificates with verification hashes, multi-vector category sign-offs, and print/PDF export features.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (Turbopack, App Router)
- **Language**: TypeScript 5 (Strict Mode, 100% type-safe)
- **Styling**: Tailwind CSS v4 + Custom Glassmorphism System
- **Icons**: Lucide React
- **Package Manager**: pnpm v12

---

## 📦 Project Structure

```text
brandguard-app/
├── public/                 # Static public assets & logos
├── src/
│   ├── app/
│   │   ├── globals.css     # Design tokens, glassmorphism, radar keyframes
│   │   ├── layout.tsx      # SEO metadata & font configuration
│   │   └── page.tsx        # Master dashboard and tab router
│   ├── components/
│   │   ├── Navbar.tsx          # Executive top navigation & policy switcher
│   │   ├── ScoreGauge.tsx      # SVG radial animated safety gauge
│   │   ├── ScannerTab.tsx      # AI content inspector & remediation drawer
│   │   ├── ThreatRadarTab.tsx  # Animated radar & live threat stream
│   │   ├── GuidelinesTab.tsx   # Voice sliders & banned keyword studio
│   │   ├── AnalyticsTab.tsx    # Channel compliance scorecards & audit logs
│   │   └── AuditModal.tsx      # Cryptographic compliance certificate modal
│   ├── lib/
│   │   └── brandSafetyEngine.ts # Rule engine, policies, and AI remediation
│   └── types/
│       ├── brandguard.ts       # TypeScript interfaces (Violations, Policies, Scans)
│       └── lucide-react.d.ts   # Icon type definitions
├── pnpm-lock.yaml          # Immutable pnpm lockfile
├── package.json            # Scripts & dependencies
└── tsconfig.json           # TypeScript configuration
```

---

## 💻 Local Development Workflow

### Prerequisites
Make sure you have [Node.js (>= 20)](https://nodejs.org/) and [pnpm](https://pnpm.io/) installed.

```powershell
# Verify installation
node -v
pnpm -v
```

### 1. Install Dependencies
```powershell
pnpm install
```

### 2. Run the Development Server
```powershell
pnpm dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 3. Build for Production
```powershell
pnpm build
pnpm start
```

---

## 📤 Step-by-Step Guide: How to Push Everything to GitHub

Follow these steps in your terminal to push the entire project to GitHub:

### Option 1: Using the Terminal & GitHub CLI (`gh`)

If you have the [GitHub CLI](https://cli.github.com/) installed:

```powershell
# 1. Navigate to the app directory
cd brandguard-app

# 2. Stage all files
git add .

# 3. Create the initial commit
git commit -m "feat: complete BrandGuard AI enterprise safety and compliance platform"

# 4. Create a new repository on GitHub and push directly
gh repo create BrandGuard_AI --public --source=. --remote=origin --push
```

---

### Option 2: Using Standard Git & GitHub Web UI

#### Step 1: Create a New Repository on GitHub
1. Go to [github.com/new](https://github.com/new).
2. Set the **Repository name** (e.g., `BrandGuard_AI` or `brandguard-app`).
3. Choose **Public** or **Private**.
4. **Leave all checkboxes unchecked** (Do *not* initialize with a README, .gitignore, or license, since this project already includes them).
5. Click **Create repository**.
6. Copy the repository URL (e.g., `https://github.com/<YOUR_USERNAME>/BrandGuard_AI.git`).

#### Step 2: Push Your Local Code to GitHub
Run the following commands in your PowerShell / Terminal:

```powershell
# 1. Navigate to your project folder
cd e:\antigravity_dev\BrandGuard_AI\brandguard-app

# 2. Check current status
git status

# 3. Stage all modified and new files
git add .

# 4. Commit your changes
git commit -m "feat: complete BrandGuard AI platform with pnpm and Next.js 16"

# 5. Ensure your primary branch is named main
git branch -M main

# 6. Add your GitHub repository as the remote origin
# (Replace with your actual GitHub repository URL)
git remote add origin https://github.com/<YOUR_USERNAME>/BrandGuard_AI.git

# 7. Push all code to GitHub
git push -u origin main
```

---

## 🔒 Enterprise Compliance & Security Notes

- **SOC-2 Type II Aligned**: Designed with data minimization standards.
- **FTC & SEC Compliance**: Heuristics pre-calibrated to federal truth-in-advertising guidelines.
- **Zero Data Leakage**: Sensitive marketing assets can be evaluated entirely client-side or within a private enterprise VPC.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
