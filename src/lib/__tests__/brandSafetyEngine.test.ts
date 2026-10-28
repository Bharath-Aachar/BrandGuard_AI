import { describe, it, expect } from 'vitest';
import {
  analyzeBrandContent,
  applyViolationFix,
  escapeRegExp,
  DEFAULT_POLICIES,
  SAMPLE_PRESETS,
} from '../brandSafetyEngine';
import { BrandPolicy } from '@/types/brandguard';

describe('Brand Safety Engine — Compliance, Rules & Policy Responsiveness', () => {
  const fintechPolicy: BrandPolicy = DEFAULT_POLICIES.fintech;

  // 1. Empty & Whitespace Content Tests
  describe('Empty Content & Input Validation', () => {
    it('returns not_scanned status and zero score for empty string', () => {
      const result = analyzeBrandContent('', fintechPolicy);
      expect(result.status).toBe('not_scanned');
      expect(result.overallScore).toBe(0);
      expect(result.violations).toHaveLength(0);
      expect(result.summary).toContain('No content provided');
    });

    it('returns not_scanned status for whitespace-only input', () => {
      const result = analyzeBrandContent('   \n\t  ', fintechPolicy);
      expect(result.status).toBe('not_scanned');
      expect(result.overallScore).toBe(0);
      expect(result.violations).toHaveLength(0);
    });

    it('never marks empty content as approved', () => {
      const result = analyzeBrandContent('', fintechPolicy);
      expect(result.status).not.toBe('approved');
    });
  });

  // 2. Clean Compliant Content Test
  describe('Clean Compliant Content', () => {
    it('approves compliant enterprise copy with high safety score', () => {
      const cleanPr = SAMPLE_PRESETS.find((p) => p.id === 'clean_approved_pr')!;
      const result = analyzeBrandContent(cleanPr.text, DEFAULT_POLICIES.enterprise);

      expect(result.status).toBe('approved');
      expect(result.overallScore).toBeGreaterThanOrEqual(85);
      expect(result.violations.filter((v) => v.severity === 'critical')).toHaveLength(0);
    });
  });

  // 3. Prohibited Terms & Restricted Claims
  describe('Prohibited Terms & Restricted Claims', () => {
    it('flags explicit policy prohibited terms with critical severity', () => {
      const text = 'Sign up now for guaranteed profit and zero risk.';
      const result = analyzeBrandContent(text, fintechPolicy);

      const criticalFindings = result.violations.filter((v) => v.severity === 'critical');
      expect(criticalFindings.length).toBeGreaterThanOrEqual(1);

      const phrases = result.violations.map((v) => v.phrase.toLowerCase());
      expect(phrases.some((p) => p.includes('guaranteed profit') || p.includes('zero risk'))).toBe(true);
      expect(result.status).toBe('rejected');
    });

    it('flags restricted claims as advisory warnings with claim substantiation category', () => {
      const text = 'Our platform provides 100% uptime and unhackable security.';
      const result = analyzeBrandContent(text, DEFAULT_POLICIES.enterprise);

      const claimViolations = result.violations.filter((v) => v.category === 'claim');
      expect(claimViolations.length).toBeGreaterThanOrEqual(1);
      expect(result.categories.claims.score).toBeLessThan(100);
    });
  });

  // 4. Case Variations & Regex Boundary Handling
  describe('Case Variations, Punctuation & Repeated Phrases', () => {
    it('safely escapes special characters in regex generator', () => {
      expect(escapeRegExp('100% safe (guaranteed)?')).toBe('100% safe \\(guaranteed\\)\\?');
      expect(escapeRegExp('$500+ ROI [fixed]')).toBe('\\$500\\+ ROI \\[fixed\\]');
    });

    it('detects terms regardless of uppercase / lowercase variations', () => {
      const text = 'Join our hedge vault for GUARANTEED PROFIT today.';
      const result = analyzeBrandContent(text, fintechPolicy);

      expect(result.violations.some((v) => v.phrase === 'GUARANTEED PROFIT')).toBe(true);
    });

    it('identifies multiple repeated occurrences of a banned term with accurate distinct indices', () => {
      const text = 'Salesforce is slow. We outperform Salesforce in every benchmark against Salesforce.';
      const result = analyzeBrandContent(text, DEFAULT_POLICIES.enterprise);

      const salesforceViolations = result.violations.filter((v) =>
        v.phrase.toLowerCase().includes('salesforce')
      );

      expect(salesforceViolations.length).toBe(3);
      // Ensure start indices are strictly ascending and non-overlapping
      expect(salesforceViolations[0].startIndex).toBeLessThan(salesforceViolations[1].startIndex);
      expect(salesforceViolations[1].startIndex).toBeLessThan(salesforceViolations[2].startIndex);
    });
  });

  // 5. Mandatory Disclaimers (Complete Text Evaluation)
  describe('Mandatory Disclaimers Verification', () => {
    it('flags missing mandatory disclaimer when required full text is absent', () => {
      const text = `🚀 Want target investment growth? Our new automated algorithmic hedge vault delivers verified returns of 25% APY! 
      This is promotional financial copy with more than twenty words to satisfy regulatory threshold.`;

      const result = analyzeBrandContent(text, fintechPolicy);
      const disclaimerViolation = result.violations.find((v) =>
        v.title.includes('Missing Mandatory')
      );

      expect(disclaimerViolation).toBeDefined();
      expect(disclaimerViolation?.explanation).toContain(fintechPolicy.mandatoryDisclaimers[0]);
    });

    it('does NOT flag missing disclaimer if complete required text is present', () => {
      const fullDisclaimer = fintechPolicy.mandatoryDisclaimers[0];
      const text = `Investment targets announced for Q4 portfolio allocations across verified accounts. 
      ${fullDisclaimer}`;

      const result = analyzeBrandContent(text, fintechPolicy);
      const disclaimerViolation = result.violations.find((v) =>
        v.explanation?.includes(fullDisclaimer)
      );

      expect(disclaimerViolation).toBeUndefined();
    });

    it('rejects partial prefix match if full disclaimer is incomplete', () => {
      const fullDisclaimer = fintechPolicy.mandatoryDisclaimers[0];
      // Only first 20 characters provided
      const partialPrefix = fullDisclaimer.slice(0, 20);
      const text = `Promotional yield copy with extensive text exceeding twenty words in total. ${partialPrefix}... [missing rest]`;

      const result = analyzeBrandContent(text, fintechPolicy);
      const disclaimerViolation = result.violations.find((v) =>
        v.explanation?.includes(fullDisclaimer)
      );

      // Must flag because the full disclaimer was not included
      expect(disclaimerViolation).toBeDefined();
    });
  });

  // 6. Policy Responsiveness (Changes in Guidelines affect Scans)
  describe('Policy Dynamic Responsiveness', () => {
    it('immediately reflects new banned terms added to policy', () => {
      const customPolicy: BrandPolicy = {
        ...fintechPolicy,
        prohibitedTerms: [...fintechPolicy.prohibitedTerms, 'crypto rocket'],
      };

      const text = 'Our crypto rocket strategy delivers targeted allocation.';
      const initialScan = analyzeBrandContent(text, fintechPolicy);
      const customScan = analyzeBrandContent(text, customPolicy);

      // Default policy does not have 'crypto rocket'
      expect(initialScan.violations.some((v) => v.phrase === 'crypto rocket')).toBe(false);
      // Custom policy immediately flags 'crypto rocket'
      expect(customScan.violations.some((v) => v.phrase === 'crypto rocket')).toBe(true);
      expect(customScan.status).toBe('rejected');
    });

    it('immediately responds to tone boldness adjustments', () => {
      const conservativePolicy: BrandPolicy = {
        ...fintechPolicy,
        tone: { ...fintechPolicy.tone, boldness: 20 }, // Conservative tone
      };

      const text = 'Our unstoppable strategy will dominate the market.';
      const result = analyzeBrandContent(text, conservativePolicy);

      const toneViolations = result.violations.filter((v) => v.category === 'tone');
      expect(toneViolations.length).toBeGreaterThanOrEqual(1);
    });
  });

  // 7. Corrections & Text Positions
  describe('Corrections & Exact Range Replacements', () => {
    it('replaces target phrase by exact range without altering other occurrences', () => {
      const original = 'We beat Salesforce in speed, but Salesforce is still respected.';
      // First "Salesforce" is at index 8..18
      const firstFix = {
        startIndex: 8,
        endIndex: 18,
        phrase: 'Salesforce',
        suggestedFix: 'legacy tools',
      };

      const fixed = applyViolationFix(original, firstFix);
      expect(fixed).toBe('We beat legacy tools in speed, but Salesforce is still respected.');
      // Notice the second "Salesforce" remains intact!
    });

    it('correctly appends missing disclaimers', () => {
      const original = 'Check out our new wealth management account.';
      const disclaimerFix = {
        startIndex: 0,
        endIndex: 0,
        phrase: 'Missing Notice',
        suggestedFix: 'Append: "Capital at risk. Authorized by FCA."',
      };

      const fixed = applyViolationFix(original, disclaimerFix);
      expect(fixed).toContain('Capital at risk. Authorized by FCA.');
    });
  });

  // 8. Scoring & Approval Calculations
  describe('Scoring Calculation & Approval Thresholds', () => {
    it('deducts 35 points per critical violation and 15 per warning', () => {
      // Critical prohibited term: -35 pts
      const textCritical = 'Zero risk investment targets.';
      const resultCritical = analyzeBrandContent(textCritical, fintechPolicy);
      expect(resultCritical.categories.claims.score).toBe(65);

      // Advisory restricted claim warning: -15 pts
      const textWarning = '100% safe investment targets.';
      const resultWarning = analyzeBrandContent(textWarning, fintechPolicy);
      expect(resultWarning.categories.claims.score).toBe(85);
    });

    it('content score alone never marks status approved if critical violation exists', () => {
      const text = 'Guaranteed profit on all transactions.';
      const result = analyzeBrandContent(text, fintechPolicy);

      expect(result.status).toBe('rejected');
      expect(result.status).not.toBe('approved');
    });
  });
});
