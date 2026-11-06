import { useState, useEffect } from 'react';
import { 
  AlertOctagon, 
  RefreshCw, 
  CheckCircle2, 
  ArrowRight, 
  BookOpen, 
  Sparkles
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { RecallApi } from '../../services/api';
import { useToast } from '../../components/ui/Toast';
import { SEO } from '../../components/common/SEO';

export function RecallWorkspace() {
  const { hasRole } = useAuth();
  const { toast } = useToast();
  const isApproverOrAdmin = hasRole(['ADMIN', 'APPROVER']);

  const [alerts, setAlerts] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'ACTIVE' | 'REMEDIATED' | 'DISMISSED' | 'ALL'>('ACTIVE');

  // Remediation Modal
  const [selectedAlert, setSelectedAlert] = useState<any | null>(null);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [actionChoice, setActionChoice] = useState<'RECHECK_AD' | 'MARK_REMEDIATED' | 'DISMISS'>('RECHECK_AD');
  const [actionNotes, setActionNotes] = useState('');
  const [resolving, setResolving] = useState(false);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await RecallApi.listAlerts(filterStatus);
      setAlerts(res.alerts || []);
      setCounts(res.counts || {});
    } catch (err: any) {
      toast.critical('Failed to load recall alerts', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [filterStatus]);

  const handleRunEvaluationSweep = async () => {
    try {
      setEvaluating(true);
      const res = await RecallApi.evaluateSweep();
      toast.success(
        'Recall Sweep Complete', 
        `Scanned ${res.ads_scanned} registered ads against latest approved knowledge. ${res.new_alerts_count} new alerts detected.`
      );
      fetchAlerts();
    } catch (err: any) {
      toast.critical('Sweep Failed', err.message);
    } finally {
      setEvaluating(false);
    }
  };

  const handleResolveAlert = async () => {
    if (!selectedAlert) return;
    try {
      setResolving(true);
      await RecallApi.resolveAlert(selectedAlert.id, actionChoice, actionNotes);
      toast.success('Alert Resolved', `Alert marked as ${actionChoice}`);
      setIsResolveModalOpen(false);
      setActionNotes('');
      fetchAlerts();
    } catch (err: any) {
      toast.critical('Resolution Failed', err.message);
    } finally {
      setResolving(false);
    }
  };

  return (
    <>
      <SEO
        title="Advertisement Recall Engine // NEXORA"
        description="Proactive governance engine detecting published advertisements affected by subsequent knowledge updates."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-slate-border pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 bg-status-critical rounded-full animate-ping" />
              <span className="text-xs font-mono uppercase text-status-critical font-bold">
                Continuous Governance Loop // Phase 10
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-text tracking-tight font-mono">
              Advertisement Recall Engine
            </h1>
            <p className="text-xs sm:text-sm text-slate-muted font-mono mt-1">
              When approved knowledge evolves, the Recall Engine automatically identifies affected advertisements and triggers remediation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isApproverOrAdmin && (
              <Button
                variant="primary"
                size="sm"
                isLoading={evaluating}
                onClick={handleRunEvaluationSweep}
                className="gap-2 shadow-neo-sm"
              >
                <Sparkles className="w-4 h-4" />
                Trigger Knowledge Recall Sweep
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={fetchAlerts} className="gap-2">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Telemetry Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono">
          <div className="p-4 rounded-xl bg-obsidian-900 border-2 border-slate-border shadow-neo-sm">
            <div className="text-[11px] text-slate-muted uppercase">Active Recall Alerts</div>
            <div className="text-2xl font-extrabold text-status-critical mt-1">
              {counts.ACTIVE || 0}
            </div>
            <div className="text-[10px] text-slate-tertiary mt-1">Requiring immediate remediation</div>
          </div>
          <div className="p-4 rounded-xl bg-obsidian-900 border-2 border-slate-border shadow-neo-sm">
            <div className="text-[11px] text-slate-muted uppercase">Remediated Ads</div>
            <div className="text-2xl font-extrabold text-status-success mt-1">
              {counts.REMEDIATED || 0}
            </div>
            <div className="text-[10px] text-slate-tertiary mt-1">Realigned with updated specs</div>
          </div>
          <div className="p-4 rounded-xl bg-obsidian-900 border-2 border-slate-border shadow-neo-sm">
            <div className="text-[11px] text-slate-muted uppercase">Dismissed / Overridden</div>
            <div className="text-2xl font-extrabold text-slate-text mt-1">
              {counts.DISMISSED || 0}
            </div>
            <div className="text-[10px] text-slate-tertiary mt-1">Human exception logged</div>
          </div>
          <div className="p-4 rounded-xl bg-obsidian-900 border-2 border-slate-border shadow-neo-sm">
            <div className="text-[11px] text-slate-muted uppercase">Recall Engine Mode</div>
            <div className="text-sm font-extrabold text-glacial mt-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-status-success" />
              RAG VECTOR + EXACT DELTA
            </div>
            <div className="text-[10px] text-slate-tertiary mt-1">Authoritative Admin Gated</div>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-border/60 pb-2">
          {(['ACTIVE', 'REMEDIATED', 'DISMISSED', 'ALL'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className={`px-3 py-1.5 rounded text-xs font-mono font-bold uppercase transition-all ${
                filterStatus === tab
                  ? 'bg-glacial text-obsidian-950 shadow-neo-sm'
                  : 'text-slate-muted hover:text-slate-text bg-obsidian-800 border border-slate-border/50'
              }`}
            >
              {tab} ALERTS ({counts[tab] ?? counts.TOTAL ?? 0})
            </button>
          ))}
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {loading ? (
            <div className="p-12 text-center text-xs font-mono text-slate-muted border-2 border-dashed border-slate-border rounded-xl">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-glacial" />
              Scanning for knowledge version anomalies...
            </div>
          ) : alerts.length === 0 ? (
            <div className="p-12 text-center text-xs font-mono text-slate-muted border-2 border-dashed border-slate-border rounded-xl bg-obsidian-900">
              <CheckCircle2 className="w-8 h-8 text-status-success mx-auto mb-2" />
              <div className="text-sm font-bold text-slate-text">No Recall Alerts in this Category</div>
              <div className="text-[11px] text-slate-tertiary mt-1">
                All registered advertisements are currently synchronized with approved knowledge documents.
              </div>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className="p-6 rounded-xl bg-obsidian-900 border-2 border-slate-border shadow-neo space-y-4 font-mono text-xs"
              >
                {/* Alert Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-border/60">
                  <div className="flex items-center gap-2.5">
                    <span className="p-1.5 rounded bg-status-critical/20 text-status-critical border border-status-critical/40">
                      <AlertOctagon className="w-4 h-4" />
                    </span>
                    <div>
                      <div className="text-sm font-bold text-slate-text">
                        {alert.advertisement_title}
                      </div>
                      <div className="text-[10px] text-slate-tertiary">
                        Alert ID: {alert.id} • Target Ad ID: {alert.advertisement_id}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={alert.severity === 'RED' ? 'critical' : 'warning'}>
                      {alert.severity} // FACT CONTRADICTION
                    </Badge>
                    <Badge variant={alert.status === 'ACTIVE' ? 'critical' : 'success'}>
                      {alert.status}
                    </Badge>
                  </div>
                </div>

                {/* Reason & Version Update Context */}
                <div className="p-3 rounded-lg bg-obsidian-950 border border-slate-border/70 space-y-1.5">
                  <div className="text-[10px] text-glacial font-bold uppercase flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    Knowledge Change Event: {alert.source_document} ({alert.previous_version} → {alert.new_version})
                  </div>
                  <p className="text-slate-text leading-relaxed">
                    {alert.reason}
                  </p>
                </div>

                {/* Side-by-Side Impact Diff */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Invalidated Claim */}
                  <div className="p-3 rounded-lg bg-status-critical/10 border border-status-critical/30 space-y-1">
                    <div className="text-[10px] text-status-critical font-bold uppercase">
                      Invalidated Claim in Market Creative:
                    </div>
                    <div className="text-slate-text font-bold">
                      &quot;{alert.invalidated_claim}&quot;
                    </div>
                  </div>

                  {/* Right: Authoritative Benchmark */}
                  <div className="p-3 rounded-lg bg-status-success/10 border border-status-success/30 space-y-1">
                    <div className="text-[10px] text-status-success font-bold uppercase">
                      New Approved Benchmark ({alert.new_version}):
                    </div>
                    <div className="text-slate-text font-bold">
                      &quot;{alert.approved_benchmark}&quot;
                    </div>
                  </div>
                </div>

                {/* Verbatim Evidence Citation */}
                {alert.verbatim_evidence && (
                  <div className="text-[11px] text-slate-muted bg-obsidian-850 p-2.5 rounded border border-slate-border/40">
                    <span className="font-bold text-slate-text">Verbatim Approved Excerpt: </span>
                    <span className="italic">&quot;{alert.verbatim_evidence}&quot;</span>
                  </div>
                )}

                {/* Remediation Suggestion & Action Footer */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-border/40">
                  <div className="text-[11px] text-slate-tertiary max-w-xl">
                    <strong className="text-slate-muted">Action Required: </strong>
                    {alert.suggested_remediation}
                  </div>

                  {isApproverOrAdmin && alert.status === 'ACTIVE' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setSelectedAlert(alert);
                        setIsResolveModalOpen(true);
                      }}
                      className="shrink-0 gap-1.5"
                    >
                      Remediate Alert
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>

              </div>
            ))
          )}
        </div>

        {/* Resolution Modal */}
        <Modal
          isOpen={isResolveModalOpen}
          onClose={() => setIsResolveModalOpen(false)}
          title={`Remediate Recall Alert // ${selectedAlert?.id}`}
        >
          <div className="space-y-4 font-mono text-xs">
            <p className="text-slate-muted">
              Select remediation action for advertisement <strong className="text-slate-text">{selectedAlert?.advertisement_title}</strong>.
            </p>

            <div className="space-y-2">
              <label className="block text-slate-text font-bold">Action:</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 p-2.5 rounded bg-obsidian-900 border border-slate-border cursor-pointer hover:border-glacial">
                  <input
                    type="radio"
                    name="remediation"
                    checked={actionChoice === 'RECHECK_AD'}
                    onChange={() => setActionChoice('RECHECK_AD')}
                  />
                  <div>
                    <div className="font-bold text-slate-text">Re-check Advertisement (Send to Review)</div>
                    <div className="text-[10px] text-slate-tertiary">
                      Flag advertisement status as UNDER_REVIEW and initialize creative revision.
                    </div>
                  </div>
                </label>
                <label className="flex items-center gap-2 p-2.5 rounded bg-obsidian-900 border border-slate-border cursor-pointer hover:border-glacial">
                  <input
                    type="radio"
                    name="remediation"
                    checked={actionChoice === 'MARK_REMEDIATED'}
                    onChange={() => setActionChoice('MARK_REMEDIATED')}
                  />
                  <div>
                    <div className="font-bold text-slate-text">Mark Remediated</div>
                    <div className="text-[10px] text-slate-tertiary">
                      Confirm campaign copy was pulled or updated in downstream ad server.
                    </div>
                  </div>
                </label>
                <label className="flex items-center gap-2 p-2.5 rounded bg-obsidian-900 border border-slate-border cursor-pointer hover:border-glacial">
                  <input
                    type="radio"
                    name="remediation"
                    checked={actionChoice === 'DISMISS'}
                    onChange={() => setActionChoice('DISMISS')}
                  />
                  <div>
                    <div className="font-bold text-slate-text">Dismiss / Log Exception</div>
                    <div className="text-[10px] text-slate-tertiary">
                      Keep campaign active with authorized human override precedent.
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-slate-text font-bold mb-1">Reviewer Justification / Notes:</label>
              <textarea
                rows={3}
                placeholder="Document your reason or reference the revision ticket..."
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                className="w-full rounded bg-obsidian-900 border border-slate-border p-2 text-slate-text text-xs focus:border-glacial focus:outline-none"
              />
            </div>

            <div className="pt-4 border-t border-slate-border flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setIsResolveModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={resolving}
                onClick={handleResolveAlert}
              >
                Execute Remediation
              </Button>
            </div>
          </div>
        </Modal>

      </div>
    </>
  );
}

