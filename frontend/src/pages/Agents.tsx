import { 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  Scale, 
  Eye, 
  Layers, 
  ArrowRight
} from 'lucide-react';
import { SectionHeader } from '../components/common/SectionHeader';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { SEO } from '../components/common/SEO';

export function Agents() {
  const guardians = [
    {
      id: "fact-guardian",
      name: "Fact Guardian",
      pillar: "Factual Integrity & Accuracy",
      icon: <FileText className="w-6 h-6 text-glacial" />,
      checks: "Specifications, release dates, pricing tiers, warranty periods, feature sets, technical limitations.",
      evidence: "Approved product spec sheets, technical whitepapers, versioned datasheets.",
      outputs: [
        { label: "Supported", desc: "Claim precisely matches verified specification with exact page citation." },
        { label: "Contradicted", desc: "Claim conflicts with approved facts (prompts RED severity)." },
        { label: "Outdated", desc: "Claim quotes expired version or retired product attribute." },
        { label: "Unverifiable", desc: "Fact is not present in Hub; marked for human investigation rather than hallucinating." }
      ],
      limits: "Cannot verify attributes not stored in the Brand Knowledge Hub.",
      schemaSample: `{\n  "agent": "FactGuardian",\n  "status": "Contradicted",\n  "excerpt": "7 days battery life",\n  "evidence": "Spec Sheet v3.2, p.4: 'up to 5 days'",\n  "severity": "RED",\n  "confidence": 0.98\n}`
    },
    {
      id: "voice-guardian",
      name: "Voice Guardian",
      pillar: "Brand Persona & Tone",
      icon: <Sparkles className="w-6 h-6 text-status-warning" />,
      checks: "Tone, voice attributes (e.g. authoritative vs casual), audience empathy, narrative consistency. Suggests respectful edits preserving creator intent.",
      evidence: "Communication guidelines, editorial style manuals, brand voice pillars.",
      outputs: [
        { label: "Aligned", desc: "Tone matches brand voice attributes." },
        { label: "Tone Drift", desc: "Excessive slang, unwarranted formality, or abrasive rhetoric." }
      ],
      limits: "Tone is partially subjective; low-confidence assessments are forwarded to human review.",
      schemaSample: `{\n  "agent": "VoiceGuardian",\n  "status": "ToneDrift",\n  "excerpt": "Crazy cheap deals!",\n  "suggestion": "Exceptional value offerings",\n  "severity": "YELLOW",\n  "confidence": 0.82\n}`
    },
    {
      id: "terminology-guardian",
      name: "Terminology Guardian",
      pillar: "Trademarks & Nomenclature",
      icon: <CheckCircle2 className="w-6 h-6 text-status-success" />,
      checks: "Approved trademark spellings, restricted vocabularies, prohibited competitive terms, inconsistent naming.",
      evidence: "Approved terminology registries, brand glossaries, trademark guidelines.",
      outputs: [
        { label: "Approved Term", desc: "Canonical brand nomenclature verified." },
        { label: "Prohibited Token", desc: "Usage of retired, deprecated, or forbidden words." },
        { label: "Suggested Alternative", desc: "Drop-in approved synonym from glossary." }
      ],
      limits: "Audit efficacy depends on the completeness of uploaded terminology lists.",
      schemaSample: `{\n  "agent": "TerminologyGuardian",\n  "status": "ProhibitedToken",\n  "excerpt": "Eco-magic chassis",\n  "suggestion": "UltraGlide Recycled Alloy",\n  "severity": "YELLOW",\n  "confidence": 1.0\n}`
    },
    {
      id: "claims-guardian",
      name: "Claims Guardian",
      pillar: "Superlatives & Disclosures",
      icon: <Scale className="w-6 h-6 text-status-critical" />,
      checks: "Numerical claims, comparative statements ('better than X'), superlatives ('fastest', 'first'), environmental claims ('100% green').",
      evidence: "Approved claims library, verified lab benchmark files, legal disclosures.",
      outputs: [
        { label: "Substantiated", desc: "Claim backed by signed benchmark document on file." },
        { label: "Unsubstantiated", desc: "No backing evidence; flagged for mandatory Legal escalation." }
      ],
      limits: "Does not provide legal counsel; surfaces high-risk assertions for human counsel verification.",
      schemaSample: `{\n  "agent": "ClaimsGuardian",\n  "status": "Unsubstantiated",\n  "excerpt": "Fastest sensor on the market",\n  "severity": "RED",\n  "action": "EscalateToLegal",\n  "confidence": 0.94\n}`
    },
    {
      id: "visual-guardian",
      name: "Visual Guardian",
      pillar: "Computer Vision & Visual Identity",
      icon: <Eye className="w-6 h-6 text-glacial" />,
      checks: "Logo clearspace violations, aspect ratio distortion, palette hexadecimal drift (CIELAB Delta-E), unauthorized graphical assets.",
      evidence: "Official vector logo masters, primary & secondary hex codes, brand style templates.",
      outputs: [
        { label: "Palette Compliant", desc: "Extracted dominant colors match approved brand hex tokens." },
        { label: "Hex Drift (Delta-E)", desc: "Color variation exceeds perceptible threshold (> 2.3)." },
        { label: "Logo Distorted", desc: "Aspect ratio deviates from master vector file." }
      ],
      limits: "Direct font parsing is highly accurate for documents, but depends on resolution for flat images.",
      schemaSample: `{\n  "agent": "VisualGuardian",\n  "status": "HexDrift",\n  "detectedHex": "#071216",\n  "approvedHex": "#050707",\n  "deltaE": 4.1,\n  "severity": "YELLOW"\n}`
    },
    {
      id: "accessibility-guardian",
      name: "Accessibility Guardian",
      pillar: "WCAG & Readability",
      icon: <Layers className="w-6 h-6 text-glacial-200" />,
      checks: "Text-to-background contrast ratio (WCAG 2.1 AA/AAA), Flesch-Kincaid grade level readability, missing image alt-text, header hierarchy.",
      evidence: "WCAG 2.1 contrast formulas (4.5:1 for body, 3:1 for large text), plain language benchmarks.",
      outputs: [
        { label: "WCAG AA Pass", desc: "Contrast ratio satisfies minimum 4.5:1 standard." },
        { label: "Contrast Failure", desc: "Insufficient legibility between copy and backdrop." },
        { label: "High Complexity", desc: "Readability index exceeds recommended consumer grade." }
      ],
      limits: "Contrast is estimated from extracted text and bounding background regions.",
      schemaSample: `{\n  "agent": "AccessibilityGuardian",\n  "status": "ContrastFailure",\n  "ratio": "2.8:1",\n  "threshold": "4.5:1",\n  "severity": "YELLOW",\n  "confidence": 0.96\n}`
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
      <SEO
        title="Six Specialist AI Guardians & Arbiter Architecture"
        description="Comprehensive technical guide to the six parallel AI guardians in NEXORA: Fact, Voice, Terminology, Claims, Visual, and Accessibility Guardians, plus the Risk Manager Arbiter."
      />

      <SectionHeader
        badge="Multi-Agent System"
        title="Six Dedicated Guardians &"
        highlight="One Risk Arbiter"
        description="Instead of one generalist prompt, NEXORA deploys specialized domain guardians concurrently via Python asyncio, unified under a strict evidence and citation protocol."
      />

      {/* The 6 Guardians Deep Dive */}
      <div className="space-y-12">
        {guardians.map((g) => (
          <div key={g.id} id={g.id} className="rounded-3xl glass-panel border border-slate-border p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-border/50">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-2xl bg-obsidian-800 border border-slate-border">
                  {g.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-text">{g.name}</h3>
                  <p className="text-xs text-glacial font-mono">{g.pillar}</p>
                </div>
              </div>
              <Badge variant="mono" size="sm">asyncio concurrency</Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Details & Verification Rules */}
              <div className="lg:col-span-7 space-y-4 text-xs">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-tertiary block">What It Audits:</span>
                  <p className="text-slate-text mt-1 leading-relaxed">{g.checks}</p>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-tertiary block">Approved Evidence Source:</span>
                  <p className="text-slate-muted mt-1 leading-relaxed">{g.evidence}</p>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-tertiary block">Output Classification Labels:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1.5">
                    {g.outputs.map((out, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-obsidian-800/80 border border-slate-border/60">
                        <span className="font-semibold text-slate-text block">{out.label}</span>
                        <span className="text-slate-muted text-[11px] leading-tight block mt-0.5">{out.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-obsidian-900/60 border border-slate-border/60 text-slate-muted text-[11px]">
                  <strong className="text-slate-text">Known Boundary / Limit: </strong>
                  {g.limits}
                </div>
              </div>

              {/* Right Column: Standardized JSON Schema */}
              <div className="lg:col-span-5 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-tertiary block mb-1.5">Agent JSON Schema:</span>
                  <pre className="p-4 rounded-xl bg-obsidian-950/90 border border-slate-border font-mono text-[11px] text-glacial overflow-x-auto leading-relaxed">
                    {g.schemaSample}
                  </pre>
                </div>

                <div className="pt-3 flex items-center justify-between text-[11px] font-mono text-slate-tertiary">
                  <span>Provider Independent</span>
                  <span className="text-glacial">Gemini / Ollama</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* The Arbiter / Risk Manager Deep Dive */}
      <section className="rounded-3xl glass-panel border border-status-warning/40 p-8 sm:p-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-border">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-obsidian-800 border border-status-warning/40 text-status-warning">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-text">Risk Manager / Arbiter</h3>
              <p className="text-xs text-status-warning font-mono">Consolidation, Deduplication & Severity Engine</p>
            </div>
          </div>
          <Badge variant="warning" size="sm">Consolidation Core</Badge>
        </div>

        <p className="text-xs sm:text-sm text-slate-muted leading-relaxed">
          The Arbiter receives findings from all active guardians. Because multiple agents can detect symptoms of the same root error (for example, a bogus warranty claim flags both the Fact Guardian and Claims Guardian), the Arbiter performs critical synthesis before presenting the final report to human reviewers:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-obsidian-800/80 border border-slate-border space-y-1.5">
            <h4 className="font-semibold text-slate-text">1. Deduplication</h4>
            <p className="text-slate-muted">Merges overlapping flags into one coherent finding citing both spec conflict and claim verification rules.</p>
          </div>
          <div className="p-4 rounded-xl bg-obsidian-800/80 border border-slate-border space-y-1.5">
            <h4 className="font-semibold text-slate-text">2. Severity Assignment</h4>
            <p className="text-slate-muted">Applies strict rule: Any unapproved specification contradiction instantly sets overall review to RED.</p>
          </div>
          <div className="p-4 rounded-xl bg-obsidian-800/80 border border-slate-border space-y-1.5">
            <h4 className="font-semibold text-slate-text">3. Uncertainty Declaration</h4>
            <p className="text-slate-muted">Calculates review uncertainty. Claims lacking evidence are stated as Unverifiable rather than guessed.</p>
          </div>
        </div>
      </section>

      {/* Navigation CTA */}
      <div className="text-center pt-4">
        <Link to="/recall">
          <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
            See How the Advertisement Recall Engine Re-checks Ads
          </Button>
        </Link>
      </div>

    </div>
  );
}
