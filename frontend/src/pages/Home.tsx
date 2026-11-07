import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles, 
  FileText, 
  RotateCcw, 
  CheckCircle2, 
  Layers, 
  Eye, 
  Check, 
  ChevronRight,
  Scale,
  ShieldCheck,
  Cpu,
  UserCheck,
  LayoutDashboard
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { StatusIndicator } from '../components/ui/StatusIndicator';
import { SectionHeader } from '../components/common/SectionHeader';
import { Accordion } from '../components/common/Accordion';
import { SEO } from '../components/common/SEO';
import { useAuth } from '../context/AuthContext';

export function Home() {
  const { user, isAuthenticated } = useAuth();

  const problems = [
    { title: "Incorrect Product Specs", desc: "Advertisements quote battery life, dimensions, or capabilities the product lacks.", badge: "Fact Drift" },
    { title: "Outdated Warranties & Pricing", desc: "Campaign creatives circulate quoting last season's pricing or expired warranty terms.", badge: "Version Lag" },
    { title: "Unsupported Promotional Claims", desc: "Superlatives like 'Fastest in class' or '100% unbreakable' with zero legal evidence on file.", badge: "Claims Risk" },
    { title: "Tone & Voice Inconsistency", desc: "Agency and freelance creatives alternate between overly formal or erratic casual tone.", badge: "Voice Drift" },
    { title: "Off-Palette Colours & Misused Logos", desc: "Distorted logo aspect ratios and slight hexadecimal color drift bypassing human eyes.", badge: "Visual Brand" },
    { title: "Zero Traceability to Sources", desc: "Reviewers cannot pinpoint which document, page, or version justifies an advertised claim.", badge: "Compliance Void" }
  ];

  const workflowSteps = [
    {
      num: "01",
      title: "Brand Knowledge Hub & Quarantine Gate",
      actor: "Brand Admin",
      desc: "Upload specification sheets, guidelines, trademark rosters, and official color hex palettes. Every document enters an isolated quarantine gate until formally validated by an Administrator, ensuring draft documents never pollute AI audits.",
      icon: <ShieldCheck className="w-5 h-5 text-glacial" />
    },
    {
      num: "02",
      title: "Multimodal Creative Extraction",
      actor: "Ingestion Engine",
      desc: "Submit advertisements via PDF, DOCX, PPTX, PNG, JPG, or verified public URLs. Text extraction, table parsing, Tesseract OCR, and OpenCV color & contrast measurement run automatically.",
      icon: <Cpu className="w-5 h-5 text-glacial" />
    },
    {
      num: "03",
      title: "Six Specialist AI Guardians (In Parallel)",
      actor: "6 AI Guardians",
      desc: "Fact, Voice, Terminology, Claims, Visual, and Accessibility Guardians run concurrently via asynchronous pipelines. Findings return in a standardized schema quoting exact source document, version, and page number.",
      icon: <Layers className="w-5 h-5 text-glacial" />
    },
    {
      num: "04",
      title: "Risk Manager Arbiter Consolidation",
      actor: "Risk Arbiter",
      desc: "Deduplicates cross-agent overlap, resolves conflicting advice, and assigns deterministic severity ratings (RED, YELLOW, GREEN). Missing evidence is marked strictly as Unverifiable—never hallucinated.",
      icon: <Scale className="w-5 h-5 text-status-warning" />
    },
    {
      num: "05",
      title: "Mandatory Human Review & Decision Gate",
      actor: "Authorized Reviewer",
      desc: "Nothing publishes or approves automatically. Human reviewers inspect side-by-side diffs, accept or reject suggestions, and sign off. Every human decision forms Brand Memory precedents for future reviews.",
      icon: <UserCheck className="w-5 h-5 text-status-success" />
    },
    {
      num: "06",
      title: "Active Advertisement Recall Engine",
      actor: "Recall Engine",
      desc: "When a specification updates in the Knowledge Hub (e.g., warranty changes from 3 to 2 years), the Recall Engine diffs the delta, finds all live ads in the Registry citing that fact, and triggers prioritized recall alerts.",
      icon: <RotateCcw className="w-5 h-5 text-status-warning" />
    }
  ];

  const agents = [
    { name: "Fact Guardian", role: "Specifications & Specs", desc: "Extracts factual claims and cross-verifies against approved product sheets and spec tables.", icon: <FileText className="w-5 h-5 text-glacial" />, status: "Supported / Contradicted" },
    { name: "Voice Guardian", role: "Tone & Messaging", desc: "Maintains brand persona, audience empathy, and style guidelines while preserving creator intent.", icon: <Sparkles className="w-5 h-5 text-status-warning" />, status: "Tone Consistency" },
    { name: "Terminology Guardian", role: "Lexicon & Trademarks", desc: "Detects prohibited terms, restricted phrases, and enforces canonical trademark terminology.", icon: <CheckCircle2 className="w-5 h-5 text-status-success" />, status: "Approved Alternatives" },
    { name: "Claims Guardian", role: "Superlatives & Legal", desc: "Scrutinizes numerical, comparative, and superlative claims; flags mandatory legal reviews.", icon: <Scale className="w-5 h-5 text-status-critical" />, status: "Substantiation Check" },
    { name: "Visual Guardian", role: "Logo, Color & Layout", desc: "Measures logo clearspace, aspect ratios, and extracts color palette hex values via OpenCV.", icon: <Eye className="w-5 h-5 text-glacial" />, status: "Delta-E Hex Check" },
    { name: "Accessibility Guardian", role: "WCAG & Readability", desc: "Evaluates text-to-background contrast ratios and Flesch-Kincaid structural readability scores.", icon: <Layers className="w-5 h-5 text-glacial-200" />, status: "WCAG 2.1 AA" },
  ];

  const homeFaqs = [
    {
      id: "faq-1",
      question: "How does NEXORA differ from standard grammar or proofreading tools?",
      answer: "Traditional proofreaders only check general language syntax and grammar. NEXORA is an evidence-based governance platform: it checks advertisements against your organization's approved, versioned knowledge (spec sheets, brand guides, terminology lists, and color palettes). Furthermore, NEXORA re-checks previously published ads whenever company knowledge updates."
    },
    {
      id: "faq-2",
      question: "How does the Advertisement Recall Engine work under the workflow?",
      answer: "The Recall Engine is the closing stage of the governance workflow: when an approved spec sheet changes in the Knowledge Hub, the engine diffs the change against earlier versions, searches the Advertisement Registry for live creatives quoting that fact, and raises high-priority recall alerts."
    },
    {
      id: "faq-3",
      question: "Does NEXORA automatically approve advertisements?",
      answer: "No. A fundamental engineering rule of NEXORA is that nothing is approved automatically. Automated systems synthesize findings with exact citations and confidence ratings, but final sign-off is always held by authorized human reviewers."
    },
    {
      id: "faq-4",
      question: "How is company knowledge kept secure and confidential?",
      answer: "NEXORA enforces strict organization-level data isolation in MongoDB and ChromaDB. Client proprietary knowledge is never used to train external LLMs, and zero-retention API configurations or local air-gapped models (Ollama) can be deployed."
    }
  ];

  return (
    <div className="space-y-24 sm:space-y-32 pb-20">
      <SEO 
        title="AI-Powered Evidence-Based Brand Governance"
        description="NEXORA audits marketing advertisements against authoritative company knowledge with six specialist AI agents, human oversight, and active Advertisement Recall."
      />

      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-8 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded bg-obsidian-850 border-2 border-slate-border text-xs text-glacial font-bold shadow-neo font-mono">
            <span className="w-2 h-2 rounded-full bg-status-success border border-black" />
            <span>[ NEO-BRUTALIST GOVERNANCE ]</span>
            <span className="text-slate-border">•</span>
            <span className="text-slate-muted">Autonomous Multi-Agent Verification</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-text tracking-tight max-w-5xl mx-auto leading-[1.1]">
            Evidence-Based <br className="hidden sm:inline" />
            <span className="text-glacial bg-neo-yellow px-3 py-0.5 rounded border-3 border-black text-black inline-block my-1 shadow-neo">
              Brand Governance
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-muted max-w-3xl mx-auto leading-relaxed">
            NEXORA reviews advertisements before publication against your organisation’s approved facts, guidelines, terminology, and visual identity with six parallel specialist AI guardians, human review gates, and active Advertisement Recall.
          </p>

          {/* Conditional Role-Aware Action Bar */}
          {isAuthenticated && user ? (
            <div className={`p-5 rounded-xl border-3 border-black max-w-2xl mx-auto shadow-neo-lg flex flex-col sm:flex-row items-center justify-between gap-4 text-left ${
              user.role === 'ADMIN' ? 'bg-neo-purple/15 border-neo-purple' :
              user.role === 'APPROVER' ? 'bg-neo-mint/15 border-neo-mint' :
              user.role === 'REVIEWER' ? 'bg-neo-yellow/15 border-neo-yellow' :
              user.role === 'CREATOR' ? 'bg-neo-pink/15 border-neo-pink' :
              'bg-obsidian-850'
            }`}>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs border-2 border-black shadow-neo-sm ${
                    user.role === 'ADMIN' ? 'bg-neo-purple text-white' :
                    user.role === 'APPROVER' ? 'bg-neo-mint text-black' :
                    user.role === 'REVIEWER' ? 'bg-neo-yellow text-black' :
                    user.role === 'CREATOR' ? 'bg-neo-pink text-white' :
                    'bg-glacial text-black'
                  }`}>
                    {user.role} WORKSPACE
                  </span>
                  <span className="text-sm font-mono text-slate-text font-bold">{user.full_name}</span>
                </div>
                <p className="text-xs text-slate-muted mt-1.5 leading-relaxed">
                  {user.role === 'ADMIN' && 'Complete System Governance • Knowledge Gates • Tenant & User Control • Policy Management'}
                  {user.role === 'APPROVER' && 'Executive Sign-Off Desk • Knowledge Version Clearances • Recall Interventions'}
                  {user.role === 'REVIEWER' && 'Active Audit Review • Citation Checking • Decision Precedents & Exception Recording'}
                  {user.role === 'CREATOR' && 'Creative Ingestion • Upload PDF/DOCX/Images • 6-Guardian Rapid Feedback'}
                  {user.role === 'VIEWER' && 'Stakeholder Auditor View • Read-Only Compliance Analytics & Audit Trails'}
                </p>
              </div>
              <Link to="/app/dashboard" className="shrink-0 w-full sm:w-auto">
                <Button variant="primary" size="md" className="w-full sm:w-auto" rightIcon={<LayoutDashboard className="w-4 h-4" />}>
                  Enter {user.role} Portal
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link to="/how-it-works">
                <Button variant="primary" size="lg" className="bg-neo-blue text-white shadow-neo hover:translate-x-0.5" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Explore How It Works
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="border-3 border-black shadow-neo bg-surface">
                  Sign In to Platform
                </Button>
              </Link>
            </div>
          )}

          {/* Central Product Review Canvas Preview */}
          <div className="pt-10 max-w-5xl mx-auto">
            <div className="rounded-xl glass-panel border border-cyber-border p-2 sm:p-4 shadow-cyber-panel text-left relative cyber-frame">
              <div className="flex items-center justify-between pb-3 px-3 border-b border-cyber-border/40 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-status-critical shadow-sm" />
                  <div className="w-2.5 h-2.5 rounded-full bg-status-warning shadow-sm" />
                  <div className="w-2.5 h-2.5 rounded-full bg-status-success shadow-sm" />
                  <span className="ml-2 font-mono text-cyber-cyan text-[11px]">// CANVAS_AUDIT: #AD-AURORA-X2</span>
                </div>
                <StatusIndicator level="RED" label="1 Critical Contradiction Detected" size="sm" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 text-xs">
                {/* Creative Simulation */}
                <div className="md:col-span-5 p-4 rounded-xl bg-obsidian-900/90 border border-slate-border space-y-3">
                  <Badge variant="mono" size="sm">[ INGESTED CREATIVE // PDF ]</Badge>
                  <p className="text-sm font-medium text-slate-text italic border-l-2 border-status-critical pl-3 py-1 font-sans">
                    &quot;Experience Aurora X2: up to 7 days of active battery life with our industry-exclusive 5-year warranty.&quot;
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-tertiary font-mono pt-2 border-t border-slate-border/40">
                    <span>EXTRACT: PYMUPDF</span>
                    <span className="text-cyber-cyan">CONFIDENCE: 98.4%</span>
                  </div>
                </div>

                {/* Evidence Citation */}
                <div className="md:col-span-7 p-4 rounded-xl bg-cyber-panel/90 border border-cyber-cyan/40 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <Badge variant="critical" size="sm">Contradiction with Approved Fact</Badge>
                    <span className="text-[11px] font-mono text-cyber-cyan">RAG_REF: #SPEC-DOC-409</span>
                  </div>
                  <p className="text-xs text-slate-muted leading-relaxed">
                    <strong className="text-slate-text">Fact Guardian Evidence:</strong> Aurora X2 specification sheet <span className="font-mono text-cyber-cyan">v3.2, p.4</span> states battery life is <strong className="text-slate-text">up to 5 days</strong> and standard warranty is <strong className="text-slate-text">2 years</strong>.
                  </p>
                  <div className="p-2.5 rounded-lg bg-obsidian-950/90 border border-cyber-border">
                    <span className="text-[10px] uppercase font-mono text-slate-tertiary block">// Suggested Approved Revision:</span>
                    <span className="text-xs text-status-success font-medium font-mono">
                      &quot;Experience Aurora X2: up to 5 days of active battery life with our 2-year warranty.&quot;
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Structured How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <SectionHeader
          badge="Platform Architecture"
          title="How It Works:"
          highlight="The Complete 6-Stage Governance Loop"
          description="NEXORA replaces opaque manual reviews with an end-to-end, evidence-traceable lifecycle from initial document quarantine through active advertisement recall."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflowSteps.map((step, idx) => {
            const cardColors = [
              'bg-neo-yellow/10 border-neo-yellow',
              'bg-neo-mint/10 border-neo-mint',
              'bg-neo-purple/10 border-neo-purple',
              'bg-neo-coral/10 border-neo-coral',
              'bg-neo-pink/10 border-neo-pink',
              'bg-neo-blue/10 border-neo-blue',
            ];
            const badgeColors = [
              'bg-neo-yellow text-black',
              'bg-neo-mint text-black',
              'bg-neo-purple text-white',
              'bg-neo-coral text-white',
              'bg-neo-pink text-white',
              'bg-neo-blue text-white',
            ];

            return (
              <div 
                key={step.num}
                className={`p-6 rounded-xl border-3 border-black shadow-neo hover:translate-x-0.5 hover:translate-y-0.5 transition-all bg-surface ${cardColors[idx % cardColors.length]}`}
              >
                <div className="flex items-center justify-between pb-3 border-b-2 border-black/20">
                  <span className="font-mono text-xs font-extrabold text-slate-tertiary">STAGE_{step.num}</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border-2 border-black shadow-neo-sm ${badgeColors[idx % badgeColors.length]}`}>
                    {step.actor}
                  </span>
                </div>
                <div className="pt-3 space-y-2">
                  <h3 className="font-bold text-base text-slate-text">{step.title}</h3>
                  <p className="text-xs text-slate-muted leading-relaxed">
                    {step.desc}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t-2 border-black/10 flex items-center justify-between text-[11px] font-mono text-slate-tertiary">
                  <span>STEP // {step.num}</span>
                  <div className="p-1.5 rounded bg-surface border-2 border-black shadow-neo-sm">
                    {step.icon}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center pt-2">
          <Link to="/how-it-works">
            <Button variant="outline" size="md" rightIcon={<ChevronRight className="w-4 h-4" />}>
              View Detailed Technical Workflow Specification
            </Button>
          </Link>
        </div>
      </section>

      {/* Problem Statement Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <SectionHeader
          badge="The Governance Dilemma"
          title="Why Advertisements Fail"
          highlight="Brand Consistency"
          description="Advertisements are published by internal marketing teams, external agencies, freelancers, and AI generators. As volume explodes, keeping every asset synchronized with company knowledge becomes mathematically impossible without automated evidence auditing."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((prob, idx) => {
            const colors = [
              'bg-neo-coral/10 border-neo-coral',
              'bg-neo-yellow/15 border-neo-yellow',
              'bg-neo-pink/15 border-neo-pink',
              'bg-neo-purple/15 border-neo-purple',
              'bg-neo-blue/10 border-neo-blue',
              'bg-neo-mint/15 border-neo-mint',
            ];
            const badges = [
              'bg-neo-coral text-white',
              'bg-neo-yellow text-black',
              'bg-neo-pink text-white',
              'bg-neo-purple text-white',
              'bg-neo-blue text-white',
              'bg-neo-mint text-black',
            ];

            return (
              <div 
                key={idx} 
                className={`p-6 rounded-xl border-3 border-black shadow-neo hover:translate-x-0.5 hover:translate-y-0.5 transition-all bg-surface ${colors[idx % colors.length]}`}
              >
                <div className="flex items-center justify-between pb-3 border-b-2 border-black/20">
                  <span className="font-mono text-xs font-extrabold text-slate-tertiary">RISK_VECTOR_0{idx + 1}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border-2 border-black shadow-neo-sm ${badges[idx % badges.length]}`}>
                    [{prob.badge}]
                  </span>
                </div>
                <div className="pt-3 space-y-2">
                  <h3 className="font-bold text-base text-slate-text">{prob.title}</h3>
                  <p className="text-xs text-slate-muted leading-relaxed">
                    {prob.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* The Central Principle */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded bg-obsidian-850 border-2 border-slate-border p-8 sm:p-12 relative shadow-neo-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7 space-y-4">
              <Badge variant="primary" dot size="sm">Central Architectural Principle</Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-text">
                Every Finding Must Be Explainable, Traceable to Evidence, and <span className="text-glacial">Subject to Human Review</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-muted leading-relaxed">
                NEXORA is not a proofreader or a creative writing generator. It is a strict governance gate. It takes incoming creatives and simultaneously evaluates them across six specialized dimensions against your Brand Knowledge Hub.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2 font-mono text-xs text-slate-text">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-glacial" />
                  <span>Exact Document Citation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-glacial" />
                  <span>Admin-Approved Knowledge</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-glacial" />
                  <span>Continuous Recall Engine</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-glacial" />
                  <span>Human Decision Precedents</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 p-6 rounded-2xl bg-obsidian-900/90 border border-slate-border space-y-4">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-tertiary">Traceability Standard</h4>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-lg bg-obsidian-800 border border-slate-border/60">
                  <span className="text-slate-tertiary block font-mono text-[10px]">Citation Rule:</span>
                  <span className="text-slate-text font-medium">Source Document Title + Version Tag + Page Number + Verbatim Approved Quote</span>
                </div>
                <div className="p-3 rounded-lg bg-obsidian-800 border border-slate-border/60">
                  <span className="text-slate-tertiary block font-mono text-[10px]">Unverifiable Fallback:</span>
                  <span className="text-slate-text font-medium">If no authoritative evidence is found, the finding is classified as Unverifiable—never hallucinated.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Six Specialist Agents Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <SectionHeader
          badge="Multi-Agent Concurrency"
          title="Six Specialist Guardians"
          highlight="Running in Parallel"
          description="Rather than relying on a single monolithic prompt, NEXORA orchestrates six dedicated AI agents concurrently via Python asyncio, each focused on a discrete brand pillar."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent, idx) => (
            <Card key={idx} variant="cyber" className="hover:border-cyber-cyan transition-all">
              <CardHeader 
                title={agent.name}
                description={agent.role}
                telemetry={`GUARD_CORE_0${idx + 1}`}
                action={<div className="p-2 rounded-lg bg-obsidian-850 border border-cyber-border/60 shadow-sm">{agent.icon}</div>}
              />
              <CardContent className="space-y-3">
                <p className="text-xs text-slate-muted leading-relaxed">
                  {agent.desc}
                </p>
                <div className="pt-2 border-t border-cyber-border/40 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-tertiary">TELEMETRY_SPEC:</span>
                  <span className="text-cyber-cyan">{agent.status}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center pt-2">
          <Link to="/agents">
            <Button variant="outline" size="md" rightIcon={<ChevronRight className="w-4 h-4" />}>
              Deep Dive into Guardian Prompts & Schemas
            </Button>
          </Link>
        </div>
      </section>

      {/* Human Approval & Review Precedents Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <SectionHeader
          badge="Human In The Loop"
          title="Review Memory Engine"
          highlight="Without Uncontrolled Drift"
          description="Human feedback influences future agent recommendations without ever silently rewriting official company policy. Discover how NEXORA separates Review Memory from Official Brand Knowledge."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader title="Review Memory (Precedents)" description="Created automatically from authorized human reviewer actions" />
            <CardContent className="space-y-3 text-xs text-slate-muted">
              <p>
                When a reviewer accepts or rejects a suggestion (for example, allowing a festive wording variation during a holiday campaign), the decision is stored as a <strong>Review Precedent</strong> in ChromaDB.
              </p>
              <div className="p-3 rounded-xl bg-obsidian-800 border border-slate-border font-mono text-[11px] text-slate-text">
                Role: Contextual guidance provided to later reviewers facing similar phrasing.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Official Brand Knowledge" description="Immutable governance baseline strictly gated by Administrators" />
            <CardContent className="space-y-3 text-xs text-slate-muted">
              <p>
                Official knowledge comprises versioned guidelines, verified facts, and formal policies. Reviewers cannot alter this baseline during a review.
              </p>
              <div className="p-3 rounded-xl bg-obsidian-800 border border-slate-border font-mono text-[11px] text-glacial">
                Role: The only authoritative evidence used to verify claims and calculate severity.
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <SectionHeader
          badge="Frequently Asked Questions"
          title="Everything You Need to Know About"
          highlight="NEXORA"
          description="Clear answers regarding our architecture, RAG pipelines, model independence, and governance principles."
        />

        <Accordion items={homeFaqs} />

        <div className="text-center pt-4">
          <Link to="/faq" className="text-xs text-glacial hover:underline flex items-center justify-center gap-1">
            <span>View All Platform & Technical FAQs</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl glass-panel border border-glacial/40 p-8 sm:p-12 text-center space-y-6 shadow-glass-glow relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-text">
              Ready to Secure Your Brand Governance?
            </h2>
            <p className="text-xs sm:text-sm text-slate-muted leading-relaxed">
              Connect with our technical team to schedule an architecture walkthrough or explore enterprise deployment.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/contact">
              <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Connect With Engineering
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="outline" size="lg">
                About NEXORA Architecture
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
