import { 
  FileUp, 
  CheckCheck, 
  Cpu, 
  Scale, 
  FileCheck, 
  UserCheck, 
  Archive, 
  RotateCcw, 
  ArrowRight
} from 'lucide-react';
import { SectionHeader } from '../components/common/SectionHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { SEO } from '../components/common/SEO';

export function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Knowledge Ingestion & Admin Gate",
      actor: "Brand Administrator",
      desc: "Brand managers upload specification sheets, style manuals, trademark lists, and official hex palettes. Uploaded documents remain unapproved in quarantine until an administrator validates them. Only approved documents are indexed for evidence retrieval.",
      icon: <FileUp className="w-5 h-5 text-glacial" />,
      detail: "Prevents draft or unvetted rules from contaminating AI audits."
    },
    {
      num: "02",
      title: "Advertisement Submission",
      actor: "Creator / Agency",
      desc: "Marketing teams or external agencies submit creatives in PDF, DOCX, PPTX, PNG, or JPG format (or a public URL). The system assigns a unique tracking ID and initializes a background audit job.",
      icon: <FileCheck className="w-5 h-5 text-glacial" />,
      detail: "Returns an async job ID immediately so long reviews do not block UI."
    },
    {
      num: "03",
      title: "Multimodal Extraction & Routing",
      actor: "Ingestion Engine",
      desc: "PyMuPDF and pdfplumber extract raw text, tables, and layouts. Flat or rasterized images trigger Tesseract OCR. OpenCV extracts color histograms and measures logo aspect ratios. A router decides which specialist checks apply.",
      icon: <Cpu className="w-5 h-5 text-glacial" />,
      detail: "Text-only briefs bypass visual analysis to conserve compute."
    },
    {
      num: "04",
      title: "Parallel Specialist Review",
      actor: "Six AI Guardians",
      desc: "Fact, Voice, Terminology, Claims, Visual, and Accessibility Guardians run concurrently using Python asyncio. Each queries approved knowledge in ChromaDB and MongoDB, outputting standardized findings with exact citations.",
      icon: <CheckCheck className="w-5 h-5 text-glacial" />,
      detail: "Strict schema: every claim must cite document ID, version, and page quote."
    },
    {
      num: "05",
      title: "Arbiter Consolidation & Scoring",
      actor: "Risk Manager / Arbiter",
      desc: "Consolidates findings from all six guardians. Resolves overlapping flags, applies rule-based severity ratings (RED, YELLOW, GREEN), and marks unsupported assertions as Unverifiable rather than hallucinating answers.",
      icon: <Scale className="w-5 h-5 text-status-warning" />,
      detail: "Any unresolved RED finding promotes overall review to RED."
    },
    {
      num: "06",
      title: "Review Report Generation",
      actor: "NEXORA Platform",
      desc: "A comprehensive governance report is presented: overall risk status, breakdown of findings, visual bounding boxes, verbatim evidence excerpts, and side-by-side suggested corrections.",
      icon: <FileText className="w-5 h-5 text-glacial" />,
      detail: "Original text vs Suggested revision with diff highlights."
    },
    {
      num: "07",
      title: "Human Review & Decision Gate",
      actor: "Authorised Reviewer",
      desc: "Authorised brand managers or legal reviewers inspect the report. They can accept suggestions, reject with rationale, edit wording, or request revisions. Nothing publishes automatically.",
      icon: <UserCheck className="w-5 h-5 text-status-success" />,
      detail: "Human oversight is mandatory under NEXORA Core Rules."
    },
    {
      num: "08",
      title: "Precedent Archival & Registry",
      actor: "Brand Memory Engine",
      desc: "The approved creative and its verified claims are stored in the Advertisement Registry. If a reviewer made an exception or rejected an agent suggestion, their rationale is saved as a Review Precedent for future context.",
      icon: <Archive className="w-5 h-5 text-glacial" />,
      detail: "Future reviews reference past human decisions automatically."
    },
    {
      num: "09",
      title: "Continuous Advertisement Recall",
      actor: "Recall Engine",
      desc: "When a new specification sheet or policy update is approved in the Knowledge Hub, the Recall Engine identifies all registered advertisements that relied on the old facts, re-audits them, and raises prioritized alerts.",
      icon: <RotateCcw className="w-5 h-5 text-status-warning" />,
      detail: "Closes the loop: published content is protected against factual aging."
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
      <SEO
        title="How It Works — Step-by-Step Brand Governance Workflow"
        description="Discover the complete 9-phase lifecycle of NEXORA: from knowledge ingestion and admin approval gates to parallel AI auditing, human sign-off, and the recall loop."
      />

      <SectionHeader
        badge="Platform Workflow"
        title="From Document Ingestion to"
        highlight="Continuous Recall"
        description="A structured, role-based, auditable governance process designed to eliminate brand inconsistencies and factual lag."
      />

      {/* Stepper Timeline */}
      <div className="space-y-6 relative max-w-4xl mx-auto">
        {/* Vertical connector line */}
        <div className="absolute top-8 bottom-8 left-6 sm:left-8 w-0.5 bg-gradient-to-b from-glacial/40 via-glacial/20 to-transparent pointer-events-none hidden sm:block" />

        {steps.map((step) => (
          <div key={step.num} className="relative sm:pl-16">
            {/* Step Icon Badge */}
            <div className="hidden sm:flex absolute left-0 top-5 w-12 h-12 rounded-2xl glass-panel border border-glacial/30 items-center justify-center text-glacial shadow-glass-glow z-10 bg-obsidian-900">
              <span className="font-mono text-xs font-bold">{step.num}</span>
            </div>

            <Card className="hover:border-glacial/40 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-border/50">
                <div className="flex items-center gap-2.5">
                  <span className="sm:hidden font-mono text-xs text-glacial font-bold px-2 py-0.5 rounded bg-obsidian-800 border border-slate-border">
                    {step.num}
                  </span>
                  <h3 className="text-base font-semibold text-slate-text">{step.title}</h3>
                </div>
                <Badge variant="mono" size="sm">{step.actor}</Badge>
              </div>

              <div className="pt-3 space-y-3">
                <p className="text-xs sm:text-sm text-slate-muted leading-relaxed">
                  {step.desc}
                </p>
                <div className="p-2.5 rounded-lg bg-obsidian-800/80 border border-slate-border/60 text-xs font-mono text-glacial flex items-center gap-2">
                  <span className="text-slate-tertiary">Governance Guarantee:</span>
                  <span>{step.detail}</span>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="text-center pt-8">
        <Link to="/agents">
          <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Meet the Six Specialist AI Guardians
          </Button>
        </Link>
      </div>

    </div>
  );
}

function FileText(props: any) {
  return <Cpu {...props} />;
}
