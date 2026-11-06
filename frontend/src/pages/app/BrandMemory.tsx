import { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  CheckCircle2, 
  Edit3, 
  XCircle, 
  RefreshCw,
  Info,
  Award
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';
import { BrandMemoryApi } from '../../services/api';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../../context/AuthContext';
import { SEO } from '../../components/common/SEO';

export function BrandMemory() {
  const { toast } = useToast();
  const { hasRole } = useAuth();
  const isAdmin = hasRole(['ADMIN']);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDecision, setSelectedDecision] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Promotion modal
  const [promoteEntry, setPromoteEntry] = useState<any | null>(null);
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);

  const fetchMemory = async () => {
    try {
      setLoading(true);
      const res = await BrandMemoryApi.query(
        selectedCategory !== 'all' ? selectedCategory : undefined,
        searchQuery || undefined
      );
      setEntries(res || []);
    } catch (err: any) {
      toast.critical('Failed to load Brand Memory', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemory();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMemory();
  };

  const handlePromoteException = async () => {
    if (!promoteEntry) return;
    try {
      await BrandMemoryApi.promoteException(promoteEntry.id, 'Promoted to official policy exception by Brand Administrator');
      toast.success('Precedent Promoted', 'Official exception approved and logged with audit trail versioning.');
      fetchMemory();
    } catch (err: any) {
      toast.critical('Promotion Failed', err.message);
    }
  };

  const filteredEntries = entries.filter((entry) => {
    if (selectedDecision !== 'all' && entry.decision?.toUpperCase() !== selectedDecision.toUpperCase()) {
      return false;
    }
    return true;
  });

  const getDecisionBadge = (decision: string) => {
    switch (decision?.toUpperCase()) {
      case 'ACCEPTED':
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle2 className="w-3 h-3" />
            ACCEPTED SUGGESTION
          </Badge>
        );
      case 'EDITED':
        return (
          <Badge variant="mono" className="gap-1">
            <Edit3 className="w-3 h-3" />
            HUMAN REVISED
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge variant="critical" className="gap-1">
            <XCircle className="w-3 h-3" />
            REJECTED EXCEPTION
          </Badge>
        );
      default:
        return <Badge variant="outline">{decision}</Badge>;
    }
  };

  return (
    <>
      <SEO
        title="Brand Memory // Review Precedents // NEXORA"
        description="Searchable repository of past human reviewer decisions, accepted nuances, and precedent rationales."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-slate-border pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 bg-glacial rounded-full" />
              <span className="text-xs font-mono uppercase text-glacial font-bold">
                Contextual Intelligence // Phase 8
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-text tracking-tight font-mono">
              Brand Memory (Review Precedents)
            </h1>
            <p className="text-xs sm:text-sm text-slate-muted font-mono mt-1">
              Captures human reviewer rationales, accepted corrections, and exceptions to guide future audits as historical context.
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={fetchMemory} className="gap-2 shrink-0">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Precedents
          </Button>
        </div>

        {/* Honest Positioning & Inviolable Governance Disclaimer */}
        <div className="p-4 rounded-xl bg-obsidian-850 border-2 border-glacial/40 flex items-start gap-3 shadow-neo-sm font-mono text-xs">
          <Info className="w-5 h-5 text-glacial shrink-0 mt-0.5" />
          <div className="space-y-1 text-slate-muted leading-relaxed">
            <div className="text-slate-text font-bold">
              Core Governance Principle: Brand Memory is Context Only
            </div>
            <p>
              Brand Memory entries record how certified human reviewers resolved ambiguities or nuances in previous campaigns. 
              <span className="text-glacial font-bold"> Brand Memory is non-authoritative and never overrides approved brand guidelines.</span> Only 
              designated administrators can promote an approved precedent into official policy.
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-border/60">
            {['all', 'Terminology', 'Tone Drift', 'Specifications', 'Claims', 'Visual', 'Accessibility'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded text-xs font-mono font-bold uppercase transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-glacial text-obsidian-950 shadow-neo-sm'
                    : 'text-slate-muted hover:text-slate-text bg-obsidian-800 border border-slate-border/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <form onSubmit={handleSearchSubmit} className="flex-1 w-full sm:max-w-md flex gap-2">
              <Input
                placeholder="Search precedents by phrase or comment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-tertiary" />}
              />
              <Button type="submit" variant="outline" size="sm">
                Search
              </Button>
            </form>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-muted">Decision:</span>
              {(['all', 'ACCEPTED', 'EDITED', 'REJECTED'] as const).map((dec) => (
                <button
                  key={dec}
                  onClick={() => setSelectedDecision(dec)}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold uppercase ${
                    selectedDecision === dec
                      ? 'bg-slate-text text-obsidian-950'
                      : 'text-slate-muted hover:text-slate-text bg-obsidian-800'
                  }`}
                >
                  {dec}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Precedents Cards */}
        <div className="space-y-4">
          {loading ? (
            <div className="p-12 text-center text-xs font-mono text-slate-muted border-2 border-dashed border-slate-border rounded-xl">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-glacial" />
              Loading Brand Memory precedents...
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="p-12 text-center text-xs font-mono text-slate-muted border-2 border-dashed border-slate-border rounded-xl bg-obsidian-900">
              <History className="w-8 h-8 text-slate-tertiary mx-auto mb-2" />
              <div className="text-sm font-bold text-slate-text">No Matching Review Precedents</div>
              <div className="text-[10px] text-slate-tertiary mt-1">
                Reviewer decisions are recorded automatically whenever a guardian finding is resolved.
              </div>
            </div>
          ) : (
            filteredEntries.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-xl bg-obsidian-900 border-2 border-slate-border shadow-neo space-y-3 font-mono text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-border/50">
                  <div className="flex items-center gap-2">
                    <span className="text-glacial font-bold">{item.id}</span>
                    <span className="text-slate-border">•</span>
                    <span className="text-slate-muted uppercase">{item.category}</span>
                    <span className="text-slate-border">•</span>
                    <span className="text-slate-tertiary">{item.finding_agent}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {getDecisionBadge(item.decision)}
                    <span className="text-[10px] text-slate-tertiary">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-obsidian-950 border border-slate-border/60">
                  <div className="text-[10px] text-slate-muted uppercase font-bold mb-1">Original Claim:</div>
                  <div className="text-slate-text font-bold">&quot;{item.original_text}&quot;</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {item.suggested_correction && (
                    <div className="p-2.5 rounded bg-obsidian-850 border border-slate-border/40">
                      <div className="text-[10px] text-slate-tertiary uppercase font-bold mb-0.5">
                        Guardian Suggested:
                      </div>
                      <div className="text-status-warning font-semibold">&quot;{item.suggested_correction}&quot;</div>
                    </div>
                  )}

                  {item.final_replacement && (
                    <div className="p-2.5 rounded bg-status-success/10 border border-status-success/30">
                      <div className="text-[10px] text-status-success uppercase font-bold mb-0.5">
                        Human Final Replacement:
                      </div>
                      <div className="text-slate-text font-bold">&quot;{item.final_replacement}&quot;</div>
                    </div>
                  )}
                </div>

                {item.reviewer_comment && (
                  <div className="p-2.5 rounded bg-obsidian-800/80 border border-slate-border/40 text-[11px] text-slate-muted flex items-start gap-2">
                    <span className="font-bold text-slate-text shrink-0">Reviewer Rationale:</span>
                    <span className="italic">{item.reviewer_comment}</span>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between text-[10px] text-slate-tertiary border-t border-slate-border/40">
                  <div className="flex items-center gap-2">
                    <span>Reviewed by: <strong className="text-slate-text">{item.created_by_name || 'Review Steward'}</strong></span>
                    {item.is_official_policy && (
                      <span className="px-1.5 py-0.5 rounded bg-status-success/20 text-status-success font-bold flex items-center gap-1 border border-status-success/40">
                        <Award className="w-3 h-3" />
                        Official Policy Exception ({item.policy_version || 'Approved'})
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isAdmin && !item.is_official_policy && (
                      <button
                        type="button"
                        onClick={() => {
                          setPromoteEntry(item);
                          setIsPromoteModalOpen(true);
                        }}
                        className="px-2 py-1 rounded bg-glacial/15 hover:bg-glacial/30 text-glacial border border-glacial/40 font-bold transition-colors"
                      >
                        Promote to Official Exception
                      </button>
                    )}
                    <span className="text-glacial">Non-Authoritative Advisory Record</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Promotion Confirmation Modal */}
        <ConfirmationModal
          isOpen={isPromoteModalOpen}
          onClose={() => {
            setIsPromoteModalOpen(false);
            setPromoteEntry(null);
          }}
          onConfirm={handlePromoteException}
          title="Promote Precedent to Official Exception"
          description={`Are you sure you want to promote the reviewer precedent "${promoteEntry?.original_text}" to an official approved brand policy exception? This action is tracked in the audit log and versioned.`}
          confirmLabel="Promote to Exception"
          cancelLabel="Cancel"
          variant="primary"
        />

      </div>
    </>
  );
}

