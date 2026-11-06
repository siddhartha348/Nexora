import { useState, useEffect } from 'react';
import { 
  FileCheck, 
  Search, 
  AlertOctagon, 
  RefreshCw,
  Eye,
  Shield,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { useAuth } from '../../context/AuthContext';
import { RegistryApi } from '../../services/api';
import { useToast } from '../../components/ui/Toast';
import { SEO } from '../../components/common/SEO';

export function AdRegistry() {
  const { hasRole } = useAuth();
  const { toast } = useToast();
  const isApproverOrAdmin = hasRole(['ADMIN', 'APPROVER']);

  const [ads, setAds] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Ad for modal actions
  const [selectedAd, setSelectedAd] = useState<any | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('PUBLISHED');
  const [statusUpdating, setStatusUpdating] = useState(false);

  const fetchRegistry = async () => {
    try {
      setLoading(true);
      const res = await RegistryApi.list({
        status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
        severity: selectedSeverity !== 'ALL' ? selectedSeverity : undefined,
        search: searchQuery || undefined,
      });
      setAds(res.advertisements || []);
      setCounts(res.status_counts || {});
    } catch (err: any) {
      toast.critical('Failed to load advertisement registry', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistry();
  }, [selectedStatus, selectedSeverity]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRegistry();
  };

  const handleUpdateStatus = async () => {
    if (!selectedAd) return;
    try {
      setStatusUpdating(true);
      await RegistryApi.updateStatus(selectedAd.id, newStatus);
      toast.success('Status Updated', `Advertisement marked as ${newStatus}`);
      setIsStatusModalOpen(false);
      fetchRegistry();
    } catch (err: any) {
      toast.critical('Update Failed', err.message);
    } finally {
      setStatusUpdating(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity?.toUpperCase()) {
      case 'RED':
        return <Badge variant="critical">RED // ACTION REQUIRED</Badge>;
      case 'YELLOW':
        return <Badge variant="warning">YELLOW // CAUTION</Badge>;
      case 'GREEN':
        return <Badge variant="success">GREEN // NO CRITICAL ISSUES</Badge>;
      default:
        return <Badge variant="outline">PENDING</Badge>;
    }
  };

  const getStatusBadge = (status: string, recallFlag: boolean) => {
    if (recallFlag || status === 'RECALLED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-status-critical/20 text-status-critical border border-status-critical/40 font-mono text-xs font-bold animate-pulse">
          <AlertOctagon className="w-3.5 h-3.5" />
          RECALLED
        </span>
      );
    }
    switch (status?.toUpperCase()) {
      case 'APPROVED':
        return <Badge variant="success">APPROVED</Badge>;
      case 'PUBLISHED':
        return <Badge variant="mono">PUBLISHED</Badge>;
      case 'UNDER_REVIEW':
        return <Badge variant="warning">UNDER REVIEW</Badge>;
      case 'CHANGES_REQUESTED':
        return <Badge variant="warning">CHANGES REQUESTED</Badge>;
      case 'REJECTED':
        return <Badge variant="critical">REJECTED</Badge>;
      default:
        return <Badge variant="outline">DRAFT</Badge>;
    }
  };

  return (
    <>
      <SEO
        title="Advertisement Registry // NEXORA"
        description="Centralized inventory of all registered advertisements, approval states, and recall status."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-slate-border pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 bg-glacial rounded-full" />
              <span className="text-xs font-mono uppercase text-glacial font-bold">
                Governance Inventory // Phase 9
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-text tracking-tight font-mono">
              Advertisement Registry
            </h1>
            <p className="text-xs sm:text-sm text-slate-muted font-mono mt-1">
              Centralized record of all candidate, approved, published, and recalled advertisements.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/app/audits">
              <Button variant="primary" size="sm" className="gap-2">
                <Sparkles className="w-4 h-4" />
                Submit New Advertisement
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={fetchRegistry} className="gap-2">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Honest Positioning Banner */}
        <div className="p-4 rounded-xl bg-obsidian-850 border border-status-warning/40 flex items-start gap-3">
          <Shield className="w-5 h-5 text-status-warning shrink-0 mt-0.5" />
          <div className="text-xs font-mono text-slate-muted leading-relaxed">
            <strong className="text-slate-text">Honest Positioning: </strong>
            NEXORA supports human reviewers. It does not guarantee legal compliance or perfect factual accuracy. 
            GREEN indicates <span className="text-status-success font-bold">&quot;no critical issues detected by the automated checks performed&quot;</span>, never &quot;safe&quot; or &quot;compliant&quot;. Humans decide; nothing is approved automatically.
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="space-y-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-border/60">
            {['ALL', 'UNDER_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'PUBLISHED', 'RECALLED', 'REJECTED', 'DRAFT'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedStatus(tab)}
                className={`px-3 py-1.5 rounded text-xs font-mono font-bold uppercase transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  selectedStatus === tab
                    ? 'bg-glacial text-obsidian-950 shadow-neo-sm'
                    : 'text-slate-muted hover:text-slate-text bg-obsidian-800 border border-slate-border/50'
                }`}
              >
                <span>{tab.replace('_', ' ')}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                  selectedStatus === tab ? 'bg-obsidian-950 text-glacial' : 'bg-obsidian-900 text-slate-tertiary'
                }`}>
                  {counts[tab] || 0}
                </span>
              </button>
            ))}
          </div>

          {/* Search & Severity Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <form onSubmit={handleSearchSubmit} className="flex-1 w-full sm:max-w-md flex gap-2">
              <Input
                placeholder="Search by title, channel, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-tertiary" />}
              />
              <Button type="submit" variant="outline" size="sm">
                Filter
              </Button>
            </form>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs font-mono text-slate-muted shrink-0">Severity:</span>
              <Select
                value={selectedSeverity}
                onChange={(val) => setSelectedSeverity(val)}
                options={[
                  { value: 'ALL', label: 'All Severities' },
                  { value: 'RED', label: 'RED (Action Required)' },
                  { value: 'YELLOW', label: 'YELLOW (Caution)' },
                  { value: 'GREEN', label: 'GREEN (No Critical Issues)' },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Advertisements Table */}
        <div className="border-2 border-slate-border rounded-xl overflow-hidden bg-obsidian-900 shadow-neo">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-obsidian-950 text-slate-muted border-b-2 border-slate-border uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Advertisement / Asset</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Automated Finding</th>
                  <th className="py-3 px-4">Approval State</th>
                  <th className="py-3 px-4">Last Updated</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-border/50 text-slate-text">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-muted">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-glacial" />
                      Loading advertisement registry...
                    </td>
                  </tr>
                ) : ads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-muted">
                      No advertisements match the selected filters.
                    </td>
                  </tr>
                ) : (
                  ads.map((ad) => (
                    <tr key={ad.id} className="hover:bg-obsidian-850/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-text">
                        <div className="flex items-center gap-2">
                          <FileCheck className="w-4 h-4 text-glacial shrink-0" />
                          <div>
                            <div className="font-semibold text-slate-text">{ad.title}</div>
                            <div className="text-[10px] text-slate-tertiary">{ad.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-muted">
                        {ad.channel || 'Unspecified'}
                      </td>
                      <td className="py-3 px-4">
                        {getSeverityBadge(ad.overall_severity)}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(ad.approval_status, ad.recall_flag)}
                      </td>
                      <td className="py-3 px-4 text-slate-muted">
                        {new Date(ad.updated_at || ad.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <Link to="/app/audits">
                          <Button variant="outline" size="sm" className="h-7 text-[11px] px-2.5">
                            <Eye className="w-3 h-3 mr-1" />
                            Audit
                          </Button>
                        </Link>
                        {isApproverOrAdmin && (
                          <Button
                            variant="primary"
                            size="sm"
                            className="h-7 text-[11px] px-2.5"
                            onClick={() => {
                              setSelectedAd(ad);
                              setNewStatus(ad.approval_status || 'PUBLISHED');
                              setIsStatusModalOpen(true);
                            }}
                          >
                            Update
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status Update Modal */}
        <Modal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          title={`Update Publication State // ${selectedAd?.id}`}
        >
          <div className="space-y-4 font-mono text-xs">
            <p className="text-slate-muted">
              Select the publication lifecycle status for <strong className="text-slate-text">{selectedAd?.title}</strong>.
            </p>

            <div>
              <label className="block text-slate-text font-bold mb-1">Target Status:</label>
              <Select
                value={newStatus}
                onChange={(val) => setNewStatus(val)}
                options={[
                  { value: 'PUBLISHED', label: 'PUBLISHED (Live in Market)' },
                  { value: 'APPROVED', label: 'APPROVED (Awaiting Distribution)' },
                  { value: 'CHANGES_REQUESTED', label: 'CHANGES_REQUESTED' },
                  { value: 'RECALLED', label: 'RECALLED (Pulled from Market)' },
                  { value: 'REJECTED', label: 'REJECTED' },
                  { value: 'DRAFT', label: 'DRAFT' },
                ]}
              />
            </div>

            <div className="pt-4 border-t border-slate-border flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setIsStatusModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={statusUpdating}
                onClick={handleUpdateStatus}
              >
                Apply Status
              </Button>
            </div>
          </div>
        </Modal>

      </div>
    </>
  );
}

