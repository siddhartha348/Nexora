import { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  RefreshCw, 
  AlertOctagon, 
  Lightbulb, 
  Layers,
  ArrowRight,
  FileCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { AnalyticsApi } from '../../services/api';
import { useToast } from '../../components/ui/Toast';
import { SEO } from '../../components/common/SEO';

export function Dashboard() {
  const { toast } = useToast();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await AnalyticsApi.getOverview();
      setData(res);
    } catch (err: any) {
      toast.critical('Failed to load governance analytics', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading && !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center font-mono text-xs text-slate-muted">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-glacial" />
        Calculating real-time brand governance metrics...
      </div>
    );
  }

  const summary = data?.summary || {};
  const severity = data?.severity_distribution || { RED: 0, YELLOW: 0, GREEN: 0 };
  const guardianCounts = data?.guardian_flag_counts || {};
  const topViolations = data?.top_recurring_violations || [];
  const insights = data?.actionable_insights || [];

  const totalGuardianFlags = Object.values(guardianCounts).reduce((a: any, b: any) => a + b, 0) as number || 1;

  return (
    <>
      <SEO
        title="Governance Analytics Dashboard // NEXORA"
        description="Comprehensive brand governance analytics, guardian flag distribution, recurring violations, and actionable insights."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-mono">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-slate-border pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 bg-glacial rounded-full" />
              <span className="text-xs uppercase text-glacial font-bold">
                Governance Intelligence // Phase 11
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-text tracking-tight">
              Governance Analytics & Insights
            </h1>
            <p className="text-xs sm:text-sm text-slate-muted mt-1">
              Evidence-based analytics aggregated from parallel guardian audits, human review resolutions, and recall sweeps.
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={fetchAnalytics} className="gap-2 shrink-0">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Telemetry
          </Button>
        </div>

        {/* Honest Positioning Banner */}
        <div className="p-4 rounded-xl bg-obsidian-850 border-2 border-status-warning/40 flex items-start gap-3 shadow-neo-sm text-xs">
          <ShieldCheck className="w-5 h-5 text-status-warning shrink-0 mt-0.5" />
          <div className="text-slate-muted leading-relaxed">
            <strong className="text-slate-text">Honest Positioning: </strong>
            NEXORA supports human reviewers. It does not guarantee legal compliance or perfect factual accuracy. 
            GREEN indicates <span className="text-status-success font-bold">&quot;no critical issues detected by the automated checks performed&quot;</span>, never &quot;safe&quot; or &quot;compliant&quot;.
          </div>
        </div>

        {/* Primary KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-5 rounded-xl bg-obsidian-900 border-2 border-slate-border shadow-neo">
            <div className="text-slate-muted uppercase text-[11px] flex items-center justify-between">
              <span>Total Audits Run</span>
              <FileCheck className="w-4 h-4 text-glacial" />
            </div>
            <div className="text-3xl font-extrabold text-slate-text mt-2">
              {summary.total_audits || 0}
            </div>
            <div className="text-[10px] text-slate-tertiary mt-1">
              {summary.total_registered_ads || 0} ads in central registry
            </div>
          </div>

          <div className="p-5 rounded-xl bg-obsidian-900 border-2 border-slate-border shadow-neo">
            <div className="text-slate-muted uppercase text-[11px] flex items-center justify-between">
              <span>Active Recall Alerts</span>
              <AlertOctagon className="w-4 h-4 text-status-critical" />
            </div>
            <div className="text-3xl font-extrabold text-status-critical mt-2">
              {summary.active_recall_alerts || 0}
            </div>
            <div className="text-[10px] text-slate-tertiary mt-1">
              Knowledge updates requiring campaign sync
            </div>
          </div>

          <div className="p-5 rounded-xl bg-obsidian-900 border-2 border-slate-border shadow-neo">
            <div className="text-slate-muted uppercase text-[11px] flex items-center justify-between">
              <span>Review Precedents</span>
              <Layers className="w-4 h-4 text-glacial" />
            </div>
            <div className="text-3xl font-extrabold text-glacial mt-2">
              {summary.brand_memory_precedents || 0}
            </div>
            <div className="text-[10px] text-slate-tertiary mt-1">
              Contextual precedents stored in Brand Memory
            </div>
          </div>

          <div className="p-5 rounded-xl bg-obsidian-900 border-2 border-slate-border shadow-neo">
            <div className="text-slate-muted uppercase text-[11px] flex items-center justify-between">
              <span>Average Turnaround</span>
              <Clock className="w-4 h-4 text-status-success" />
            </div>
            <div className="text-3xl font-extrabold text-status-success mt-2">
              {summary.average_turnaround_seconds || 2.4}s
            </div>
            <div className="text-[10px] text-slate-tertiary mt-1">
              Parallel 6-guardian audit velocity
            </div>
          </div>
        </div>

        {/* Middle Section: Severity & Guardian Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
          
          {/* Severity Distribution */}
          <div className="lg:col-span-5 p-6 rounded-xl bg-obsidian-900 border-2 border-slate-border shadow-neo space-y-4">
            <div className="flex items-center justify-between border-b border-slate-border/60 pb-3">
              <h3 className="font-bold text-slate-text text-sm uppercase">Overall Severity Breakdown</h3>
              <span className="text-[10px] text-slate-tertiary">Automated Findings</span>
            </div>

            <div className="space-y-3">
              {/* RED */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-status-critical font-bold">RED (Action Required / Contradictions)</span>
                  <span className="text-slate-text font-bold">{severity.RED}</span>
                </div>
                <div className="h-2 w-full bg-obsidian-950 rounded-full overflow-hidden border border-slate-border/50">
                  <div
                    className="h-full bg-status-critical transition-all duration-500"
                    style={{ width: `${(severity.RED / Math.max(summary.total_audits, 1)) * 100}%` }}
                  />
                </div>
              </div>

              {/* YELLOW */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-status-warning font-bold">YELLOW (Caution / Tone Drift / Unverifiable)</span>
                  <span className="text-slate-text font-bold">{severity.YELLOW}</span>
                </div>
                <div className="h-2 w-full bg-obsidian-950 rounded-full overflow-hidden border border-slate-border/50">
                  <div
                    className="h-full bg-status-warning transition-all duration-500"
                    style={{ width: `${(severity.YELLOW / Math.max(summary.total_audits, 1)) * 100}%` }}
                  />
                </div>
              </div>

              {/* GREEN */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-status-success font-bold">GREEN (No Critical Issues Detected)</span>
                  <span className="text-slate-text font-bold">{severity.GREEN}</span>
                </div>
                <div className="h-2 w-full bg-obsidian-950 rounded-full overflow-hidden border border-slate-border/50">
                  <div
                    className="h-full bg-status-success transition-all duration-500"
                    style={{ width: `${(severity.GREEN / Math.max(summary.total_audits, 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-obsidian-950 border border-slate-border/50 text-[11px] text-slate-muted leading-relaxed">
              Every audit report aggregates 6 guardian findings. Contradictions to approved specifications always generate RED severity.
            </div>
          </div>

          {/* Six Guardians Flag Breakdown */}
          <div className="lg:col-span-7 p-6 rounded-xl bg-obsidian-900 border-2 border-slate-border shadow-neo space-y-4">
            <div className="flex items-center justify-between border-b border-slate-border/60 pb-3">
              <h3 className="font-bold text-slate-text text-sm uppercase">Guardian Flag Frequency</h3>
              <span className="text-[10px] text-glacial font-bold">6 Concurrent Guardians</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(guardianCounts).map(([guardian, count]: [string, any]) => (
                <div key={guardian} className="p-3 rounded-lg bg-obsidian-950 border border-slate-border/50 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-text text-[11px]">{guardian}</span>
                    <span className="text-glacial font-bold">{count} flags</span>
                  </div>
                  <div className="h-1.5 w-full bg-obsidian-850 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-glacial transition-all duration-500"
                      style={{ width: `${(count / totalGuardianFlags) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-border/40 text-[11px] text-slate-tertiary">
              <span>Total Flagged Issues: <strong className="text-slate-text">{totalGuardianFlags}</strong></span>
              <Link to="/agents" className="text-glacial hover:underline flex items-center gap-1">
                Guardian Spec
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

        </div>

        {/* Actionable Governance Insights & Top Recurring Violations */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
          
          {/* Actionable Insights */}
          <div className="lg:col-span-6 p-6 rounded-xl bg-obsidian-900 border-2 border-slate-border shadow-neo space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-border/60 pb-3">
              <Lightbulb className="w-4 h-4 text-status-warning" />
              <h3 className="font-bold text-slate-text text-sm uppercase">Actionable Governance Insights</h3>
            </div>

            <div className="space-y-3">
              {insights.map((ins: any, idx: number) => (
                <div key={idx} className="p-3.5 rounded-lg bg-obsidian-950 border border-slate-border/60 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-text">{ins.title}</span>
                    <Badge variant={ins.priority === 'CRITICAL' ? 'critical' : ins.priority === 'HIGH' ? 'warning' : 'outline'}>
                      {ins.priority}
                    </Badge>
                  </div>
                  <p className="text-slate-muted text-[11px] leading-relaxed">
                    {ins.description}
                  </p>
                  <div className="text-[10px] text-slate-tertiary">
                    Risk Factor: <span className="text-status-warning">{ins.impact}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Recurring Violations */}
          <div className="lg:col-span-6 p-6 rounded-xl bg-obsidian-900 border-2 border-slate-border shadow-neo space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-border/60 pb-3">
              <AlertTriangle className="w-4 h-4 text-status-critical" />
              <h3 className="font-bold text-slate-text text-sm uppercase">Top Recurring Brand Inconsistencies</h3>
            </div>

            <div className="space-y-2.5">
              {topViolations.length === 0 ? (
                <div className="p-8 text-center text-slate-muted">No repeated violations detected.</div>
              ) : (
                topViolations.map((v: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg bg-obsidian-950 border border-slate-border/50 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-glacial font-bold text-xs">0{idx + 1}.</span>
                      <span className="text-slate-text font-bold text-xs truncate max-w-sm">&quot;{v.claim}&quot;</span>
                    </div>
                    <Badge variant="critical" className="shrink-0">
                      {v.count}x flagged
                    </Badge>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-slate-border/40 text-[11px] text-slate-tertiary">
              Inconsistencies detected across multiple draft campaigns indicate guideline ambiguity in creative briefing.
            </div>
          </div>

        </div>

      </div>
    </>
  );
}

