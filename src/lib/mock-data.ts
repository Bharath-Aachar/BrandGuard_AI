import type { Activity, Scan } from "@/types";

/** Demo data only. Replace with API calls later; the UI depends only on these types. */
export const REFERENCE_DATE = "2026-10-27";

export const scans: Scan[] = [
  {
    id: "scn-1048", title: "Q4 savings account promo", platform: "Instagram", date: "2026-10-26", score: 38,
    content: "Earn a guaranteed 12% return on every deposit. Zero risk, ever. Open your account today and watch your money double in a year!",
    findings: [
      { id: "f1", title: "Guaranteed returns claim", severity: "Critical", explanation: "Promising guaranteed returns on deposits breaches financial promotion rules.", excerpt: "guaranteed 12% return" },
      { id: "f2", title: "Absolute risk statement", severity: "High", explanation: "Stating there is no risk is misleading for any product with variable outcomes.", excerpt: "Zero risk, ever" },
      { id: "f3", title: "Unsupported growth claim", severity: "High", explanation: "Money doubling in a year has no substantiation provided.", excerpt: "watch your money double" },
    ],
    suggestions: ["State the variable rate and include 'rates may change'.", "Remove 'zero risk' and describe protections factually.", "Add the required regulatory disclosure and eligibility terms."],
  },
  {
    id: "scn-1047", title: "Spring skincare launch email", platform: "Email", date: "2026-10-25", score: 62,
    content: "Our new serum cures acne in 7 days. Dermatologist approved. Join 50,000 happy customers.",
    findings: [
      { id: "f1", title: "Medical cure claim", severity: "High", explanation: "Claiming to cure a condition classifies the product as a medicine.", excerpt: "cures acne in 7 days" },
      { id: "f2", title: "Unverified endorsement", severity: "Medium", explanation: "Dermatologist approval needs a named, verifiable source.", excerpt: "Dermatologist approved" },
    ],
    suggestions: ["Replace 'cures' with 'helps reduce the appearance of'.", "Cite the study or name the endorsing dermatologist."],
  },
  {
    id: "scn-1046", title: "Partner webinar announcement", platform: "LinkedIn", date: "2026-10-23", score: 91,
    content: "Join our partner session on responsible AI adoption. Register by Friday to reserve a seat.",
    findings: [],
    suggestions: ["No changes required."],
  },
  {
    id: "scn-1045", title: "Crypto wallet app banner", platform: "Web banner", date: "2026-10-21", score: 44,
    content: "Be a millionaire by 2027. 100% safe wallet, no fees, no limits. Limited time only!",
    findings: [
      { id: "f1", title: "Income promise", severity: "Critical", explanation: "Implying a person will become a millionaire is a prohibited earnings claim.", excerpt: "Be a millionaire by 2027" },
      { id: "f2", title: "Absolute safety claim", severity: "High", explanation: "No wallet can be guaranteed 100% safe.", excerpt: "100% safe wallet" },
      { id: "f3", title: "Undisclosed fee terms", severity: "Medium", explanation: "'No fees' needs conditions stated alongside it.", excerpt: "no fees, no limits" },
    ],
    suggestions: ["Remove earnings language entirely.", "Describe specific security features instead of absolute claims.", "Link the fee schedule next to the claim."],
  },
  {
    id: "scn-1044", title: "Holiday sale announcement", platform: "Facebook", date: "2026-10-18", score: 76,
    content: "Up to 60% off sitewide this weekend. Biggest sale of the year, while stocks last.",
    findings: [
      { id: "f1", title: "Superlative without basis", severity: "Medium", explanation: "'Biggest sale of the year' should be verifiable against prior sales.", excerpt: "Biggest sale of the year" },
    ],
    suggestions: ["Confirm the claim against previous campaigns or soften it."],
  },
  {
    id: "scn-1043", title: "Competitor comparison post", platform: "X", date: "2026-10-14", score: 58,
    content: "Unlike Acme Pay, we never lose your data. They have been hacked twice.",
    findings: [
      { id: "f1", title: "Unsubstantiated competitor claim", severity: "High", explanation: "Naming a competitor's incidents without sources creates legal exposure.", excerpt: "They have been hacked twice" },
      { id: "f2", title: "Absolute data safety claim", severity: "Medium", explanation: "'Never' cannot be guaranteed.", excerpt: "we never lose your data" },
    ],
    suggestions: ["Remove the competitor reference or cite public sources.", "Replace 'never' with a description of your safeguards."],
  },
  {
    id: "scn-1042", title: "Customer story: Northwind", platform: "Blog", date: "2026-10-09", score: 88,
    content: "Northwind reduced onboarding time by 30% in their first quarter using our workflow tools.",
    findings: [
      { id: "f1", title: "Result needs attribution", severity: "Low", explanation: "Add a note that results vary by customer.", excerpt: "reduced onboarding time by 30%" },
    ],
    suggestions: ["Add 'Results vary' and link to the case study methodology."],
  },
  {
    id: "scn-1041", title: "Fitness challenge teaser", platform: "TikTok", date: "2026-10-02", score: 81,
    content: "Lose 5kg in 30 days with our plan. Real results from real members.",
    findings: [
      { id: "f1", title: "Weight loss outcome claim", severity: "Medium", explanation: "Specific outcomes need a typical-results disclosure.", excerpt: "Lose 5kg in 30 days" },
    ],
    suggestions: ["Add 'individual results vary' and reference the program terms."],
  },
];

export const activities: Activity[] = [
  { id: "a1", text: "Scan completed: Q4 savings account promo", date: "2026-10-26" },
  { id: "a2", text: "High-risk claim flagged in Crypto wallet app banner", date: "2026-10-21" },
  { id: "a3", text: "Brand policy updated: Financial promotions v2", date: "2026-10-19" },
  { id: "a4", text: "Audit report generated for September", date: "2026-10-03" },
];

export const getScan = (id: string) => scans.find((s) => s.id === id);
