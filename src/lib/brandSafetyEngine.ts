import { BrandPolicy, PresetSample, ScanResult, ThreatMention, Violation } from '../types/brandguard';

export const DEFAULT_POLICIES: Record<string, BrandPolicy> = {
  fintech: {
    id: 'fintech',
    name: 'Fintech & Wealth Security',
    industry: 'Financial Services',
    tone: { formality: 85, boldness: 40, technicality: 70 },
    prohibitedTerms: ['guaranteed profit', 'zero risk', 'can’t lose', 'get rich quick', 'insider alpha', 'moonshot'],
    mandatoryDisclaimers: ['Past performance is not indicative of future returns. Terms apply.', 'Capital at risk. Authorized by the FCA/SEC.'],
    competitorExclusions: ['Revolut', 'Robinhood', 'Stripe', 'Coinbase'],
    restrictedClaims: ['100% safe', 'risk-free', 'unlimited yield'],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise B2B Cloud & AI',
    industry: 'Enterprise Software',
    tone: { formality: 75, boldness: 65, technicality: 80 },
    prohibitedTerms: ['hacks', 'cheap', 'unbreakable security', 'destroy competitors', 'kill Jira', 'crush Salesforce'],
    mandatoryDisclaimers: ['Subject to enterprise SLA and master subscription terms.'],
    competitorExclusions: ['Salesforce', 'Hubspot', 'Workday', 'Microsoft'],
    restrictedClaims: ['zero latency', '100% uptime', 'unhackable'],
  },
  healthcare: {
    id: 'healthcare',
    name: 'Healthcare & Life Sciences',
    industry: 'Health & Wellness',
    tone: { formality: 90, boldness: 30, technicality: 85 },
    prohibitedTerms: ['cure all', 'miracle treatment', 'guaranteed healing', 'FDA fully endorsed', 'doctors hate this'],
    mandatoryDisclaimers: ['These statements have not been evaluated by the FDA. Consult your physician.'],
    competitorExclusions: ['Pfizer', 'Moderna', 'Johnson & Johnson'],
    restrictedClaims: ['eliminates disease', 'instant recovery', 'permanent fix'],
  },
  consumer: {
    id: 'consumer',
    name: 'Consumer Retail & Lifestyle',
    industry: 'Direct-to-Consumer',
    tone: { formality: 45, boldness: 85, technicality: 30 },
    prohibitedTerms: ['counterfeit', 'replica', 'exact knockoff', 'secret hack'],
    mandatoryDisclaimers: ['Includes affiliate links. #ad #sponsored where applicable.'],
    competitorExclusions: ['Nike', 'Adidas', 'Lululemon', 'Zara'],
    restrictedClaims: ['world’s only', 'miracle fabric', 'unlimited warranty without caveat'],
  },
};

