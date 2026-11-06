import { useState } from 'react';
import { 
  ArrowRight, 
  Zap
} from 'lucide-react';
import { SectionHeader } from '../components/common/SectionHeader';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { StatusIndicator } from '../components/ui/StatusIndicator';
import { Button } from '../components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Link } from 'react-router-dom';
import { SEO } from '../components/common/SEO';
import { useToast } from '../components/ui/Toast';

export function Recall() {
  const { toast } = useToast();
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<number | null>(0);

  const recallAlerts = [
    {
      id: "RC-2026-081",
      adId: "AD-AURORA-X2-SUMMER",
      title: "Aurora X2 Launch Campaign Creative",
      channel: "Digital Display & Social Banner",
      affectedFact: "Warranty Coverage Term",
      oldValue: "5-Year Full Coverage Warranty",
      newValue: "2-Year Standard Warranty (Effective Nov 2026)",
      reason: "Spec Sheet v3.2 updated and approved by Brand Admin.",
      priority: "CRITICAL",
      level: "RED" as const,
      status: "Open - Action Required",
      suggestedFix: "Update body copy to '2-Year Standard Warranty' before media flight."
    },
    {
      id: "RC-2026-082",
      adId: "AD-ULTRAGLIDE-Q3",
      title: "UltraGlide Pro Technical Brief",
      channel: "Public Website Landing Page",
      affectedFact: "Chassis Material Branding",
      oldValue: "Eco-magic chassis",
      newValue: "UltraGlide Recycled Alloy",
      reason: "Terminology Registry v2.1 deprecated informal colloquialism.",
      priority: "HIGH",
      level: "YELLOW" as const,
      status: "Open - Action Required",
      suggestedFix: "Replace 'Eco-magic chassis' with approved trademark 'UltraGlide Recycled Alloy'."
    },
    {
      id: "RC-2026-083",
      adId: "AD-AURORA-X1-RET",
      title: "Aurora X1 Legacy Promotional Flyer",
      channel: "Print Catalog Insert (PDF)",
      affectedFact: "Battery Runtime Benchmark",
      oldValue: "Up to 30 hours continuous playback",
      newValue: "Up to 24 hours (IEC Standard Test v1.4)",
      reason: "Engineering lab recalculated standardized runtime.",
      priority: "HIGH",
      level: "YELLOW" as const,
      status: "In Review by Marketing",
      suggestedFix: "Amend runtime to 24 hours per revised testing standard."
    }
  ];

  const handleSimulateRecall = () => {
    setIsSimulating(true);
    toast.info("Knowledge Update Detected", "Diffing Spec Sheet v3.2 with Knowledge Hub baseline...");
    setTimeout(() => {
      setIsSimulating(false);
      toast.critical("Advertisement Recall Triggered", "Scanned 142 registered advertisements. Identified 3 affected assets.");
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
      <SEO
        title="Advertisement Recall Engine — Continuous Brand Governance"
        description="The NEXORA Advertisement Recall Engine continuously monitors published creatives, re-checking historical advertisements whenever company specifications or guidelines update."
      />

      <SectionHeader
        badge="Active Development Scope"
        title="The Advertisement"
        highlight="Recall Engine"
        description="Source documents change; published content does not update itself. The Recall Engine permanently solves factual aging by connecting knowledge updates to the Advertisement Registry."
      />

      {/* Hero Explainer Card */}
      <div className="rounded-xl glass-panel border border-status-warning/40 p-8 sm:p-10 relative overflow-hidden bg-gradient-to-br from-obsidian-850/90 to-obsidian-950 cyber-frame">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="warning" dot size="sm">[ DELIBERATE SCOPE ENGINE ]</Badge>
              <span className="text-xs font-mono text-status-warning">// Real-time Version Delta Sync</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-text">
              Closing the Factual Aging Gap
            </h2>
            <p className="text-xs sm:text-sm text-slate-muted leading-relaxed">
              In most enterprises, when a product specification sheet is updated, marketing departments have no way of knowing which live advertisements, brochures, or social campaigns still quote the deprecated numbers.
            </p>
            <p className="text-xs sm:text-sm text-slate-muted leading-relaxed">
              NEXORA bridges this governance gap. When a document is approved in the Brand Knowledge Hub, our version delta engine runs an automated impact search across the Advertisement Registry and generates prioritized recall remediation alerts.
            </p>

            <div className="pt-2">
              <Button
                variant="cyber"
                size="md"
                onClick={handleSimulateRecall}
                isLoading={isSimulating}
                cyberBracket
                leftIcon={<Zap className="w-4 h-4 text-cyber-cyan" />}
              >
                EXECUTE SIMULATION: SPEC SHEET DELTA (v3.2)
              </Button>
            </div>
          </div>

          <div className="lg:col-span-5 p-6 rounded-2xl bg-obsidian-900/90 border border-slate-border space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-tertiary">Recall Engine Architecture</h4>
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-obsidian-800 border border-slate-border/50 flex items-start gap-3">
                <span className="font-mono text-status-warning font-bold">1</span>
                <div>
                  <strong className="text-slate-text block">Document Version Delta</strong>
                  <span className="text-slate-muted text-[11px]">Detects numerical & lexical changes between active & draft versions.</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-obsidian-800 border border-slate-border/50 flex items-start gap-3">
                <span className="font-mono text-status-warning font-bold">2</span>
                <div>
                  <strong className="text-slate-text block">Registry Dependency Query</strong>
                  <span className="text-slate-muted text-[11px]">Queries MongoDB registry for ads referencing modified facts.</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-obsidian-800 border border-slate-border/50 flex items-start gap-3">
                <span className="font-mono text-status-warning font-bold">3</span>
                <div>
                  <strong className="text-slate-text block">Targeted Re-audit</strong>
                  <span className="text-slate-muted text-[11px]">Re-executes Fact and Claims Guardians on impacted assets.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Recall Alerts Matrix */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-border/50 pb-3">
          <div>
            <h3 className="text-xl font-bold text-slate-text">Active Recall Alerts Matrix</h3>
            <p className="text-xs text-slate-muted mt-0.5">Click any alert row to inspect detailed remediation guidance</p>
          </div>
          <Badge variant="mono" size="sm">3 Advertisements Flagged</Badge>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Alert ID</TableHead>
              <TableHead>Target Creative</TableHead>
              <TableHead>Affected Specification</TableHead>
              <TableHead>Trigger Reason</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recallAlerts.map((alert, idx) => {
              const isSelected = selectedAlert === idx;
              return (
                <TableRow 
                  key={alert.id}
                  onClick={() => setSelectedAlert(idx)}
                  className={isSelected ? 'bg-obsidian-700/80 border-glacial/40' : ''}
                >
                  <TableCell className="font-mono text-xs text-glacial font-semibold">{alert.id}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-xs text-slate-text">{alert.title}</span>
                      <span className="text-[10px] text-slate-tertiary font-mono">{alert.channel}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-slate-muted">{alert.affectedFact}</TableCell>
                  <TableCell className="text-xs text-slate-tertiary max-w-xs truncate">{alert.reason}</TableCell>
                  <TableCell>
                    <StatusIndicator level={alert.level} label={alert.priority} size="sm" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAlert(idx);
                        toast.info("Alert Inspected", `Viewing remediation for ${alert.id}`);
                      }}
                    >
                      Inspect
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* Selected Alert Remediation Inspector */}
        {selectedAlert !== null && (
          <div className="p-6 rounded-2xl glass-panel border border-status-warning/30 bg-obsidian-900/80 space-y-4 animate-in fade-in-0 duration-200">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-border/50">
              <div className="flex items-center gap-2.5">
                <StatusIndicator level={recallAlerts[selectedAlert].level} size="sm" />
                <span className="font-mono text-xs text-slate-text font-bold">
                  Remediation Brief for {recallAlerts[selectedAlert].adId}
                </span>
              </div>
              <Badge variant="mono" size="sm">Status: {recallAlerts[selectedAlert].status}</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-obsidian-800 border border-slate-border/50 space-y-2">
                <span className="text-[10px] font-mono uppercase text-status-critical">Historical Quoted Value (Now Outdated):</span>
                <p className="text-sm font-semibold text-slate-text font-mono line-through decoration-status-critical">
                  "{recallAlerts[selectedAlert].oldValue}"
                </p>
                <span className="text-[11px] text-slate-muted block">Quoted at the time of creative publication.</span>
              </div>

              <div className="p-4 rounded-xl bg-obsidian-800 border border-status-success/30 space-y-2">
                <span className="text-[10px] font-mono uppercase text-status-success">Updated Approved Value (Hub Baseline):</span>
                <p className="text-sm font-semibold text-status-success font-mono">
                  "{recallAlerts[selectedAlert].newValue}"
                </p>
                <span className="text-[11px] text-slate-muted block">Verified from authoritative document update.</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-obsidian-800/80 border border-slate-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div>
                <strong className="text-slate-text block mb-1">Recommended Remediation:</strong>
                <p className="text-slate-muted">{recallAlerts[selectedAlert].suggestedFix}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => toast.success("Remediation Dispatched", "Alert sent to creative agency revision queue.")}
                >
                  Dispatch to Creator
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Realistic Scope Boundaries Table */}
      <section className="space-y-6">
        <SectionHeader
          badge="Engineering Transparency"
          title="Advertisement Source"
          highlight="Feasibility & Scope"
          description="Clear boundaries regarding what content sources are actively monitored versus future roadmap."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <Card>
            <CardHeader title="Previously Reviewed Uploads" description="Fully Supported in Active Scope" />
            <CardContent>
              <p className="text-slate-muted leading-relaxed">
                Every advertisement creative reviewed through NEXORA is indexed in the MongoDB Advertisement Registry with linked claims and fact IDs for instant re-auditing.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Public Advertisement Links" description="Supported in Active Scope" />
            <CardContent>
              <p className="text-slate-muted leading-relaxed">
                Public landing pages and live promotional URLs where automated fetch is technically accessible and legally permitted under rate limits.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Walled Social Networks" description="Future Integration Scope" />
            <CardContent>
              <p className="text-slate-muted leading-relaxed">
                Private social media or restricted ad platforms require authenticated partner APIs and user uploads (planned for post-hackathon enterprise modules).
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <div className="text-center pt-4">
        <Link to="/security">
          <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Inspect Security & Data Isolation Protocols
          </Button>
        </Link>
      </div>

    </div>
  );
}
