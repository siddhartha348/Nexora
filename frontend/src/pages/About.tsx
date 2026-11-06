import { ShieldCheck, Cpu, Database, CheckCircle2, ArrowRight } from 'lucide-react';
import { SectionHeader } from '../components/common/SectionHeader';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { SEO } from '../components/common/SEO';

export function About() {
  const architecturalPillars = [
    {
      title: "Deterministic Knowledge Base",
      subtitle: "Authoritative Single Source of Truth",
      icon: Database,
      description: "NEXORA reviews advertisements strictly against an organisation's own approved knowledge. Every fact, specification, policy, and trademark rule is verified against versioned documents approved by designated administrators.",
    },
    {
      title: "Six Specialist Guardians",
      subtitle: "Parallel Multi-Agent Architecture",
      icon: Cpu,
      description: "Six dedicated autonomous agents evaluate content concurrently: Fact, Voice, Terminology, Claims, Visual, and Accessibility Guardians. Their findings are merged and deduplicated by an intelligent Risk Manager.",
    },
    {
      title: "Human Sovereign Governance",
      subtitle: "Humans Decide — Never Auto-Approved",
      icon: ShieldCheck,
      description: "Automated checks provide explainable evidence, verbatim quotes, and actionable suggestions. Humans retain absolute sovereign control over publication, with decisions recorded in immutable Brand Memory.",
    },
  ];

  const engineeringPrinciples = [
    {
      title: "Explainability & Traceability",
      description: "Every flagged issue identifies the exact source document, version tag, page number, and verbatim clause. No black-box rejections.",
    },
    {
      title: "Proactive Recall Loop",
      description: "When brand knowledge evolves, the Advertisement Recall Engine identifies affected published creatives and alerts brand stewards before reputational drift occurs.",
    },
    {
      title: "Enterprise Multi-Tenant Isolation",
      description: "Rigorous organizational data partitioning ensures confidential brand assets, specifications, and audit histories remain strictly compartmentalized.",
    },
    {
      title: "Brand Memory Precedents",
      description: "Reviewer decisions and approved nuances form contextual precedents for future reviews without ever overriding official policy.",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
      <SEO
        title="About NEXORA — Enterprise Brand Governance Architecture"
        description="NEXORA reviews advertisements before publication against an organisation's own approved knowledge, using six specialist agents, risk synthesis, and human sovereign review."
      />

      {/* Header */}
      <SectionHeader
        badge="About NEXORA"
        title="Enterprise Brand Governance Built for"
        highlight="Absolute Evidence & Human Control"
        description="NEXORA prevents brand inconsistency, factual drift, and unsubstantiated claims by reviewing creative assets against approved enterprise knowledge before publication."
      />

      {/* Mission & Product Definition */}
      <div className="rounded-3xl glass-panel border border-slate-border p-8 sm:p-10 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-border/50">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase text-slate-tertiary">Product Definition</span>
            <h3 className="text-xl font-bold text-slate-text">Autonomous Pre-Publication Brand Governance</h3>
          </div>
          <div className="space-y-1 sm:text-right">
            <span className="text-xs font-mono uppercase text-slate-tertiary">Core Operating Standard</span>
            <p className="text-lg font-semibold text-glacial">Zero Automated Overrides</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-muted">
          <div>
            <h4 className="font-semibold text-slate-text mb-1">The Dilemma</h4>
            <p>Growing organisations deploy content through diverse teams, marketing agencies, and generative AI tools, causing specifications to drift and warranties to conflict.</p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-text mb-1">The Verification Engine</h4>
            <p>Six specialized guardians inspect content in parallel against verified brand documents, highlighting precise contradictions and tone drift.</p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-text mb-1">Continuous Lifecycle</h4>
            <p>The Advertisement Recall Engine completes the governance loop, actively monitoring live assets against subsequent knowledge revisions.</p>
          </div>
        </div>
      </div>

      {/* Architectural Pillars */}
      <section className="space-y-10">
        <SectionHeader
          badge="Architectural Pillars"
          title="Engineered for"
          highlight="Enterprise Precision"
          description="A decoupled, high-throughput microservices architecture delivering verifiable brand integrity."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {architecturalPillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <Card key={pillar.title} className="flex flex-col justify-between">
                <div>
                  <CardHeader 
                    title={pillar.title} 
                    description={pillar.subtitle}
                    action={
                      <div className="w-10 h-10 rounded-xl bg-glacial/15 border border-glacial/30 flex items-center justify-center text-glacial">
                        <Icon className="w-5 h-5" />
                      </div>
                    }
                  />
                  <CardContent>
                    <p className="text-xs text-slate-muted leading-relaxed">
                      {pillar.description}
                    </p>
                  </CardContent>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-border/50 text-[11px] font-mono text-glacial flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Production Standard</span>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Core Engineering Principles */}
      <section className="space-y-8">
        <SectionHeader
          badge="Design Standards"
          title="Guiding"
          highlight="System Principles"
          description="Every component of NEXORA adheres to verifiable, explainable, and responsible enterprise governance."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {engineeringPrinciples.map((item, idx) => (
            <div key={idx} className="p-6 rounded-2xl glass-panel border border-slate-border/80 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-glacial">0{idx + 1}.</span>
                <h4 className="font-bold text-slate-text text-sm">{item.title}</h4>
              </div>
              <p className="text-xs text-slate-muted leading-relaxed pl-6">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Honest Scope & Responsible AI Disclaimer */}
      <section className="p-8 rounded-3xl glass-panel border border-status-warning/30 bg-status-warning-bg/10 space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="warning" size="sm">Honest Positioning Declaration</Badge>
          <span className="text-xs font-mono text-slate-muted">Platform Boundaries</span>
        </div>
        <h3 className="text-lg font-bold text-slate-text">
          NEXORA Supports Human Reviewers — It Does Not Guarantee Legal Compliance
        </h3>
        <p className="text-xs sm:text-sm text-slate-muted leading-relaxed">
          NEXORA is a precision governance decision-support tool. Automated audits identify discrepancies, unsupported promotional claims, and visual inconsistencies against an organisation&apos;s own approved repository. GREEN indicates no critical issues were detected by the automated checks performed; it does not constitute legal certification or absolute factual certainty. Final publication approval always rests with human brand authorities.
        </p>
      </section>

      {/* CTA */}
      <div className="text-center pt-4">
        <Link to="/features">
          <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Explore Complete Feature Architecture
          </Button>
        </Link>
      </div>

    </div>
  );
}
