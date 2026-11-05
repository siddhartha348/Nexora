import { 
  Lock, 
  ShieldCheck, 
  UserCheck, 
  FileText, 
  Database, 
  EyeOff, 
  ArrowRight
} from 'lucide-react';
import { SectionHeader } from '../components/common/SectionHeader';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { SEO } from '../components/common/SEO';

export function Security() {
  const safeguards = [
    {
      title: "Tenant-Level Data Isolation",
      badge: "Architecture",
      icon: <Database className="w-5 h-5 text-glacial" />,
      desc: "Every MongoDB query and ChromaDB vector collection is strictly namespaced by organisation ID. One enterprise's guidelines, claims, and ad creatives can never be retrieved or indexed by another."
    },
    {
      title: "JWT Authentication & Strict RBAC",
      badge: "Identity",
      icon: <Lock className="w-5 h-5 text-glacial" />,
      desc: "Role-based access controls separate permissions into five distinct tiers: Administrator, Approver (Brand/Legal), Reviewer, Creator, and Viewer. Knowledge updates require Administrator verification."
    },
    {
      title: "External AI Disclosure & Minimisation",
      badge: "Privacy",
      icon: <EyeOff className="w-5 h-5 text-status-success" />,
      desc: "Users are informed of external AI providers. Only the minimal necessary text excerpts are transmitted to cloud models (Gemini API) under zero-data-retention agreements. Air-gapped local models (Ollama) are supported for strict confidentiality."
    },
    {
      title: "Mandatory Human Oversight",
      badge: "Governance Rule",
      icon: <UserCheck className="w-5 h-5 text-glacial" />,
      desc: "Automated systems only provide decision support and evidence citations. No advertisement can ever be marked 'Approved' without direct, authenticated human reviewer action."
    },
    {
      title: "Prompt Injection Defenses",
      badge: "AI Safety",
      icon: <ShieldCheck className="w-5 h-5 text-status-warning" />,
      desc: "Uploaded creatives and extracted OCR text are treated strictly as untrusted data inputs, never as instructional prompts to the underlying LLM. System instructions are immutable and isolated."
    },
    {
      title: "Immutable Tamper-Evident Audit Logs",
      badge: "Accountability",
      icon: <FileText className="w-5 h-5 text-glacial" />,
      desc: "Every creative submission, guardian finding, reviewer modification, and admin knowledge approval is immutably logged with user identity, timestamp, and payload hash."
    }
  ];

  const rbacRoles = [
    { role: "Administrator", desc: "Manages tenant users, API gateways, and holds exclusive authority to approve updates into Official Brand Knowledge.", badge: "Highest Authority" },
    { role: "Approver (Brand/Legal)", desc: "Empowered to grant final publication sign-off on advertisements and authorize legal escalations.", badge: "Sign-Off Power" },
    { role: "Reviewer", desc: "Inspects multi-agent findings, accepts or edits corrections, comments, and records precedents into Review Memory.", badge: "Operational Review" },
    { role: "Creator / Agency", desc: "Submits creative briefs, designs, and advertisements for pre-publication audit; receives automated feedback reports.", badge: "Submission Tier" },
    { role: "Viewer", desc: "Read-only access to risk dashboards, historical analytics, and compliance trend reports (e.g. Senior Leadership).", badge: "Read-Only" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
      <SEO
        title="Security, Privacy & Responsible AI Architecture"
        description="Learn how NEXORA guarantees tenant isolation, JWT authentication, immutable audit logging, prompt-injection defense, and air-gapped local AI model options."
      />

      <SectionHeader
        badge="Responsible AI & Security"
        title="Engineered with Zero Factual Fabrication &"
        highlight="Strict Tenant Isolation"
        description="Brand governance requires uncompromising security. We treat your proprietary documents, unreleased product specs, and marketing creatives as confidential assets."
      />

      {/* Safeguards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {safeguards.map((item, idx) => (
          <Card key={idx} variant="default" className="hover:border-glacial/40 transition-colors">
            <CardHeader
              title={item.title}
              description={item.badge}
              action={<div className="p-2.5 rounded-xl bg-obsidian-800 border border-slate-border">{item.icon}</div>}
            />
            <CardContent>
              <p className="text-xs text-slate-muted leading-relaxed">
                {item.desc}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Role-Based Access Control Architecture */}
      <section className="rounded-3xl glass-panel border border-slate-border p-8 sm:p-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-border/50">
          <div>
            <h3 className="text-xl font-bold text-slate-text">Role-Based Access Control (RBAC) Matrix</h3>
            <p className="text-xs text-slate-muted mt-0.5">Enforces separation of duties across marketing, creative, and administrative staff</p>
          </div>
          <Badge variant="mono" size="sm">5 Role Definitions</Badge>
        </div>

        <div className="space-y-3">
          {rbacRoles.map((r) => (
            <div key={r.role} className="p-4 rounded-xl bg-obsidian-800/80 border border-slate-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <span className="font-semibold text-slate-text text-sm">{r.role}</span>
                <p className="text-slate-muted">{r.desc}</p>
              </div>
              <Badge variant="secondary" size="sm" className="shrink-0">{r.badge}</Badge>
            </div>
          ))}
        </div>
      </section>

      {/* Air-gapped / Local Model Commitment */}
      <section className="p-8 rounded-3xl glass-panel border border-status-success/30 bg-status-success-bg/10 space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="success" size="sm">Confidentiality Commitment</Badge>
          <span className="text-xs font-mono text-slate-muted">Model Agnostic Architecture</span>
        </div>
        <h3 className="text-lg font-bold text-slate-text">
          Zero-Training Guarantee & Optional Air-Gapped Deployment
        </h3>
        <p className="text-xs sm:text-sm text-slate-muted leading-relaxed">
          NEXORA never uses customer knowledge or creative uploads to fine-tune or train third-party machine learning models. For enterprises with sensitive pre-release IP or defense-adjacent requirements, NEXORA can be configured with local open-weights LLMs via Ollama, running entirely within your VPC or local workstation.
        </p>
      </section>

      {/* CTA */}
      <div className="text-center pt-4">
        <Link to="/contact">
          <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Request Security Whitepaper or Architecture Briefing
          </Button>
        </Link>
      </div>

    </div>
  );
}
