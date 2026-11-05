import { CheckCircle2, ArrowRight } from 'lucide-react';
import { SectionHeader } from '../components/common/SectionHeader';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { SEO } from '../components/common/SEO';

export function About() {
  const members = [
    {
      name: "Vadlapudi Siddhartha",
      role: "Lead Architect & AI Intelligence",
      workstream: "FastAPI backend, multi-agent asyncio orchestration, RAG pipeline, Fact & Claims Guardians, Risk Manager / Arbiter, Recall Engine change-detection logic, database integration.",
      initials: "VS",
    },
    {
      name: "Diviti Sri Vyshnavi",
      role: "Frontend Architect & Brand Memory",
      workstream: "React & Vite frontend platform, dark glassmorphism design system, Voice & Terminology Guardians, human review and approval workflows, Brand Memory Engine precedents.",
      initials: "DV",
    },
    {
      name: "Mokshitha Venati",
      role: "Visual Intelligence & Document Processing",
      workstream: "Knowledge Hub ingestion pipeline, PDF / DOCX / PPTX processing, OpenCV color & logo extraction, Visual & Accessibility Guardians, Advertisement Registry.",
      initials: "MV",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
      <SEO
        title="About NEXORA & Team PINNACLE"
        description="Learn about NEXORA, developed by Team PINNACLE for the Code Nexus Hackathon under the problem statement provided by Inkloom AI."
      />

      {/* Header */}
      <SectionHeader
        badge="About NEXORA"
        title="Building Evidence-Driven Brand Governance for"
        highlight="Code Nexus"
        description="NEXORA was designed and developed by Team PINNACLE to solve the persistent brand consistency and factual drift dilemma facing growing organisations."
      />

      {/* Hackathon Context Card */}
      <div className="rounded-3xl glass-panel border border-slate-border p-8 sm:p-10 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-border/50">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase text-slate-tertiary">Hackathon Event</span>
            <h3 className="text-xl font-bold text-slate-text">Code Nexus Hackathon</h3>
          </div>
          <div className="space-y-1 sm:text-right">
            <span className="text-xs font-mono uppercase text-slate-tertiary">Problem Provider</span>
            <p className="text-lg font-semibold text-glacial">Inkloom AI</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-muted">
          <div>
            <h4 className="font-semibold text-slate-text mb-1">Project Category</h4>
            <p>AI-Powered Brand Governance & Multimodal Content Auditing Platform.</p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-text mb-1">The Core Challenge</h4>
            <p>Prevent unverified claims, outdated warranties, off-brand tone, and off-palette assets from reaching the public.</p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-text mb-1">Deliberate Scope Change</h4>
            <p className="text-status-warning">Advertisement Recall Engine has been brought forward into active production scope.</p>
          </div>
        </div>
      </div>

      {/* Team PINNACLE Section */}
      <section className="space-y-10">
        <SectionHeader
          badge="Team PINNACLE"
          title="Meet the"
          highlight="Engineers & Designers"
          description="Three collaborative workstreams engineered in parallel with unified JSON schemas and decoupled services."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {members.map((member) => (
            <Card key={member.name} className="flex flex-col justify-between">
              <div>
                <CardHeader 
                  title={member.name} 
                  description={member.role}
                  action={
                    <div className="w-10 h-10 rounded-xl bg-glacial/15 border border-glacial/30 flex items-center justify-center text-glacial font-bold text-sm">
                      {member.initials}
                    </div>
                  }
                />
                <CardContent>
                  <div className="space-y-2 text-xs">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-tertiary">Primary Deliverables:</span>
                    <p className="text-slate-muted leading-relaxed">
                      {member.workstream}
                    </p>
                  </div>
                </CardContent>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-border/50 text-[11px] font-mono text-glacial flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active Workstream Owner</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Honest Scope & Responsible AI Disclaimer */}
      <section className="p-8 rounded-3xl glass-panel border border-status-warning/30 bg-status-warning-bg/10 space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="warning" size="sm">Honest Development Scope</Badge>
          <span className="text-xs font-mono text-slate-muted">Responsible Engineering Declaration</span>
        </div>
        <h3 className="text-lg font-bold text-slate-text">
          NEXORA Supports Human Reviewers — It Does Not Guarantee Legal Compliance
        </h3>
        <p className="text-xs sm:text-sm text-slate-muted leading-relaxed">
          The team does not offer legal advice. Automated audits are decision-support instruments designed to highlight discrepancies, missing substantiations, and visual drifts against your authoritative repository. Final publication authorization remains solely with certified human stakeholders.
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
