import { useState, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  Search, 
  Eye, 
  Check, 
  GitCompare, 
  ShieldCheck, 
  Sparkles,
  BookOpen
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { Tabs } from '../../components/ui/Tabs';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import { useToast } from '../../components/ui/Toast';
import { SEO } from '../../components/common/SEO';

interface ExtractedFact {
  id: string;
  subject: string;
  predicate: string;
  object_value: string;
  unit?: string;
  page_number: number;
  verbatim_quote: string;
  category: string;
}

interface DocVersion {
  version_id: string;
  version_tag: string;
  uploaded_by: string;
  uploaded_by_name: string;
  uploaded_at: string;
  effective_date: string;
  approval_status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  change_summary?: string;
  extracted_facts_count: number;
  chunks_count: number;
}

interface KnowledgeDoc {
  id: string;
  organization_id: string;
  title: string;
  category: string;
  product_association?: string;
  current_version: string;
  approval_status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';
  uploaded_by: string;
  uploaded_by_name: string;
  uploaded_at: string;
  effective_date: string;
  file_type: string;
  file_size_bytes: number;
  versions: DocVersion[];
}

interface DocDetail extends KnowledgeDoc {
  extracted_text_preview: string;
  extracted_facts: ExtractedFact[];
}

interface DiffData {
  document_id: string;
  document_title: string;
  old_version: string;
  new_version: string;
  modified_facts: Array<{
    subject: string;
    predicate: string;
    old_value: string;
    new_value: string;
    old_quote: string;
    new_quote: string;
    page: number;
  }>;
  added_facts: any[];
  removed_facts: any[];
  text_diff_summary: string;
}

export function KnowledgeHub() {
  const { hasRole } = useAuth();
  const { toast } = useToast();
  const isAdmin = hasRole(['ADMIN']);

  const [documents, setDocuments] = useState<KnowledgeDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Drawers
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [docDetail, setDocDetail] = useState<DocDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Upload Form State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('SPECIFICATIONS');
  const [uploadProduct, setUploadProduct] = useState('');
  const [uploadVersionTag, setUploadVersionTag] = useState('v1.0');
  const [isUploading, setIsUploading] = useState(false);

  // Diff Modal State
  const [isDiffOpen, setIsDiffOpen] = useState(false);
  const [diffData, setDiffData] = useState<DiffData | null>(null);
  const [loadingDiff, setLoadingDiff] = useState(false);

  // RAG Search Playground
  const [ragQuery, setRagQuery] = useState('');
  const [ragResults, setRagResults] = useState<any[]>([]);
  const [isSearchingRag, setIsSearchingRag] = useState(false);

  const loadDocuments = async () => {
    try {
      let url = '/knowledge/documents?';
      if (selectedCategory !== 'all') url += `category=${selectedCategory}&`;
      if (selectedStatus !== 'all') url += `status_filter=${selectedStatus}&`;
      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;

      const docs = await apiRequest<KnowledgeDoc[]>(url);
      setDocuments(docs);
    } catch (err: any) {
      toast.critical("Failed to load documents", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [selectedCategory, selectedStatus, searchQuery]);

  const handleInspectDoc = async (docId: string) => {
    setSelectedDocId(docId);
    setLoadingDetail(true);
    try {
      const detail = await apiRequest<DocDetail>(`/knowledge/documents/${docId}`);
      setDocDetail(detail);
    } catch (err: any) {
      toast.critical("Inspection Failed", err.message);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle) {
      toast.warning("Validation Incomplete", "Please attach a file and specify a title.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('title', uploadTitle);
      formData.append('category', uploadCategory);
      if (uploadProduct) formData.append('product_association', uploadProduct);
      if (uploadVersionTag) formData.append('version_tag', uploadVersionTag);

      const res = await apiRequest('/knowledge/upload', {
        method: 'POST',
        body: formData
      });

      toast.success("Document Ingested", `${res.title} uploaded into quarantine. Awaiting Admin Approval.`);
      setIsUploadOpen(false);
      setUploadFile(null);
      setUploadTitle('');
      setUploadProduct('');
      loadDocuments();
    } catch (err: any) {
      toast.critical("Upload Rejected", err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleApprove = async (docId: string) => {
    try {
      await apiRequest(`/knowledge/documents/${docId}/approve`, {
        method: 'POST',
        body: JSON.stringify({ notes: "Approved into Official Knowledge baseline" })
      });
      toast.success("Document Approved", "Indexed into ChromaDB vector store as authoritative evidence.");
      loadDocuments();
      if (selectedDocId === docId) handleInspectDoc(docId);
    } catch (err: any) {
      toast.critical("Approval Error", err.message);
    }
  };

  const handleReject = async (docId: string) => {
    const reason = prompt("Enter rejection reason for this document version:");
    if (!reason) return;
    try {
      await apiRequest(`/knowledge/documents/${docId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });
      toast.warning("Document Rejected", "Quarantined and excluded from RAG retrieval.");
      loadDocuments();
      if (selectedDocId === docId) handleInspectDoc(docId);
    } catch (err: any) {
      toast.critical("Rejection Failed", err.message);
    }
  };

  const handleOpenDiff = async (docId: string, vOld: string, vNew: string) => {
    setIsDiffOpen(true);
    setLoadingDiff(true);
    try {
      const diff = await apiRequest<DiffData>(`/knowledge/documents/${docId}/diff?v_old=${vOld}&v_new=${vNew}`);
      setDiffData(diff);
    } catch (err: any) {
      toast.critical("Version Diff Error", err.message);
      setIsDiffOpen(false);
    } finally {
      setLoadingDiff(false);
    }
  };

  const handleRagSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ragQuery.trim()) return;

    setIsSearchingRag(true);
    try {
      const results = await apiRequest('/knowledge/search', {
        method: 'POST',
        body: JSON.stringify({ query: ragQuery, limit: 4 })
      });
      setRagResults(results);
      if (results.length === 0) {
        toast.info("Search Complete", "Zero approved chunks matched. (Unapproved docs are excluded).");
      }
    } catch (err: any) {
      toast.critical("RAG Retrieval Anomaly", err.message);
    } finally {
      setIsSearchingRag(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <SEO
        title="Brand Knowledge Hub — Official Knowledge & RAG"
        description="Ingest, extract, approve, and administer authoritative brand specifications, style guides, and terminology on NEXORA."
      />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-border/50">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="primary" dot size="sm">Brand Knowledge Hub</Badge>
            <Badge variant="mono" size="sm">ChromaDB + MongoDB RAG</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-text">
            Authoritative <span className="text-glacial">Brand Knowledge Repository</span>
          </h1>
          <p className="text-xs text-slate-muted">
            The single source of truth for product specifications, brand guidelines, and approved terminology
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsUploadOpen(true)}
            leftIcon={<Upload className="w-4 h-4 text-obsidian" />}
          >
            Upload Document
          </Button>
        </div>
      </div>

      {/* RAG Verification Playground */}
      <Card className="border-glacial/30 bg-obsidian-800/50">
        <CardHeader
          title="RAG Evidence Retrieval Engine"
          description="Test semantic vector retrieval and exact fact lookup against approved knowledge"
          action={
            <span className="text-[11px] font-mono text-glacial flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-status-success" />
              <span>Strict Gate: Only Approved Chunks Retrievable</span>
            </span>
          }
        />
        <CardContent className="space-y-4">
          <form onSubmit={handleRagSearch} className="flex gap-2">
            <Input
              placeholder="Query specifications or claims (e.g. 'What is the battery life and warranty of Aurora X2?')..."
              value={ragQuery}
              onChange={(e) => setRagQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-glacial" />}
            />
            <Button
              type="submit"
              variant="secondary"
              size="md"
              isLoading={isSearchingRag}
              leftIcon={<Sparkles className="w-4 h-4 text-glacial" />}
            >
              Verify RAG
            </Button>
          </form>

          {ragResults.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {ragResults.map((r, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-obsidian-900/90 border border-glacial/30 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-text flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-glacial" />
                      {r.document_title}
                    </span>
                    <Badge variant="mono" size="sm">{r.version_tag} • p.{r.page_number}</Badge>
                  </div>
                  <p className="text-slate-muted font-mono text-[11px] leading-relaxed bg-obsidian-800/60 p-2 rounded-lg border border-slate-border/50">
                    "{r.content}"
                  </p>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-tertiary">
                    <span>Relevance: {(r.score * 100).toFixed(1)}%</span>
                    <span className="text-status-success font-medium">Authoritative Evidence Cited</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Library Controls & Filtering */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Tabs
            tabs={[
              { id: 'all', label: 'All Documents' },
              { id: 'SPECIFICATIONS', label: 'Specifications' },
              { id: 'GUIDELINES', label: 'Guidelines' },
              { id: 'TERMINOLOGY', label: 'Terminology' },
              { id: 'CLAIMS', label: 'Claims' },
            ]}
            activeTab={selectedCategory}
            onChange={setSelectedCategory}
            variant="pills"
          />

          <div className="flex items-center gap-2">
            <div className="w-48 sm:w-60">
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-3.5 h-3.5 text-slate-muted" />}
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs bg-obsidian-800 border border-slate-border text-slate-text rounded-lg px-3 py-2 focus:border-glacial focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="PENDING">Pending Approval (Quarantine)</option>
              <option value="APPROVED">Approved (Official)</option>
              <option value="REJECTED">Rejected</option>
              <option value="ARCHIVED">Archived (Old Version)</option>
            </select>
          </div>
        </div>

        {/* Document Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Current Version</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Uploaded By</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-muted font-mono animate-pulse">
                  Querying brand knowledge repository...
                </TableCell>
              </TableRow>
            ) : documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs text-slate-muted">
                  No documents found matching current filters. Click "Upload Document" to ingest brand knowledge.
                </TableCell>
              </TableRow>
            ) : (
              documents.map((doc) => {
                const isPending = doc.approval_status === 'PENDING';
                const isApproved = doc.approval_status === 'APPROVED';
                return (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-obsidian-800 border border-slate-border text-glacial">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-semibold text-xs text-slate-text block">{doc.title}</span>
                          <span className="text-[10px] text-slate-tertiary font-mono">
                            {doc.file_type.toUpperCase()} • {(doc.file_size_bytes / 1024).toFixed(0)} KB
                            {doc.product_association && ` • ${doc.product_association}`}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" size="sm">{doc.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs text-glacial font-semibold">{doc.current_version}</span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={isApproved ? 'success' : isPending ? 'warning' : 'critical'} 
                        dot 
                        size="sm"
                      >
                        {doc.approval_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-slate-muted">{doc.uploaded_by_name}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleInspectDoc(doc.id)}
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                        >
                          Inspect
                        </Button>

                        {isAdmin && isPending && (
                          <>
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleApprove(doc.id)}
                              leftIcon={<Check className="w-3.5 h-3.5" />}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleReject(doc.id)}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Document Detail & Fact Inspector Modal */}
      <Modal
        isOpen={!!selectedDocId}
        onClose={() => {
          setSelectedDocId(null);
          setDocDetail(null);
        }}
        size="lg"
        title={docDetail?.title || "Document Detail"}
        description={`Category: ${docDetail?.category || 'Knowledge Document'} • Current Version: ${docDetail?.current_version || ''}`}
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              {docDetail && docDetail.versions.length >= 2 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const vOld = docDetail.versions[docDetail.versions.length - 1].version_tag;
                    const vNew = docDetail.current_version;
                    handleOpenDiff(docDetail.id, vOld, vNew);
                  }}
                  leftIcon={<GitCompare className="w-3.5 h-3.5 text-status-warning" />}
                >
                  Compare Versions ({docDetail.versions[docDetail.versions.length - 1].version_tag} vs {docDetail.current_version})
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isAdmin && docDetail?.approval_status === 'PENDING' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleApprove(docDetail.id)}
                  leftIcon={<Check className="w-3.5 h-3.5 text-obsidian" />}
                >
                  Approve Official Knowledge
                </Button>
              )}
              <Button variant="secondary" size="sm" onClick={() => setSelectedDocId(null)}>
                Close
              </Button>
            </div>
          </div>
        }
      >
        {loadingDetail ? (
          <div className="py-8 text-center text-xs font-mono text-slate-muted animate-pulse">
            Loading document lineage and extracted facts...
          </div>
        ) : docDetail ? (
          <div className="space-y-6">
            {/* Version Timeline */}
            <div className="p-4 rounded-xl bg-obsidian-800/80 border border-slate-border space-y-2">
              <span className="text-[10px] font-mono uppercase text-slate-tertiary block">Version History:</span>
              <div className="space-y-2">
                {docDetail.versions.map((v) => (
                  <div key={v.version_id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-obsidian-900 border border-slate-border/50">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-glacial font-semibold">{v.version_tag}</span>
                      <span className="text-slate-muted">• {v.uploaded_by_name} ({new Date(v.uploaded_at).toLocaleDateString()})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono text-slate-tertiary">{v.extracted_facts_count} Facts</span>
                      <Badge variant={v.approval_status === 'APPROVED' ? 'success' : v.approval_status === 'PENDING' ? 'warning' : 'outline'} size="sm">
                        {v.approval_status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Extracted Facts List */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-text font-mono">
                Extracted Authoritative Facts ({docDetail.extracted_facts.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto">
                {docDetail.extracted_facts.map((f) => (
                  <div key={f.id} className="p-3 rounded-xl bg-obsidian-800/60 border border-slate-border/50 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-text">{f.subject}</span>
                      <span className="font-mono text-[10px] text-glacial">p.{f.page_number}</span>
                    </div>
                    <div className="font-mono text-glacial text-xs">
                      {f.predicate}: <strong className="text-slate-text">{f.object_value}</strong>
                    </div>
                    <p className="text-[10px] text-slate-tertiary italic truncate">
                      "{f.verbatim_quote}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Text Preview */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-slate-tertiary block">Extracted Text Preview:</span>
              <pre className="p-3.5 rounded-xl bg-obsidian-950 border border-slate-border font-mono text-[11px] text-slate-muted max-h-40 overflow-y-auto leading-relaxed">
                {docDetail.extracted_text_preview}
              </pre>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Upload Document Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Ingest Brand Document"
        description="Supported: PDF, DOCX, PPTX, TXT, PNG, JPG (Max 25MB)"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <Input
            label="Document Title *"
            placeholder="e.g. Aurora X2 Product Specification Sheet"
            value={uploadTitle}
            onChange={(e) => setUploadTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Knowledge Category *"
              value={uploadCategory}
              onChange={setUploadCategory}
              options={[
                { value: 'SPECIFICATIONS', label: 'SPECIFICATIONS (Specs, Dimensions, Battery)', description: 'Product technical datasheets' },
                { value: 'GUIDELINES', label: 'GUIDELINES (Tone, Voice, Style)', description: 'Editorial and messaging guidelines' },
                { value: 'TERMINOLOGY', label: 'TERMINOLOGY (Trademarks, Lexicons)', description: 'Approved and restricted vocabulary' },
                { value: 'CLAIMS', label: 'CLAIMS (Approved & Legal Claims)', description: 'Substantiated benchmark claims' },
                { value: 'VISUAL_IDENTITY', label: 'VISUAL IDENTITY (Palettes, Logos)', description: 'Hex palettes and logo rules' },
                { value: 'MARKETING_POLICY', label: 'MARKETING POLICY', description: 'Promotional rules and terms' },
              ]}
            />

            <Input
              label="Product Association (Optional)"
              placeholder="e.g. Aurora X2"
              value={uploadProduct}
              onChange={(e) => setUploadProduct(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Version Tag"
              placeholder="v1.0"
              value={uploadVersionTag}
              onChange={(e) => setUploadVersionTag(e.target.value)}
            />
          </div>

          {/* File Picker */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-muted tracking-wide">
              Document File (PDF, DOCX, PPTX, TXT, PNG, JPG) *
            </label>
            <input
              type="file"
              accept=".pdf,.docx,.doc,.pptx,.ppt,.txt,.md,.png,.jpg,.jpeg"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              required
              className="w-full text-xs text-slate-muted file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-glacial/20 file:text-glacial hover:file:bg-glacial/30 cursor-pointer"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-slate-border/50">
            <Button variant="ghost" size="sm" onClick={() => setIsUploadOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isUploading}
              leftIcon={<Upload className="w-4 h-4 text-obsidian" />}
            >
              Upload & Extract
            </Button>
          </div>
        </form>
      </Modal>

      {/* Version Diff Modal */}
      <Modal
        isOpen={isDiffOpen}
        onClose={() => setIsDiffOpen(false)}
        size="lg"
        title={`Version Delta Comparison: ${diffData?.document_title}`}
        description={`${diffData?.old_version} ➔ ${diffData?.new_version}`}
      >
        {loadingDiff ? (
          <div className="py-8 text-center text-xs font-mono text-slate-muted">Calculating version delta...</div>
        ) : diffData ? (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-status-warning/10 border border-status-warning/30 text-xs text-status-warning font-mono">
              {diffData.text_diff_summary}
            </div>

            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-text font-mono">
              Modified Specifications ({diffData.modified_facts.length})
            </h4>

            <div className="space-y-2">
              {diffData.modified_facts.map((m, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-obsidian-800 border border-slate-border text-xs grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-status-critical uppercase">Previous ({diffData.old_version}):</span>
                    <p className="font-semibold text-slate-text line-through decoration-status-critical">{m.old_value}</p>
                    <p className="text-[10px] text-slate-tertiary italic">"{m.old_quote}"</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-status-success uppercase">Updated ({diffData.new_version}):</span>
                    <p className="font-semibold text-status-success">{m.new_value}</p>
                    <p className="text-[10px] text-slate-tertiary italic">"{m.new_quote}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </Modal>

    </div>
  );
}