export const SAMPLE_PRESETS: PresetSample[] = [
  {
    id: 'crypto_risky',
    title: 'High-Risk Wealth Campaign',
    tag: 'Critical Violations',
    industry: 'Fintech',
    description: 'Promotional social copy making unauthorized yield promises with missing regulatory disclaimers.',
    text: `🚀 Want guaranteed profit without stress? Our new automated algorithmic hedge vault delivers 100% safe returns of 25% APY! 

Forget traditional banks like Robinhood and Revolut who steal your gains. This system never loses money and gives you insider alpha today. Sign up immediately before this secret loophole gets closed! No KYC needed, pure risk-free yield.`,
  },
  {
    id: 'b2b_competitor_slam',
    title: 'Aggressive B2B Ad Copy',
    tag: 'Tone & Trademark Warning',
    industry: 'Enterprise Software',
    description: 'SaaS marketing draft that directly bashes competitor trademarks and makes unrealistic SLA uptime promises.',
    text: `Why is your team still suffering with Salesforce and Hubspot? Their legacy bloatware is notoriously slow and overly expensive. 

BrandGuard Cloud delivers 100% uptime and unhackable zero-latency infrastructure. We crush Salesforce in speed and will destroy competitors in your pipeline. Don't be an idiot with outdated legacy CRMs—switch now!`,
  },
  {
    id: 'influencer_missing_ad',
    title: 'Influencer Endorsement Caption',
    tag: 'FTC Disclosure Missing',
    industry: 'Consumer D2C',
    description: 'Social post featuring paid product placement without required FTC #ad disclosure and dubious claims.',
    text: `Obsessed with this miracle glow serum! Honestly it gives you instant recovery from skin fatigue and is the world’s only serum that permanently eliminates blemishes overnight. 

Use my code VIP20 at checkout for 20% off. You need this in your morning routine right now!`,
  },
  {
    id: 'clean_approved_pr',
    title: 'Compliant Enterprise Press Release',
    tag: 'Compliant (98%)',
    industry: 'Enterprise Cloud',
    description: 'Gold-standard corporate announcement fully aligned with governance guidelines, disclaimers, and executive voice.',
    text: `Aura Technologies announces the general availability of Aura Core 3.0, engineered to assist modern organizations with continuous data governance. 

According to internal benchmark testing conducted in Q3, customer environments observed an average 38% improvement in query latency. "Our objective has always been to empower data engineering teams with scalable, verified tools," said Marcus Vance, Chief Information Officer. 

Subject to enterprise SLA and master subscription terms. For complete technical documentation and security whitepapers, please visit the official customer portal.`,
  },
];

export const MOCK_THREATS: ThreatMention[] = [
  {
    id: 'thm-101',
    source: 'Twitter/X',
    author: 'CryptoAlertBot',
    handle: '@crypto_scam_watch',
    timestamp: '3m ago',
    content: 'Fake giveaway ad spotted using @BrandGuard logo and altered executive photo linking to brandguard-airdrop[.]vip domain.',
    threatLevel: 'high',
    type: 'Counterfeit Ad',
    sentimentScore: -0.85,
    status: 'unresolved',
    reachEstimated: '48.5K impressions',
  },
  {
    id: 'thm-102',
    source: 'Web Domain',
    author: 'DomainRegistrar Monitor',
    handle: 'whois-watchdog',
    timestamp: '18m ago',
    content: 'Newly registered typosquatting domain: brandguard-support-login.com registered via offshore bulletproof host.',
    threatLevel: 'high',
    type: 'Spoofed Domain',
    sentimentScore: -0.72,
    status: 'investigating',
    reachEstimated: 'Active DNS probe',
  },
  {
    id: 'thm-103',
    source: 'Reddit',
    author: 'tech_critic_99',
    handle: 'r/softwaregore',
    timestamp: '42m ago',
    content: 'Unapproved marketing rep claims BrandGuard software has zero latency and is 100% unhackable. Is this FTC compliant?',
    threatLevel: 'medium',
    type: 'Trademark Misuse',
    sentimentScore: -0.45,
    status: 'investigating',
    reachEstimated: '14.2K upvotes',
  },
  {
    id: 'thm-104',
    source: 'TikTok',
    author: 'lifestyle_lexi',
    handle: '@lexi_deals',
    timestamp: '2h ago',
    content: 'Paid video sponsorship promoting product line without mandatory #ad or #sponsored tags in caption or audio.',
    threatLevel: 'medium',
    type: 'Unauthorized Endorsement',
    sentimentScore: 0.15,
    status: 'unresolved',
    reachEstimated: '112.4K views',
  },
  {
    id: 'thm-105',
    source: 'Press',
    author: 'Global Tech Wire',
    handle: '@globaltechwire',
    timestamp: '4h ago',
    content: 'Industry safety benchmark rates BrandGuard AI as top enterprise compliance solution with 99.4% precision index.',
    threatLevel: 'low',
    type: 'PR Crisis / Sentiment',
    sentimentScore: 0.92,
    status: 'mitigated',
    reachEstimated: '230K readers',
  },
];

interface RulePattern {
  category: Violation['category'];
  severity: Violation['severity'];
  pattern: RegExp;
  title: string;
  explanation: string;
  ruleViolated: string;
  replacementGenerator: (matched: string) => string;
}

