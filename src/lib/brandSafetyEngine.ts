import {
  BrandPolicy,
  PresetSample,
  ScanResult,
  ThreatMention,
  Violation,
  FindingCategory,
} from '../types/brandguard';

/**
 * Escapes special regex characters in user-provided terms.
 */
export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Constructs a boundary-aware regular expression for a search term or phrase.
 * Correctly accounts for terms starting or ending with punctuation or symbols (e.g., "#ad", "100%").
 */
export function buildSafeTermRegex(term: string): RegExp {
  const trimmed = term.trim();
  const escaped = escapeRegExp(trimmed);
  // If term starts with word char, require word boundary or non-word char before it
  const lead = /^\w/.test(trimmed) ? '(?<=^|[^a-zA-Z0-9_])' : '';
  // If term ends with word char, require word boundary or non-word char after it
  const trail = /\w$/.test(trimmed) ? '(?=$|[^a-zA-Z0-9_])' : '';
  return new RegExp(`${lead}${escaped}${trail}`, 'gi');
}

/**
 * Normalizes text for reliable substring matching by collapsing whitespace
 * and normalizing typographic quotes and dashes.
 */
export function normalizeTextForSearch(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

export const DEFAULT_POLICIES: Record<string, BrandPolicy> = {
  fintech: {
    id: 'fintech',
    name: 'Fintech & Wealth Security',
    industry: 'Financial Services',
    tone: { formality: 85, boldness: 40, technicality: 70 },
    prohibitedTerms: ['guaranteed profit', 'zero risk', 'can’t lose', "can't lose", 'get rich quick', 'insider alpha', 'moonshot'],
    mandatoryDisclaimers: [
      'Past performance is not indicative of future returns. Terms apply.',
      'Capital at risk. Authorized by the FCA/SEC.',
    ],
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
    restrictedClaims: ['world’s only', "world's only", 'miracle fabric', 'unlimited warranty without caveat'],
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
    isSimulated: true,
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
    isSimulated: true,
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
    isSimulated: true,
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
    isSimulated: true,
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
    isSimulated: true,
  },
];

interface HeuristicRule {
  category: FindingCategory;
  severity: Violation['severity'];
  pattern: RegExp;
  title: string;
  explanation: string;
  ruleViolated: string;
  isContextual?: boolean;
  confidence?: number;
  replacementGenerator: (matched: string) => string;
}

const GENERAL_SAFETY_RULES: HeuristicRule[] = [
  // Legal & Regulatory Financial
  {
    category: 'legal',
    severity: 'critical',
    pattern: /\b(guaranteed profit|guaranteed returns|can't lose|can’t lose|get rich quick)\b/gi,
    title: 'Prohibited Unconditional Financial Promise',
    explanation: 'Regulatory standard (SEC Rule 156 / FTC Truth in Advertising) prohibits promises of guaranteed investment profitability without risk disclosure.',
    ruleViolated: 'SEC Rule 156 / FTC Truth in Advertising',
    confidence: 0.99,
    replacementGenerator: () => 'target growth opportunities',
  },
  {
    category: 'legal',
    severity: 'critical',
    pattern: /\b(no kyc needed|secret loophole|insider alpha)\b/gi,
    title: 'AML/Regulatory Evasion Language',
    explanation: 'Copy advertising circumvention of Know-Your-Customer (KYC) identity verification or insider advantage creates severe regulatory exposure under FinCEN/BSA guidelines.',
    ruleViolated: 'AML/BSA FinCEN Compliance Guidelines',
    confidence: 0.98,
    replacementGenerator: () => 'verified compliance protocols',
  },
  // Health & Medical Claims
  {
    category: 'legal',
    severity: 'warning',
    pattern: /\b(miracle treatment|cure all|permanently eliminates|eliminates disease)\b/gi,
    title: 'Unsubstantiated Medical / Cure Claim',
    explanation: 'Health and wellness statements claiming to permanently cure or eliminate conditions require peer-reviewed clinical trial substantiation under FDA Section 201(p).',
    ruleViolated: 'FDA Section 201(p) / FTC Health Advertising Standard',
    confidence: 0.95,
    replacementGenerator: () => 'supports visible skin vitality',
  },
  // Absolute Guarantees
  {
    category: 'claim',
    severity: 'critical',
    pattern: /\b(100% safe|risk-free|100% uptime|zero risk|never loses money)\b/gi,
    title: 'Absolute Guarantee Without Caveat',
    explanation: 'Unqualified assertions such as "100% safe" or "zero risk" violate consumer protection statutes and enterprise SLA verification guidelines.',
    ruleViolated: 'FTC Advertising Substantiation Doctrine / SLA Standards',
    confidence: 0.96,
    replacementGenerator: () => 'robust, risk-managed infrastructure',
  },
  {
    category: 'claim',
    severity: 'warning',
    pattern: /\b(unhackable|zero latency|world's only|world’s only)\b/gi,
    title: 'Unverifiable Technical Superlative',
    explanation: 'Absolute technical superlatives like "unhackable" or "zero latency" are technically indefensible in engineering audits and expose the brand to false advertising challenges.',
    ruleViolated: 'Technical Claim Substantiation Standard',
    confidence: 0.92,
    replacementGenerator: () => 'high-reliability architecture',
  },
  // Trademark Disparagement
  {
    category: 'trademark',
    severity: 'critical',
    pattern: /\b(crush (?:salesforce|hubspot|workday|stripe|revolut)|destroy competitors|kill (?:jira|slack)|legacy bloatware)\b/gi,
    title: 'Aggressive Trademark Disparagement',
    explanation: 'Directly disparaging registered competitor trademarks using aggressive phrasing breaches comparative advertising guidelines under Lanham Act § 43(a).',
    ruleViolated: 'Lanham Act § 43(a) / Comparative Advertising Fair Use',
    confidence: 0.95,
    replacementGenerator: () => 'streamline workflows beyond legacy alternatives',
  },
  // Tone & Toxicity
  {
    category: 'tone',
    severity: 'warning',
    pattern: /\b(don't be an idiot|don’t be an idiot|steal your gains|stupid|morons?)\b/gi,
    title: 'Derogatory / Insulting Brand Tone',
    explanation: 'Derogatory or confrontational phrasing undermines brand trust and breaches corporate voice standards.',
    ruleViolated: 'Brand Voice Elevation Standards',
    isContextual: true,
    confidence: 0.9,
    replacementGenerator: () => 'choose modern, reliable technology',
  },
];

/**
 * Replaces a specific violation within a text using exact character indices.
 * Prevents corrupting unrelated identical words elsewhere in the text.
 */
export function applyViolationFix(
  text: string,
  violation: {
    startIndex: number;
    endIndex: number;
    phrase: string;
    suggestedFix: string;
  }
): string {
  // Case 1: Disclaimer append (zero indices)
  if (violation.startIndex === 0 && violation.endIndex === 0) {
    const toAppend = violation.suggestedFix.replace(/^Append:\s*"?/, '').replace(/"?$/, '');
    if (text.includes(toAppend)) return text;
    return `${text.trim()}\n\n${toAppend}`;
  }

  // Case 2: Valid range matching phrase
  if (
    violation.startIndex >= 0 &&
    violation.endIndex > violation.startIndex &&
    violation.endIndex <= text.length
  ) {
    const targetSlice = text.slice(violation.startIndex, violation.endIndex);
    if (targetSlice.toLowerCase() === violation.phrase.toLowerCase()) {
      return (
        text.slice(0, violation.startIndex) +
        violation.suggestedFix +
        text.slice(violation.endIndex)
      );
    }
  }

  // Case 3: Fallback exact substring match if indices shifted
  const idx = text.indexOf(violation.phrase);
  if (idx !== -1) {
    return (
      text.slice(0, idx) +
      violation.suggestedFix +
      text.slice(idx + violation.phrase.length)
    );
  }

  return text;
}

/**
 * Core Brand Safety Analysis Engine.
 * Responsively scans text against active BrandPolicy parameters:
 * - Prohibited Lexicon terms
 * - Restricted Claims
 * - Competitor Trademark exclusions
 * - Mandatory Legal Disclaimers (checked by complete required text)
 * - Configurable Tone Sliders (formality, boldness, technicality)
 */
export function analyzeBrandContent(text: string, policy: BrandPolicy): ScanResult {
  const trimmed = text.trim();

  // Return distinct not_scanned state for empty or whitespace-only input
  if (!trimmed) {
    return {
      overallScore: 0,
      status: 'not_scanned',
      summary: 'No content provided for analysis. Please enter or paste campaign copy to evaluate brand safety.',
      scannedAt: 'Not Scanned',
      wordCount: 0,
      readingTimeSeconds: 0,
      analysisMethod: 'deterministic',
      categories: {
        legal: { name: 'Regulatory & Legal', score: 0, weight: 35, status: 'failed', icon: 'Scale' },
        claims: { name: 'Claim Substantiation', score: 0, weight: 25, status: 'failed', icon: 'CheckCircle' },
        trademark: { name: 'Trademark & IP Defense', score: 0, weight: 20, status: 'failed', icon: 'ShieldCheck' },
        tone: { name: 'Brand Voice & Tone', score: 0, weight: 20, status: 'failed', icon: 'Sparkles' },
        brandSafety: { name: 'Safety & Toxicity Index', score: 0, weight: 10, status: 'failed', icon: 'Lock' },
      },
      violations: [],
      aiRewrittenText: '',
      originalText: text,
    };
  }

  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const readingTimeSeconds = Math.max(3, Math.ceil((wordCount / 200) * 60));

  const rawViolations: Violation[] = [];

  // Helper to test if a new match overlaps with an already found violation
  const isOverlapping = (start: number, end: number) => {
    return rawViolations.some((v) => {
      if (v.startIndex === 0 && v.endIndex === 0) return false;
      return Math.max(v.startIndex, start) < Math.min(v.endIndex, end);
    });
  };

  // 1. Policy-specific Prohibited Terms (Highest priority deterministic rule)
  if (Array.isArray(policy.prohibitedTerms)) {
    for (const term of policy.prohibitedTerms) {
      if (!term.trim()) continue;
      const regex = buildSafeTermRegex(term);
      let match: RegExpExecArray | null;
      while ((match = regex.exec(text)) !== null) {
        const startIndex = match.index;
        const phrase = match[0];
        const endIndex = startIndex + phrase.length;

        if (!isOverlapping(startIndex, endIndex)) {
          rawViolations.push({
            id: `v-banned-${startIndex}-${endIndex}`,
            category: 'claim',
            severity: 'critical',
            phrase,
            startIndex,
            endIndex,
            title: `Banned Term in ${policy.name}: "${phrase}"`,
            explanation: `The term "${phrase}" is explicitly prohibited under active policy "${policy.name}" (${policy.industry}) to prevent regulatory sanctions or consumer misrepresentation.`,
            suggestedFix: 'target outcomes',
            ruleViolated: `${policy.name} Prohibited Lexicon`,
            sourcePolicy: policy.name,
            analysisMethod: 'deterministic',
            isContextual: false,
            confidence: 1.0,
            needsHumanReview: false,
          });
        }
      }
    }
  }

  // 2. Policy-specific Restricted Claims
  if (Array.isArray(policy.restrictedClaims)) {
    for (const claim of policy.restrictedClaims) {
      if (!claim.trim()) continue;
      const regex = buildSafeTermRegex(claim);
      let match: RegExpExecArray | null;
      while ((match = regex.exec(text)) !== null) {
        const startIndex = match.index;
        const phrase = match[0];
        const endIndex = startIndex + phrase.length;

        if (!isOverlapping(startIndex, endIndex)) {
          rawViolations.push({
            id: `v-claim-${startIndex}-${endIndex}`,
            category: 'claim',
            severity: 'warning',
            phrase,
            startIndex,
            endIndex,
            title: `Restricted Claim under ${policy.name}: "${phrase}"`,
            explanation: `The claim "${phrase}" requires formal evidentiary substantiation and SLA qualification according to ${policy.name} guidelines.`,
            suggestedFix: 'high-performance standards',
            ruleViolated: `${policy.name} Restricted Claims Protocol`,
            sourcePolicy: policy.name,
            analysisMethod: 'deterministic',
            isContextual: false,
            confidence: 0.95,
            needsHumanReview: true,
          });
        }
      }
    }
  }

  // 3. General Heuristic Safety Rules
  for (const rule of GENERAL_SAFETY_RULES) {
    const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      const startIndex = match.index;
      const phrase = match[0];
      const endIndex = startIndex + phrase.length;

      if (!isOverlapping(startIndex, endIndex)) {
        rawViolations.push({
          id: `v-rule-${startIndex}-${endIndex}`,
          category: rule.category,
          severity: rule.severity,
          phrase,
          startIndex,
          endIndex,
          title: rule.title,
          explanation: rule.explanation,
          suggestedFix: rule.replacementGenerator(phrase),
          ruleViolated: rule.ruleViolated,
          sourcePolicy: 'Statutory Safety Standards',
          analysisMethod: 'deterministic',
          isContextual: Boolean(rule.isContextual),
          confidence: rule.confidence || 0.9,
          needsHumanReview: Boolean(rule.isContextual || rule.severity === 'warning'),
        });
      }
    }
  }

  // 4. Competitor Trademark Exclusions & Disparagement
  if (Array.isArray(policy.competitorExclusions)) {
    for (const competitor of policy.competitorExclusions) {
      if (!competitor.trim()) continue;
      const compRegex = buildSafeTermRegex(competitor);
      let match: RegExpExecArray | null;
      while ((match = compRegex.exec(text)) !== null) {
        const startIndex = match.index;
        const phrase = match[0];
        const endIndex = startIndex + phrase.length;

        if (!isOverlapping(startIndex, endIndex)) {
          // Check context surrounding the competitor mention (up to 40 characters before and after)
          const contextStart = Math.max(0, startIndex - 40);
          const contextEnd = Math.min(text.length, endIndex + 40);
          const snippet = text.slice(contextStart, contextEnd).toLowerCase();

          const hasAggressiveContext =
            /\b(crush|destroy|kill|beat|legacy|bloatware|slow|expensive|sucks|steals?|idiot)\b/i.test(snippet);

          const severity: Violation['severity'] = hasAggressiveContext ? 'critical' : 'info';
          const title = hasAggressiveContext
            ? `Competitor Disparagement Risk: "${phrase}"`
            : `Protected Competitor Trademark Mention: "${phrase}"`;

          const explanation = hasAggressiveContext
            ? `Direct comparative disparagement of competitor "${phrase}" violates the Lanham Act § 43(a) and ${policy.name} brand guidelines.`
            : `Referencing registered third-party trademark "${phrase}" without comparative fair-use attribution or trademark disclosure.`;

          const suggestedFix = hasAggressiveContext
            ? 'alternative enterprise solutions'
            : `${phrase}®`;

          rawViolations.push({
            id: `v-comp-${startIndex}-${endIndex}`,
            category: 'trademark',
            severity,
            phrase,
            startIndex,
            endIndex,
            title,
            explanation,
            suggestedFix,
            ruleViolated: `${policy.name} Competitor Exclusion Policy`,
            sourcePolicy: policy.name,
            analysisMethod: 'deterministic',
            isContextual: false,
            confidence: 0.94,
            needsHumanReview: hasAggressiveContext,
          });
        }
      }
    }
  }

  // 5. Configurable Tone Settings Evaluation
  // Evaluates Formality, Boldness, and Technicality based on policy sliders
  if (policy.tone) {
    // Formality Check
    if (policy.tone.formality >= 70) {
      // High formality required: flag excessive slang, colloquialisms, or emojis
      const informalRegex = /\b(gains|secret loophole|moonshot|hacks|stuff|awesome|hype)\b/gi;
      let m: RegExpExecArray | null;
      while ((m = informalRegex.exec(text)) !== null) {
        if (!isOverlapping(m.index, m.index + m[0].length)) {
          rawViolations.push({
            id: `v-tone-formality-${m.index}`,
            category: 'tone',
            severity: 'warning',
            phrase: m[0],
            startIndex: m.index,
            endIndex: m.index + m[0].length,
            title: `Low Formality Tone Deviation: "${m[0]}"`,
            explanation: `Active policy "${policy.name}" requires corporate executive formality (${policy.tone.formality}%). Informal slang undermines communication credibility.`,
            suggestedFix: 'strategic value',
            ruleViolated: `${policy.name} Formality Threshold`,
            sourcePolicy: policy.name,
            analysisMethod: 'deterministic',
            isContextual: true,
            confidence: 0.88,
            needsHumanReview: true,
          });
        }
      }
    }

    // Boldness Check
    if (policy.tone.boldness <= 40) {
      // Conservative/humble tone required: flag hyper-aggressive or provocative promises
      const boldRegex = /\b(crush|destroy|secret loophole|revolutionize|dominate|unstoppable|hyper-growth)\b/gi;
      let m: RegExpExecArray | null;
      while ((m = boldRegex.exec(text)) !== null) {
        if (!isOverlapping(m.index, m.index + m[0].length)) {
          rawViolations.push({
            id: `v-tone-boldness-${m.index}`,
            category: 'tone',
            severity: 'warning',
            phrase: m[0],
            startIndex: m.index,
            endIndex: m.index + m[0].length,
            title: `Hyper-Bold Tone Discrepancy: "${m[0]}"`,
            explanation: `Policy "${policy.name}" requires conservative/humble tone (${policy.tone.boldness}% boldness), but provocative copy was detected.`,
            suggestedFix: 'advance',
            ruleViolated: `${policy.name} Boldness Threshold`,
            sourcePolicy: policy.name,
            analysisMethod: 'deterministic',
            isContextual: true,
            confidence: 0.85,
            needsHumanReview: true,
          });
        }
      }
    }
  }

  // 6. Mandatory Disclaimers Check (Evaluates complete required text)
  if (Array.isArray(policy.mandatoryDisclaimers) && policy.mandatoryDisclaimers.length > 0) {
    const normalizedInput = normalizeTextForSearch(text);
    const hasPromotionalOrClaims =
      rawViolations.some((v) => v.category === 'legal' || v.category === 'claim') || wordCount >= 10;

    if (hasPromotionalOrClaims) {
      for (const disclaimer of policy.mandatoryDisclaimers) {
        const trimmedDisclaimer = disclaimer.trim();
        if (!trimmedDisclaimer) continue;
        const normalizedDisclaimer = normalizeTextForSearch(trimmedDisclaimer);

        // Check if COMPLETE required disclaimer text is present in normalized input
        if (!normalizedInput.includes(normalizedDisclaimer)) {
          rawViolations.push({
            id: `v-disclaimer-${escapeRegExp(trimmedDisclaimer.slice(0, 15)).replace(/\s+/g, '_')}`,
            category: 'legal',
            severity: 'warning',
            phrase: `[Missing Notice]: "${trimmedDisclaimer.slice(0, 45)}..."`,
            startIndex: 0,
            endIndex: 0,
            title: 'Missing Mandatory Regulatory / Governance Notice',
            explanation: `The "${policy.name}" compliance guidelines mandate the inclusion of the complete legal notice: "${trimmedDisclaimer}".`,
            suggestedFix: `Append: "${trimmedDisclaimer}"`,
            ruleViolated: `${policy.name} Mandatory Disclosure Requirement`,
            sourcePolicy: policy.name,
            analysisMethod: 'deterministic',
            isContextual: false,
            confidence: 1.0,
            needsHumanReview: true,
          });
        }
      }
    }
  }

  // Sort violations by start position
  rawViolations.sort((a, b) => a.startIndex - b.startIndex);

  // 7. Calculate Category Scores & Weighted Overall Score
  // Scoring weights:
  // - Legal & Regulatory: 35%
  // - Claim Substantiation: 25%
  // - Trademark & IP Defense: 20%
  // - Brand Voice & Tone: 20%
  const scoreForCategory = (cat: FindingCategory) => {
    const catViolations = rawViolations.filter((v) => v.category === cat);
    const crit = catViolations.filter((v) => v.severity === 'critical').length;
    const warn = catViolations.filter((v) => v.severity === 'warning').length;
    const inf = catViolations.filter((v) => v.severity === 'info').length;

    // Deductions: 35 pts per critical, 15 pts per warning, 5 pts per info
    const deduction = crit * 35 + warn * 15 + inf * 5;
    return Math.max(0, 100 - deduction);
  };

  const legalScore = scoreForCategory('legal');
  const claimsScore = scoreForCategory('claim');
  const trademarkScore = scoreForCategory('trademark');
  const toneScore = scoreForCategory('tone');

  const rawOverall =
    legalScore * 0.35 +
    claimsScore * 0.25 +
    trademarkScore * 0.20 +
    toneScore * 0.20;

  const overallScore = Math.max(0, Math.min(100, Math.round(rawOverall)));

  const criticalCount = rawViolations.filter((v) => v.severity === 'critical').length;
  const warningCount = rawViolations.filter((v) => v.severity === 'warning').length;

  let status: ScanResult['status'] = 'approved';
  if (criticalCount > 0 || overallScore < 70) {
    status = 'rejected';
  } else if (warningCount > 0 || overallScore < 85) {
    status = 'review_required';
  }

  const getStatusLevel = (score: number): 'passed' | 'warning' | 'failed' => {
    if (score >= 85) return 'passed';
    if (score >= 65) return 'warning';
    return 'failed';
  };

  let summary = '';
  if (status === 'approved') {
    summary = `Exemplary brand compliance (${overallScore}/100). Content aligns with ${policy.name} voice, trademark standards, and regulatory disclosure rules.`;
  } else if (status === 'review_required') {
    summary = `Review Recommended (${overallScore}/100). Found ${warningCount} advisory item(s) that should be refined prior to broadcast.`;
  } else {
    summary = `Critical Violations Detected (${overallScore}/100). Found ${criticalCount} core noncompliant item(s) breaching ${policy.name} standards. Direct remediation suggested.`;
  }

  // 8. Generate AI Remediated Text (Applying fixes from end to beginning to preserve character indices)
  let remediatedText = text;
  const inlineFixable = rawViolations
    .filter((v) => v.startIndex > 0 || v.endIndex > 0)
    .sort((a, b) => b.startIndex - a.startIndex);

  for (const v of inlineFixable) {
    if (v.suggestedFix && v.phrase) {
      remediatedText = applyViolationFix(remediatedText, v);
    }
  }

  // Append missing disclaimers to remediated text if any
  const missingDisclaimers = rawViolations.filter(
    (v) => v.startIndex === 0 && v.endIndex === 0 && v.suggestedFix.startsWith('Append:')
  );
  if (missingDisclaimers.length > 0) {
    const disclaimersToAppend = missingDisclaimers
      .map((d) => d.suggestedFix.replace(/^Append:\s*"?/, '').replace(/"?$/, ''))
      .filter((d, i, arr) => arr.indexOf(d) === i);
    remediatedText = `${remediatedText.trim()}\n\n*${disclaimersToAppend.join(' ')}*`;
  }

  return {
    overallScore,
    status,
    summary,
    scannedAt: 'Active Sentinel Scan',
    wordCount,
    readingTimeSeconds,
    analysisMethod: 'deterministic',
    categories: {
      legal: { name: 'Regulatory & Legal', score: legalScore, weight: 35, status: getStatusLevel(legalScore), icon: 'Scale' },
      claims: { name: 'Claim Substantiation', score: claimsScore, weight: 25, status: getStatusLevel(claimsScore), icon: 'CheckCircle' },
      trademark: { name: 'Trademark & IP Defense', score: trademarkScore, weight: 20, status: getStatusLevel(trademarkScore), icon: 'ShieldCheck' },
      tone: { name: 'Brand Voice & Tone', score: toneScore, weight: 20, status: getStatusLevel(toneScore), icon: 'Sparkles' },
      brandSafety: { name: 'Safety & Toxicity Index', score: Math.round((overallScore + legalScore) / 2), weight: 10, status: getStatusLevel(overallScore), icon: 'Lock' },
    },
    violations: rawViolations,
    aiRewrittenText: remediatedText,
    originalText: text,
  };
}
