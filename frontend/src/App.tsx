import { useState } from 'react';
import { 
  Button, 
  Input, 
  Select, 
  Card, 
  CardHeader, 
  CardContent, 
  Badge, 
  StatusIndicator, 
  Modal, 
  Tooltip, 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell,
  Tabs, 
  ToastProvider, 
  useToast, 
  CardSkeleton,
  EmptyState, 
  ErrorState, 
  Navigation 
} from './components/ui';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Search, 
  Copy, 
  Sparkles, 
  Check, 
  Zap, 
  Eye, 
  FileText
} from 'lucide-react';

function DesignSystemGallery() {
  const { toast } = useToast();
  const [activeNavTab, setActiveNavTab] = useState('overview');
  const [selectedPillTab, setSelectedPillTab] = useState('all');
  const [selectValue, setSelectValue] = useState('gemini-2.5');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const colors = [
    { name: 'Obsidian Black', hex: '#050707', role: 'Primary Background' },
    { name: 'Glacial Ice Blue', hex: '#A0C0D0', role: 'Primary Brand Accent' },
    { name: 'Deep Surface', hex: '#0A1012', role: 'Panels & Navigation' },
    { name: 'Card Surface', hex: '#10191D', role: 'Elevated Glass Cards' },
    { name: 'Ice White', hex: '#EDF4F6', role: 'Primary Typography' },
    { name: 'Muted Slate', hex: '#A6B4BA', role: 'Secondary Text' },
    { name: 'Subtle Slate', hex: '#72838A', role: 'Borders & Metadata' },
    { name: 'Critical Red', hex: '#E36F70', role: 'Contradiction / RED' },
    { name: 'Warning Gold', hex: '#D9AE68', role: 'Inconsistency / YELLOW' },
    { name: 'Success Mint', hex: '#82B9A0', role: 'Compliant / GREEN' },
  ];

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    toast.info('Color Copied', `Copied ${hex} to clipboard`);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const handleSimulateReview = () => {
    setButtonLoading(true);
    toast.info('Multi-Agent Audit Started', '6 Guardian agents evaluating creative in parallel...');
    setTimeout(() => {
      setButtonLoading(false);
      toast.critical('Audit Completed', 'Found 1 critical specification conflict and 1 tone deviation.');
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-obsidian flex flex-col">
      {/* Top Header Navigation */}
      <Navigation
        activeTab={activeNavTab}
        onSelectTab={(tab) => {
          setActiveNavTab(tab);
          toast.info('Navigation Switched', `Switched view to ${tab}`);
        }}
        breadcrumbs={['NEXORA Framework', 'Design System Spec', 'Phase 1 UI/UX']}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        
        {/* Hero Section */}
        <div className="relative rounded-3xl p-8 sm:p-10 glass-panel overflow-hidden border border-slate-border">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-glacial/5 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-20 w-64 h-64 rounded-full bg-glacial/10 blur-2xl pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge variant="primary" dot size="sm">Phase 1 Design System</Badge>
              <Badge variant="mono" size="sm">Tailwind CSS + Glassmorphism</Badge>
              <Badge variant="secondary" size="sm">WCAG 2.1 AA Compliant</Badge>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-text tracking-tight">
              Evidence-Based Brand Governance <span className="text-glacial">Design Tokens & Components</span>
            </h1>
            
            <p className="text-sm sm:text-base text-slate-muted leading-relaxed">
              Engineered with Obsidian Black (<span className="font-mono text-glacial">#050707</span>), Glacial Ice Blue (<span className="font-mono text-glacial">#A0C0D0</span>), 
              and precision status tokens. Crafted for human-in-the-loop review, multi-agent observability, and brand recall alerts.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button 
                variant="primary" 
                size="md" 
                onClick={handleSimulateReview} 
                isLoading={buttonLoading}
                leftIcon={<Zap className="w-4 h-4 text-obsidian" />}
              >
                Test Audit Feedback
              </Button>
              <Button 
                variant="secondary" 
                size="md"
                onClick={() => setIsModalOpen(true)}
                leftIcon={<Eye className="w-4 h-4 text-glacial" />}
              >
                Inspect Modal Dialog
              </Button>
            </div>
          </div>
        </div>

        {/* Section 1: Color Palette & Design Tokens */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-border/50 pb-3">
            <div>
              <h2 className="text-xl font-bold text-slate-text tracking-tight flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-glacial" />
                Color Palette & Tokens
              </h2>
              <p className="text-xs text-slate-muted mt-0.5">Click any swatch to copy its hexadecimal token</p>
            </div>
            <span className="text-xs font-mono text-slate-tertiary">10 Approved Tokens</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {colors.map((c) => (
              <div
                key={c.hex}
                onClick={() => copyToClipboard(c.hex)}
                className="group relative p-3.5 rounded-xl border border-slate-border bg-obsidian-700/60 backdrop-blur-md cursor-pointer hover:border-glacial/40 hover:bg-obsidian-600/60 transition-all duration-200 select-none"
              >
                <div 
                  className="w-full h-14 rounded-lg mb-3 shadow-inner flex items-center justify-center border border-white/5 relative overflow-hidden" 
                  style={{ backgroundColor: c.hex }}
                >
                  {copiedColor === c.hex ? (
                    <span className="bg-obsidian-950/80 px-2 py-1 rounded text-[11px] font-mono text-glacial flex items-center gap-1">
                      <Check className="w-3 h-3" /> Copied
                    </span>
                  ) : (
                    <Copy className="w-4 h-4 opacity-0 group-hover:opacity-60 text-slate-text transition-opacity" />
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-text truncate">{c.name}</p>
                <p className="text-[11px] font-mono text-slate-muted mt-0.5">{c.hex}</p>
                <p className="text-[10px] text-slate-tertiary mt-1 truncate">{c.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Typography & Status Indicators */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Typography Card */}
          <Card>
            <CardHeader 
              title="Typography System" 
              description="Inter for interface legibility, JetBrains Mono for evidence references" 
            />
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-obsidian-800/80 border border-slate-border/60 space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-tertiary">Inter Sans-Serif</span>
                <p className="text-base font-semibold text-slate-text">
                  The quick brown fox jumps over the lazy dog.
                </p>
                <p className="text-xs text-slate-muted">
                  Used for primary headers, navigation menus, agent explanations, human feedback, and workflow decisions.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-obsidian-800/80 border border-slate-border/60 space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-glacial">JetBrains Mono Monospace</span>
                <p className="text-sm font-mono text-slate-text font-medium">
                  AURORA-X2: SPEC-v3.2 // CLAIM_ID: #CLM-90214 [DELTA: -28.4%]
                </p>
                <p className="text-xs text-slate-muted font-mono">
                  Used for document versions, exact quote excerpts, page numbers, color hex codes, and confidence scores.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Governance Severity Levels */}
          <Card>
            <CardHeader 
              title="Brand Governance Statuses" 
              description="Official NEXORA tri-level risk arbiter ratings with pulsing state dots" 
            />
            <CardContent className="space-y-3">
              <div className="p-3.5 rounded-xl border border-status-critical/30 bg-status-critical-bg flex items-center justify-between">
                <div>
                  <StatusIndicator level="RED" label="Critical Contradiction" />
                  <p className="text-xs text-slate-muted mt-2">
                    Direct contradiction with approved specs or high-risk claims requiring human escalation.
                  </p>
                </div>
                <Badge variant="critical" size="sm">RED ALERT</Badge>
              </div>

              <div className="p-3.5 rounded-xl border border-status-warning/30 bg-status-warning-bg flex items-center justify-between">
                <div>
                  <StatusIndicator level="YELLOW" label="Warning / Inconsistency" />
                  <p className="text-xs text-slate-muted mt-2">
                    Tone drift, unapproved synonym, off-palette color hex drift, or contrast warnings.
                  </p>
                </div>
                <Badge variant="warning" size="sm">YELLOW</Badge>
              </div>

              <div className="p-3.5 rounded-xl border border-status-success/30 bg-status-success-bg flex items-center justify-between">
                <div>
                  <StatusIndicator level="GREEN" label="Compliant Check" />
                  <p className="text-xs text-slate-muted mt-2">
                    Verified against authoritative knowledge. Still subject to required human sign-off.
                  </p>
                </div>
                <Badge variant="success" size="sm">GREEN</Badge>
              </div>
            </CardContent>
          </Card>

        </section>

        {/* Section 3: Buttons, Inputs & Interactive Controls */}
        <section className="space-y-4">
          <div className="border-b border-slate-border/50 pb-3">
            <h2 className="text-xl font-bold text-slate-text tracking-tight">Interactive Controls</h2>
            <p className="text-xs text-slate-muted mt-0.5">Tested for focus rings, hover depth, active scaling, and screen readers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Button Variants */}
            <Card>
              <CardHeader title="Button Variants" description="All semantic actions and states" />
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2.5">
                  <Button variant="primary" size="sm">Primary Action</Button>
                  <Button variant="secondary" size="sm">Secondary</Button>
                  <Button variant="outline" size="sm">Outline</Button>
                  <Button variant="ghost" size="sm">Ghost</Button>
                  <Button variant="danger" size="sm">Reject (RED)</Button>
                  <Button variant="success" size="sm">Approve (GREEN)</Button>
                </div>
                <div className="pt-2 flex items-center gap-2">
                  <Button variant="primary" size="sm" isLoading>Loading...</Button>
                  <Button variant="secondary" size="sm" disabled>Disabled State</Button>
                </div>
              </CardContent>
            </Card>

            {/* Inputs & Search */}
            <Card>
              <CardHeader title="Form Inputs" description="Floating hints, prefix icons, and error states" />
              <CardContent className="space-y-3">
                <Input
                  label="Advertisement Search"
                  placeholder="Filter by campaign or product name..."
                  leftIcon={<Search className="w-4 h-4" />}
                  hint="Type product code like 'Aurora X2'"
                />
                <Input
                  label="Version Tag"
                  defaultValue="v3.2-production"
                  error="Spec sheet checksum mismatch with Hub"
                />
              </CardContent>
            </Card>

            {/* Selects & Dropdowns */}
            <Card>
              <CardHeader title="Select & Model Choice" description="Accessible custom select with options" />
              <CardContent className="space-y-4">
                <Select
                  label="Active AI Engine Gateway"
                  value={selectValue}
                  onChange={(val) => {
                    setSelectValue(val);
                    toast.success('Model Engine Configured', `Active model set to ${val}`);
                  }}
                  options={[
                    { value: 'gemini-2.5', label: 'Gemini 2.5 Flash (Cloud API)', description: 'Multimodal vision + reasoning' },
                    { value: 'gemini-pro', label: 'Gemini 1.5 Pro (Deep Arbiter)', description: 'Complex claim deduction' },
                    { value: 'ollama-local', label: 'Ollama Llama 3 (Local Air-gapped)', description: 'Zero external network transmission' },
                  ]}
                />

                <div className="flex items-center gap-2">
                  <Tooltip content="WCAG 2.1 AA Contrast Checked" position="top">
                    <Badge variant="outline" size="sm">Hover for Tooltip (Top)</Badge>
                  </Tooltip>
                  <Tooltip content="Authoritative Document Evidence Cited" position="bottom">
                    <Badge variant="mono" size="sm">Evidence Hover (Bottom)</Badge>
                  </Tooltip>
                </div>
              </CardContent>
            </Card>

          </div>
        </section>

        {/* Section 4: Data Tables & Governance Sample Findings */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-border/50 pb-3">
            <div>
              <h2 className="text-xl font-bold text-slate-text tracking-tight">Audit Findings & Evidence Table</h2>
              <p className="text-xs text-slate-muted mt-0.5">Sample multi-agent output showing exact citation traceability</p>
            </div>
            
            <Tabs
              tabs={[
                { id: 'all', label: 'All Findings', count: 4 },
                { id: 'critical', label: 'Critical (RED)', count: 1 },
                { id: 'warnings', label: 'Warnings', count: 2 },
              ]}
              activeTab={selectedPillTab}
              onChange={setSelectedPillTab}
              variant="pills"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Finding ID</TableHead>
                <TableHead>Guardian Agent</TableHead>
                <TableHead>Original Claim / Excerpt</TableHead>
                <TableHead>Authoritative Evidence (Hub)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-xs text-glacial font-semibold">#FND-8821</TableCell>
                <TableCell>
                  <span className="flex items-center gap-1.5 font-medium text-xs">
                    <FileText className="w-3.5 h-3.5 text-glacial" /> Fact Guardian
                  </span>
                </TableCell>
                <TableCell className="text-xs text-slate-text max-w-xs">
                  "Aurora X2: up to 7 days battery life, 5-year warranty"
                </TableCell>
                <TableCell className="text-xs text-slate-muted max-w-xs font-mono">
                  Spec Sheet v3.2, p.4: "battery 5 days; warranty 2 yrs"
                </TableCell>
                <TableCell>
                  <StatusIndicator level="RED" label="Contradicted" size="sm" />
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => toast.warning('Correction Proposed', 'Adjusted text to match Spec Sheet v3.2')}>
                    Apply Fix
                  </Button>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-mono text-xs text-glacial font-semibold">#FND-8822</TableCell>
                <TableCell>
                  <span className="flex items-center gap-1.5 font-medium text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-status-warning" /> Claims Guardian
                  </span>
                </TableCell>
                <TableCell className="text-xs text-slate-text max-w-xs">
                  "Fastest ultra-compact camera sensor in the industry"
                </TableCell>
                <TableCell className="text-xs text-slate-muted max-w-xs font-mono">
                  No comparative benchmark file on record in Hub
                </TableCell>
                <TableCell>
                  <StatusIndicator level="YELLOW" label="Unsubstantiated" size="sm" />
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => toast.info('Legal Escalation', 'Claim forwarded to Legal Reviewer queue')}>
                    Escalate
                  </Button>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-mono text-xs text-glacial font-semibold">#FND-8823</TableCell>
                <TableCell>
                  <span className="flex items-center gap-1.5 font-medium text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-status-success" /> Terminology Guardian
                  </span>
                </TableCell>
                <TableCell className="text-xs text-slate-text max-w-xs">
                  "Next-Gen UltraGlide Chassis"
                </TableCell>
                <TableCell className="text-xs text-slate-muted max-w-xs font-mono">
                  Brand Glossary v2.1: Approved Trademark
                </TableCell>
                <TableCell>
                  <StatusIndicator level="GREEN" label="Approved Term" size="sm" />
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" disabled>
                    Verified
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </section>

        {/* Section 5: Loading, Empty, and Error States */}
        <section className="space-y-4">
          <div className="border-b border-slate-border/50 pb-3">
            <h2 className="text-xl font-bold text-slate-text tracking-tight">System Feedback States</h2>
            <p className="text-xs text-slate-muted mt-0.5">Edge cases, loading shimmers, and error handling</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Shimmer Skeleton Card */}
            <Card>
              <CardHeader title="Loading Skeleton" description="Shimmer animation during multi-agent checks" />
              <CardSkeleton />
            </Card>

            {/* Empty State Card */}
            <Card>
              <CardHeader title="Empty State" description="Shown when a queue or directory has no entries" />
              <EmptyState
                title="No Open Recall Alerts"
                description="All published advertisements conform to the current approved knowledge baseline."
                actionLabel="Trigger Test Delta"
                onAction={() => toast.info('Recall Triggered', 'Analyzing historical registry against v3.2...')}
              />
            </Card>

            {/* Error State Card */}
            <Card>
              <CardHeader title="Error State" description="Anomaly reporting with user recovery action" />
              <ErrorState
                title="PyMuPDF OCR Extraction Notice"
                message="Rasterized layer detected without embedded text. Tesseract OCR fallback engaged."
                onRetry={() => toast.success('OCR Reprocessed', '1,420 words extracted successfully')}
              />
            </Card>

          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="glass-panel border-t border-slate-border/60 py-6 px-4 sm:px-8 mt-12 text-xs text-slate-muted">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-glacial/20 flex items-center justify-center text-glacial">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <span>NEXORA Platform — Team PINNACLE (Vadlapudi Siddhartha, Diviti Sri Vyshnavi, Mokshitha Venati)</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px] text-slate-tertiary">
            <span>Inter 400-800</span>
            <span>•</span>
            <span>JetBrains Mono</span>
            <span>•</span>
            <span>Obsidian (#050707)</span>
            <span>•</span>
            <span>Glacial (#A0C0D0)</span>
          </div>
        </div>
      </footer>

      {/* Interactive Modal Sample */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Human Decision Gate: Advertisement Re-audit"
        description="Reviewer action required under Phase F Governance Rules"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                setIsModalOpen(false);
                toast.critical('Advertisement Rejected', 'Creative rejected due to unverified battery claim.');
              }}
            >
              Reject Creative
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setIsModalOpen(false);
                toast.success('Precedent Recorded', 'Exception recorded into Review Memory.');
              }}
            >
              Approve with Precedent
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-obsidian-700/60 border border-slate-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-text">Advertisement Creative #AD-2041</span>
              <Badge variant="critical" size="sm">RED (1)</Badge>
            </div>
            <p className="text-xs text-slate-muted">
              Campaign: <span className="text-slate-text font-medium">Summer Launch Q3</span> • Format: <span className="font-mono text-glacial">PDF Creative (2 Pages)</span>
            </p>
          </div>

          <p className="text-xs text-slate-muted leading-relaxed">
            NEXORA Rule Reminder: <strong className="text-slate-text">Never automatically approve advertisements.</strong> 
            Approving this advertisement will store the human decision rationale into <span className="font-mono text-glacial">review_memory</span> to guide future reviews.
          </p>
        </div>
      </Modal>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <DesignSystemGallery />
    </ToastProvider>
  );
}