const SAFETY_RULES: RulePattern[] = [
  // Legal & Regulatory
  {
    category: 'legal',
    severity: 'critical',
    pattern: /\b(guaranteed profit|guaranteed returns|can't lose|can’t lose|get rich quick)\b/gi,
    title: 'Prohibited Financial Promise',
    explanation: 'Regulatory bodies (SEC/FTC/FCA) strictly penalize unconditional profitability claims.',
    ruleViolated: 'SEC Rule 156 / FTC Truth in Advertising',
    replacementGenerator: () => 'target growth opportunities',
  },
  {
    category: 'legal',
    severity: 'critical',
    pattern: /\b(no kyc needed|secret loophole|insider alpha)\b/gi,
    title: 'Compliance & AML Evasion Risk',
    explanation: 'Suggesting circumvention of KYC, AML laws, or insider advantage triggers severe regulatory sanctions.',
    ruleViolated: 'AML/BSA FinCEN Compliance Guidelines',
    replacementGenerator: () => 'fully verified compliance protocols',
  },
  {
    category: 'legal',
    severity: 'warning',
    pattern: /\b(miracle treatment|cure all|permanently eliminates|eliminates disease)\b/gi,
    title: 'Unsubstantiated Health Claim',
    explanation: 'Health, wellness, and medical product claims must be backed by peer-reviewed FDA documentation.',
    ruleViolated: 'FDA Section 201(p) / FTC Health Standards',
    replacementGenerator: () => 'supports visible skin vitality',
  },
  // Exaggerated Claims
  {
    category: 'claim',
    severity: 'critical',
    pattern: /\b(100% safe|risk-free|100% uptime|zero risk|never loses money)\b/gi,
    title: 'Absolute Guarantee Without Caveat',
    explanation: 'Absolute claims like "100% safe" or "zero risk" create legal liability in both financial and technology products.',
    ruleViolated: 'Enterprise SLA & Consumer Protection Act',
    replacementGenerator: () => 'robust, risk-managed infrastructure',
  },
  {
    category: 'claim',
    severity: 'warning',
    pattern: /\b(unhackable|zero latency|world's only|world’s only)\b/gi,
    title: 'Unverifiable Technical Superlative',
    explanation: 'Claims of being "unhackable" or "zero latency" are technically indefensible and expose the brand to false advertising claims.',
    ruleViolated: 'Substantiation of Technical Performance Standard',
    replacementGenerator: () => 'industry-grade multi-layer security',
  },
  // Trademark & Competitor
  {
    category: 'trademark',
    severity: 'warning',
    pattern: /\b(crush (?:salesforce|hubspot|workday)|destroy competitors|kill (?:jira|slack)|legacy bloatware)\b/gi,
    title: 'Aggressive Trademark Disparagement',
    explanation: 'Directly denigrating registered competitor trademarks by name violates brand safety codes and risks tortious interference claims.',
    ruleViolated: 'Fair Use & Comparative Advertising Guidelines',
    replacementGenerator: () => 'streamline workflows beyond legacy alternatives',
  },
  {
    category: 'trademark',
    severity: 'info',
    pattern: /\b(salesforce|hubspot|revolut|robinhood|workday)\b/gi,
    title: 'Mention of Competitor Registered Trademark',
    explanation: 'Competitor trademark used without trademark symbol (®) or fair comparative disclosure.',
    ruleViolated: 'Brand Asset & Third-Party Trademark Guidelines',
    replacementGenerator: (match) => `${match}® (where applicable)`,
  },
  // Tone & Toxicity
  {
    category: 'tone',
    severity: 'warning',
    pattern: /\b(don't be an idiot|don’t be an idiot|steal your gains|stupid)\b/gi,
    title: 'Unprofessional / Insulting Tone',
    explanation: 'Derogatory phrasing damages enterprise brand reputation and executive audience trust.',
    ruleViolated: 'Corporate Voice & Brand Persona Standard',
    replacementGenerator: () => 'empower your decision-making with modern technology',
  },
  {
    category: 'tone',
    severity: 'warning',
    pattern: /\b(moonshot|hacks|secret loophole)\b/gi,
    title: 'Informal / Speculative Slang',
    explanation: 'Colloquial hype language undermines credibility and trust in enterprise communications.',
    ruleViolated: 'Brand Voice Elevation Standards',
    replacementGenerator: () => 'strategic optimization',
  },
];

export function analyzeBrandContent(text: string, policy: BrandPolicy): ScanResult {
  const violations: Violation[] = [];
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const readingTimeSeconds = Math.max(3, Math.ceil((wordCount / 200) * 60));

  if (!text.trim()) {
    return {
      overallScore: 100,
      status: 'approved',
      summary: 'No text provided for analysis.',
      scannedAt: 'Ready for scan',
      wordCount: 0,
      readingTimeSeconds: 0,
      categories: {
        legal: { name: 'Regulatory & Legal', score: 100, weight: 30, status: 'passed', icon: 'Scale' },
        tone: { name: 'Brand Voice & Tone', score: 100, weight: 20, status: 'passed', icon: 'Sparkles' },
        trademark: { name: 'Trademark & IP', score: 100, weight: 20, status: 'passed', icon: 'ShieldCheck' },
        claims: { name: 'Claim Substantiation', score: 100, weight: 20, status: 'passed', icon: 'CheckCircle' },
        brandSafety: { name: 'Overall Brand Safety', score: 100, weight: 10, status: 'passed', icon: 'Lock' },
      },
      violations: [],
      aiRewrittenText: '',
    };
  }

  let rewrittenText = text;

  // 1. Run Pattern-based Rules
  for (const rule of SAFETY_RULES) {
    const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      const phrase = match[0];
      const startIndex = match.index;
      const endIndex = startIndex + phrase.length;
      const suggestedFix = rule.replacementGenerator(phrase);

      violations.push({
        id: `v-rule-${violations.length}-${startIndex}-${endIndex}`,
        category: rule.category,
        severity: rule.severity,
        phrase,
        startIndex,
        endIndex,
        title: rule.title,
        explanation: rule.explanation,
        suggestedFix,
        ruleViolated: rule.ruleViolated,
      });

      // Apply fix to rewritten text
      rewrittenText = rewrittenText.replace(phrase, suggestedFix);
    }
  }

  // 2. Check policy specific prohibited terms
  policy.prohibitedTerms.forEach((term) => {
    const termRegex = new RegExp(`\\b${term}\\b`, 'gi');
    let m: RegExpExecArray | null;
    while ((m = termRegex.exec(text)) !== null) {
      // Don't add duplicate if already flagged in rules
      const exists = violations.some((v) => v.startIndex === m!.index && v.phrase.toLowerCase() === term.toLowerCase());
      if (!exists) {
        violations.push({
          id: `v-term-${m.index}-${m.index + m[0].length}`,
          category: 'claim',
          severity: 'critical',
          phrase: m[0],
          startIndex: m.index,
          endIndex: m.index + m[0].length,
          title: `Explicitly Prohibited Policy Term: "${m[0]}"`,
          explanation: `This term is banned in the "${policy.name}" brand rulebook to prevent false expectation or compliance fines.`,
          suggestedFix: 'verified outcome',
          ruleViolated: `${policy.name} Policy Section 4.2`,
        });
        rewrittenText = rewrittenText.replace(m[0], 'verified outcome');
      }
    }
  });

  // 3. Check for Mandatory Disclaimers
  const textLower = text.toLowerCase();
  const missingDisclaimers = policy.mandatoryDisclaimers.filter(
    (disclaimer) => !textLower.includes(disclaimer.slice(0, 25).toLowerCase())
  );

  if (missingDisclaimers.length > 0 && wordCount > 25) {
    // Only flag if there are claims that require disclaimer
    const hasClaimsOrFinancial = violations.some((v) => v.category === 'legal' || v.category === 'claim');
    if (hasClaimsOrFinancial) {
      violations.push({
        id: `v-disclaimer-${missingDisclaimers[0].slice(0, 10).replace(/\s+/g, '_')}`,
        category: 'legal',
        severity: 'warning',
        phrase: 'Missing Mandatory Policy Disclaimer',
        startIndex: 0,
        endIndex: 0,
        title: 'Missing Required Legal / Compliance Notice',
        explanation: `Under ${policy.name} regulations, all promotional text must incorporate standard risk notices.`,
        suggestedFix: `Append: "${missingDisclaimers[0]}"`,
        ruleViolated: 'Mandatory Compliance Disclosure Rule',
      });
      rewrittenText = `${rewrittenText.trim()}\n\n*Note: ${missingDisclaimers[0]}*`;
    }
  }

  // Deduplication / Sort violations by appearance in text
  violations.sort((a, b) => a.startIndex - b.startIndex);

  // Category Score Calculations
  const criticalCount = violations.filter((v) => v.severity === 'critical').length;
  const warningCount = violations.filter((v) => v.severity === 'warning').length;
  const infoCount = violations.filter((v) => v.severity === 'info').length;

  const scoreForCategory = (cat: Violation['category']) => {
    const catViolations = violations.filter((v) => v.category === cat);
    const crit = catViolations.filter((v) => v.severity === 'critical').length;
    const warn = catViolations.filter((v) => v.severity === 'warning').length;
    const inf = catViolations.filter((v) => v.severity === 'info').length;

    let deduction = crit * 35 + warn * 15 + inf * 5;
    return Math.max(0, 100 - deduction);
  };

  const legalScore = scoreForCategory('legal');
  const toneScore = scoreForCategory('tone');
  const trademarkScore = scoreForCategory('trademark');
  const claimsScore = scoreForCategory('claim');

  // Overall Score (Weighted)
  const rawOverall =
    legalScore * 0.35 +
    claimsScore * 0.25 +
    trademarkScore * 0.20 +
    toneScore * 0.20;

  const overallScore = Math.max(0, Math.min(100, Math.round(rawOverall)));

  let status: ScanResult['status'] = 'approved';
  if (criticalCount > 0 || overallScore < 70) {
    status = 'rejected';
  } else if (warningCount > 0 || overallScore < 85) {
    status = 'review_required';
  }

  const getStatus = (score: number): 'passed' | 'warning' | 'failed' => {
    if (score >= 85) return 'passed';
    if (score >= 65) return 'warning';
    return 'failed';
  };

  let summary = '';
  if (status === 'approved') {
    summary = `Exemplary brand compliance (${overallScore}/100). Fully aligns with ${policy.name} voice and legal requirements.`;
  } else if (status === 'review_required') {
    summary = `Review Recommended (${overallScore}/100). Found ${warningCount} advisory warning(s) that should be refined prior to campaign broadcast.`;
  } else {
    summary = `Critical Violations Detected (${overallScore}/100). Content violates ${criticalCount} core safety/regulatory standard(s). Automated AI remediation recommended below.`;
  }

  return {
    overallScore,
    status,
    summary,
    scannedAt: 'Active Sentinel Scan',
    wordCount,
    readingTimeSeconds,
    categories: {
      legal: { name: 'Regulatory & Legal', score: legalScore, weight: 35, status: getStatus(legalScore), icon: 'Scale' },
      claims: { name: 'Claim Substantiation', score: claimsScore, weight: 25, status: getStatus(claimsScore), icon: 'CheckCircle' },
      trademark: { name: 'Trademark & IP Defense', score: trademarkScore, weight: 20, status: getStatus(trademarkScore), icon: 'ShieldCheck' },
      tone: { name: 'Brand Voice & Tone', score: toneScore, weight: 20, status: getStatus(toneScore), icon: 'Sparkles' },
      brandSafety: { name: 'Safety & Toxicity Index', score: Math.round((overallScore + legalScore) / 2), weight: 10, status: getStatus(overallScore), icon: 'Lock' },
    },
    violations,
    aiRewrittenText: rewrittenText,
  };
}
