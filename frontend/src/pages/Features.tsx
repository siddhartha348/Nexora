import { 
  RotateCcw, 
  Layers, 
  ShieldCheck, 
  Scale, 
  Compass, 
  CheckCircle2, 
  Database, 
  ArrowRight
} from 'lucide-react';
import { SectionHeader } from '../components/common/SectionHeader';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { SEO } from '../components/common/SEO';

export function Features() {
  const featurePillars = [
    {
      id: "knowledge-hub",
      title: "Brand Knowledge Hub",
      badge: "Authoritative Core",
      icon: <Database className="w-5 h-5 text-glacial" />,
      desc: "Central repository ingesting guidelines, specification sheets, approved claims, and color palettes. Newly ingested content remains in an 'unapproved' quarantine state until an Administrator verifies and activates it.",
      highlights: [
        "PDF, DOCX, and PPTX document parsing",
        "Strict Admin-only approval gate before RAG indexing",
        "Semantic chunking with version tags and page references",
        "Key-value fact extraction for exact numerical matching"
      ]
    },
    {
      id: "multimodal-extraction",
      title: "Multimodal Content Extraction",
      badge: "Ingestion Pipeline",
      icon: <Layers className="w-5 h-5 text-glacial" />,
      desc: "Comprehensive extraction engine ingesting multi-format advertisement creatives. Parses vector text, layouts, visual assets, and images with graceful fallback to OCR.",
      highlights: [
        "Native PyMuPDF & pdfplumber digital text extraction",
        "Tesseract OCR fallback for rasterized ad copy",
        "OpenCV color histogram & hex code extraction",
        "Logo bounding box and aspect ratio inspection"
      ]
    },
    {
      id: "agent-orchestration",
      title: "Six Specialist AI Guardians",
      badge: "Async Concurrency",
      icon: <Compass className="w-5 h-5 text-glacial" />,
      desc: "Concurrent evaluation powered by Python asyncio. Rather than a vague general review, each guardian operates with an explicit schema and dedicated evidence requirements.",
      highlights: [
        "Fact Guardian: Specifications, prices, warranty, dates",
        "Voice Guardian: Brand tone, persona, audience alignment",
        "Terminology Guardian: Restricted lexicons & canonical names",
        "Claims Guardian: Comparative & superlative claim validation",
        "Visual Guardian: Logo distortion & hex palette compliance",
        "Accessibility Guardian: WCAG contrast & readability indices"
      ]
    },
    {
      id: "risk-arbiter",
      title: "Risk Manager / Arbiter",
      badge: "Synthesis Engine",
      icon: <Scale className="w-5 h-5 text-status-warning" />,
      desc: "Synthesizes the outputs of all six guardians. Eliminates redundant findings, resolves conflicting advice, and assigns tri-level severity.",
      highlights: [
        "Deduplication across overlapping agent scopes",
        "Explicit RED, YELLOW, GREEN severity classification",
        "Enforces Unverifiable state when evidence is absent",
        "Quantified confidence score for every finding"
      ]
    },
    {
      id: "recall-engine",
      title: "Advertisement Recall Engine",
      badge: "Active Differentiator",
      icon: <RotateCcw className="w-5 h-5 text-status-warning" />,
      desc: "Continuous re-evaluation pipeline. When approved specifications or brand policies update, the Recall Engine automatically re-audits registered advertisements.",
      highlights: [
        "Semantic & numerical delta detection between document versions",
        "Fast query across Advertisement Registry for impacted claims",
        "Targeted re-checks on affected creatives",
        "Prioritized recall alert generation with exact remediation"
      ]
    },
    {
      id: "review-memory",
      title: "Human Approval & Review Memory",
      badge: "Human In The Loop",
      icon: <ShieldCheck className="w-5 h-5 text-status-success" />,
      desc: "Enforces human authority over all publication decisions. Reviewer rationale is archived into Review Memory to provide context for future audits without silently changing official policy.",
      highlights: [
        "Zero automated approvals: final decision is always human",
        "Accept, reject, edit, or comment on any finding",
        "Stores reviewer rationale as vector precedents in ChromaDB",
        "Maintains complete audit trails of all reviewer actions"
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
      <SEO
        title="Platform Features & Capabilities"
        description="Explore the complete feature architecture of NEXORA: Brand Knowledge Hub, 6 parallel AI guardians, Advertisement Recall, and human review memory."
      />

      <SectionHeader
        badge="Platform Architecture"
        title="Engineered for Zero Factual Drift and"
        highlight="Continuous Recall"
        description="Every feature in NEXORA is purposefully designed to solve brand governance at scale—from document ingestion to post-publication re-auditing."
      />

      {/* Feature Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {featurePillars.map((feat) => (
          <Card key={feat.id} id={feat.id} variant="default" className="flex flex-col justify-between hover:border-glacial/40 transition-colors">
            <div>
              <CardHeader
                title={feat.title}
                description={feat.badge}
                action={<div className="p-2.5 rounded-xl bg-obsidian-800 border border-slate-border">{feat.icon}</div>}
              />
              <CardContent className="space-y-4">
                <p className="text-xs text-slate-muted leading-relaxed">
                  {feat.desc}
                </p>

                <div className="space-y-2 pt-2 border-t border-slate-border/50">
                  <span className="text-[10px] font-mono uppercase text-slate-tertiary">Key Capabilities:</span>
                  <ul className="space-y-1.5 text-xs text-slate-text">
                    {feat.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-glacial shrink-0 mt-0.5" />
                        <span className="text-slate-muted">{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-border/50 flex items-center justify-between text-[11px] font-mono text-slate-tertiary">
              <span>Status: Active</span>
              <span className="text-glacial">Production Ready</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Navigation CTA to Recall */}
      <div className="rounded-3xl glass-panel border border-status-warning/30 p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <Badge variant="warning" size="sm">Explore Continuous Monitoring</Badge>
          <h3 className="text-xl font-bold text-slate-text">How Advertisement Recall Protects Published Creatives</h3>
          <p className="text-xs text-slate-muted max-w-xl">
            See the end-to-end recall loop in action—from document version approval to automated creative re-auditing.
          </p>
        </div>
        <Link to="/recall" className="shrink-0">
          <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Explore Recall Engine
          </Button>
        </Link>
      </div>

    </div>
  );
}
