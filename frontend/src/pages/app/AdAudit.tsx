import React, { useState, useEffect, useRef } from 'react';
import { 
  AlertTriangle, 
  FileText, 
  Globe, 
  Upload, 
  Search, 
  RefreshCw, 
  Eye, 
  Download, 
  Printer,
  ShieldCheck,
  Palette, 
  Type, 
  Scale, 
  MessageSquare,
  Sparkles,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import { useToast } from '../../components/ui/Toast';
import { SEO } from '../../components/common/SEO';

import { Stepper } from '../../components/ui/Stepper';
import { ProgressBar } from '../../components/ui/ProgressBar';

export type AdvertisementSeverity = 'RED' | 'YELLOW' | 'GREEN';
export type JobStatus = 'PENDING' | 'EXTRACTING' | 'REVIEWING' | 'CONSOLIDATING' | 'AUDITING' | 'COMPLETED' | 'READY' | 'FAILED';

export interface EvidenceReference {
  source_document: string;
  version: string;
  page_number: number;
  supporting_excerpt: string;
}

export interface AgentFinding {
  id: string;
  agent: string;
  category: string;
  original_claim: string;
  severity: AdvertisementSeverity;
  status: string;
  explanation: string;
  confidence: number;
  evidence?: EvidenceReference | null;
  suggested_correction?: string | null;
  is_unverifiable: boolean;
}

export interface ConsolidatedReport {
  report_id: string;
  advertisement_id: string;
  overall_severity: AdvertisementSeverity;
  risk_score: number;
  summary: string;
  total_findings: number;
  red_count: number;
  yellow_count: number;
  green_count: number;
  findings: AgentFinding[];
  unverifiable_claims: string[];
  agent_metrics: Record<string, any>;
  generated_at: string;
}

export interface AdvertisementJob {
  id: string;
  organization_id: string;
  title: string;
  source_type: 'FILE' | 'URL';
  file_type?: string;
  file_path?: string;
  target_url?: string;
  status: JobStatus;
  progress: number;
  created_at: string;
  completed_at?: string;
  report?: ConsolidatedReport;
  error_message?: string;
}

export function AdAudit() {
  const { hasRole } = useAuth();
  const { toast } = useToast();
  const isCreatorOrAbove = hasRole(['ADMIN', 'APPROVER', 'REVIEWER', 'CREATOR']);

  // Jobs & Audits List
  const [jobs, setJobs] = useState<AdvertisementJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<AdvertisementJob | null>(null);

  // New Audit Submission Modal
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitMode, setSubmitMode] = useState<'file' | 'url'>('file');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active Job Polling
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const pollingIntervalRef = useRef<any>(null);

  // Findings Filter
  const [filterGuardian, setFilterGuardian] = useState<string>('ALL');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [searchFilter, setSearchFilter] = useState('');

  // Fetch all advertisement jobs
  const fetchJobs = async () => {
    try {
      const data = await apiRequest<AdvertisementJob[]>('/ads');
      setJobs(data);
      // Auto-select first completed job if none selected
      if (!selectedJob && data.length > 0) {
        const completed = data.find(j => j.status === 'COMPLETED');
        if (completed) setSelectedJob(completed);
        else setSelectedJob(data[0]);
      }
    } catch (err: any) {
      toast.critical('Failed to fetch audits', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Polling active job
  useEffect(() => {
    if (!activeJobId) {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      return;
    }

    const poll = async () => {
      try {
        const updated = await apiRequest<AdvertisementJob>(`/ads/jobs/${activeJobId}`);
        // Update in jobs list
        setJobs(prev => prev.map(j => j.id === updated.id ? updated : j));
        
        if (selectedJob && selectedJob.id === updated.id) {
          setSelectedJob(updated);
        }

        if (updated.status === 'COMPLETED') {
          toast.success('Audit Completed', `6 AI Guardians successfully evaluated "${updated.title}"`);
          setActiveJobId(null);
          setSelectedJob(updated);
          fetchJobs();
        } else if (updated.status === 'FAILED') {
          toast.critical('Audit Execution Failed', updated.error_message || 'An error occurred during audit');
          setActiveJobId(null);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    };

    poll();
    pollingIntervalRef.current = setInterval(poll, 3000);

    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, [activeJobId]);

  // Handle Submission
  const handleSubmitAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.warning('Title Required', 'Please assign an identifying name or campaign title.');
      return;
    }

    setIsSubmitting(true);
    try {
      let createdJob: AdvertisementJob;

      if (submitMode === 'file') {
        if (!selectedFile) {
          toast.warning('File Required', 'Please choose a PDF, DOCX, PPTX, PNG, or JPG file.');
          setIsSubmitting(false);
          return;
        }
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('title', title.trim());

        createdJob = await apiRequest<AdvertisementJob>('/ads/submit-file', {
          method: 'POST',
          body: formData
        });
      } else {
        if (!url.trim()) {
          toast.warning('URL Required', 'Please provide a valid advertisement or landing page URL.');
          setIsSubmitting(false);
          return;
        }
        createdJob = await apiRequest<AdvertisementJob>('/ads/submit-url', {
          method: 'POST',
          body: JSON.stringify({
            title: title.trim(),
            url: url.trim()
          })
        });
      }

      toast.success('Audit Dispatched', `Job ${createdJob.id} initiated. 6 Guardians evaluating creative.`);
      setIsSubmitModalOpen(false);
      setTitle('');
      setUrl('');
      setSelectedFile(null);
      
      // Prepend job and start polling
      setJobs(prev => [createdJob, ...prev]);
      setSelectedJob(createdJob);
      setActiveJobId(createdJob.id);
    } catch (err: any) {
      toast.critical('Audit Submission Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export Report as JSON
  const handleExportJson = (report: ConsolidatedReport) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `NEXORA_Audit_Report_${report.report_id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('Report Exported', 'Downloaded raw structured JSON report');
  };

  // Filtered findings for current selected report
  const currentReport = selectedJob?.report;
  const filteredFindings = (currentReport?.findings || []).filter(f => {
    if (filterGuardian !== 'ALL' && f.agent !== filterGuardian) return false;
    if (filterSeverity === 'UNVERIFIABLE' && !f.is_unverifiable) return false;
    if (filterSeverity !== 'ALL' && filterSeverity !== 'UNVERIFIABLE' && f.severity !== filterSeverity) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const matchClaim = f.original_claim.toLowerCase().includes(q);
      const matchExpl = f.explanation.toLowerCase().includes(q);
      const matchCat = f.category.toLowerCase().includes(q);
      if (!matchClaim && !matchExpl && !matchCat) return false;
    }
    return true;
  });

  const getGuardianIcon = (agent: string) => {
    switch (agent) {
      case 'Fact Guardian': return <BookOpen className="w-4 h-4 text-glacial" />;
      case 'Voice Guardian': return <MessageSquare className="w-4 h-4 text-[#A0C0D0]" />;
      case 'Terminology Guardian': return <Type className="w-4 h-4 text-status-warning" />;
      case 'Claims Guardian': return <Scale className="w-4 h-4 text-status-critical" />;
      case 'Visual Guardian': return <Palette className="w-4 h-4 text-status-info" />;
      case 'Accessibility Guardian': return <Eye className="w-4 h-4 text-status-success" />;
      default: return <Sparkles className="w-4 h-4 text-glacial" />;
    }
  };

  return (
    <>
      <SEO 
        title="Advertisement Governance & 6-Agent Audits | NEXORA"
        description="Verify multi-format advertisement copy and visuals with 6 Specialist AI Guardians."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Top Header & Telemetry */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b-2 border-obsidian-700">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="cyber" size="sm">[ AI ADVERTISEMENT AUDIT ]</Badge>
              <Badge variant="outline" size="sm">6 GUARDIANS ACTIVE</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-text uppercase tracking-tight">
              Advertisement Governance Engine
            </h1>
            <p className="text-xs text-slate-muted max-w-2xl font-mono">
              Concurrent multimodal evaluation across Fact, Voice, Terminology, Claims, Visual, and Accessibility Guardians with zero hallucinations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchJobs}
              className="gap-2"
              disabled={loading}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {isCreatorOrAbove && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsSubmitModalOpen(true)}
                className="gap-2"
              >
                <Upload className="w-3.5 h-3.5" />
                Submit Creative for Audit
              </Button>
            )}
          </div>
        </div>

        {/* Global Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-obsidian-850 border-2 border-obsidian-700 p-4 shadow-neo-sm">
            <div className="text-[11px] font-mono text-slate-muted uppercase tracking-wider">Total Audited</div>
            <div className="text-2xl font-black font-mono text-slate-text mt-1">{jobs.length}</div>
            <div className="text-[10px] text-slate-muted font-mono mt-0.5">Creatives Scanned</div>
          </div>

          <div className="bg-obsidian-850 border-2 border-status-critical p-4 shadow-neo-critical">
            <div className="text-[11px] font-mono text-status-critical uppercase tracking-wider">Critical [RED]</div>
            <div className="text-2xl font-black font-mono text-status-critical mt-1">
              {jobs.filter(j => j.report?.overall_severity === 'RED').length}
            </div>
            <div className="text-[10px] text-status-critical/80 font-mono mt-0.5">Contradictions / Violations</div>
          </div>

          <div className="bg-obsidian-850 border-2 border-status-warning p-4 shadow-neo-warning">
            <div className="text-[11px] font-mono text-status-warning uppercase tracking-wider">Warning [YELLOW]</div>
            <div className="text-2xl font-black font-mono text-status-warning mt-1">
              {jobs.filter(j => j.report?.overall_severity === 'YELLOW').length}
            </div>
            <div className="text-[10px] text-status-warning/80 font-mono mt-0.5">Drift & Unverifiable Claims</div>
          </div>

          <div className="bg-obsidian-850 border-2 border-status-success p-4 shadow-neo-success">
            <div className="text-[11px] font-mono text-status-success uppercase tracking-wider">Compliant [GREEN]</div>
            <div className="text-2xl font-black font-mono text-status-success mt-1">
              {jobs.filter(j => j.report?.overall_severity === 'GREEN').length}
            </div>
            <div className="text-[10px] text-status-success/80 font-mono mt-0.5">100% Policy Adherence</div>
          </div>
        </div>

        {/* Active Analysis Banner (If currently running a job) */}
        {activeJobId && (
          <div className="bg-obsidian-850 border-2 border-glacial p-5 shadow-neo-accent space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 bg-glacial animate-ping" />
                <span className="text-xs font-mono font-bold uppercase text-glacial">
                  6 AI Guardians Executing Audit In Parallel // Job ID: {activeJobId}
                </span>
              </div>
              <Badge variant="cyber-terminal" size="sm">
                {jobs.find(j => j.id === activeJobId)?.status || 'RUNNING'}
              </Badge>
            </div>
            <p className="text-xs text-slate-muted font-mono">
              Evaluating text facts, tone, trademark rules, superlatives, CIELAB color delta, and WCAG luminance contrast...
            </p>
            <div className="w-full bg-obsidian-950 border border-obsidian-700 h-3 overflow-hidden">
              <div 
                className="bg-glacial h-full transition-all duration-300"
                style={{ width: `${jobs.find(j => j.id === activeJobId)?.progress || 45}%` }}
              />
            </div>
          </div>
        )}

        {/* Main Content: Split Master-Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Audits History List (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold font-mono uppercase text-slate-text tracking-wider">
                Audit History ({jobs.length})
              </h2>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs font-mono text-slate-muted border-2 border-dashed border-obsidian-700">
                Loading audit registry...
              </div>
            ) : jobs.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-slate-muted border-2 border-dashed border-obsidian-700 space-y-3">
                <p>No advertisements audited yet.</p>
                {isCreatorOrAbove && (
                  <Button size="sm" variant="outline" onClick={() => setIsSubmitModalOpen(true)}>
                    Upload First Creative
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
                {jobs.map((job) => {
                  const isSelected = selectedJob?.id === job.id;
                  const severity = job.report?.overall_severity || 'PENDING';
                  
                  return (
                    <div
                      key={job.id}
                      onClick={() => setSelectedJob(job)}
                      className={`p-3.5 border-2 cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-glacial bg-obsidian-800 shadow-neo' 
                          : 'border-obsidian-700 bg-obsidian-850 hover:border-slate-muted'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {job.source_type === 'FILE' ? (
                              <FileText className="w-3.5 h-3.5 text-glacial shrink-0" />
                            ) : (
                              <Globe className="w-3.5 h-3.5 text-status-info shrink-0" />
                            )}
                            <span className="text-[10px] font-mono uppercase text-slate-muted tracking-wider">
                              {job.file_type ? `.${job.file_type}` : 'PUBLIC URL'}
                            </span>
                          </div>
                          <h3 className="text-xs font-bold text-slate-text truncate" title={job.title}>
                            {job.title}
                          </h3>
                        </div>

                        {/* Severity Pill */}
                        {job.status === 'COMPLETED' ? (
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 border ${
                            severity === 'RED'
                              ? 'bg-status-critical text-black border-black shadow-neo-sm'
                              : severity === 'YELLOW'
                              ? 'bg-status-warning text-black border-black shadow-neo-sm'
                              : 'bg-status-success text-black border-black shadow-neo-sm'
                          }`}>
                            {severity}
                          </span>
                        ) : (
                          <Badge variant="outline" size="sm">
                            {job.status}
                          </Badge>
                        )}
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-obsidian-700 flex items-center justify-between text-[10px] font-mono text-slate-muted">
                        <span>{new Date(job.created_at).toLocaleDateString()}</span>
                        {job.report && (
                          <span className="text-slate-text font-bold">
                            Risk: {job.report.risk_score.toFixed(0)}/100
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Selected Consolidated Report (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {!selectedJob ? (
              <div className="bg-obsidian-850 border-2 border-obsidian-700 p-12 text-center text-slate-muted font-mono text-xs">
                Select an audited creative on the left to inspect its multi-agent governance report.
              </div>
            ) : selectedJob.status !== 'COMPLETED' || !selectedJob.report ? (
              <div className="bg-obsidian-850 border-3 border-ink p-8 text-center space-y-6 shadow-neo">
                <div className="max-w-md mx-auto">
                  <h3 className="text-base font-black text-ink uppercase tracking-tight mb-2">
                    Autonomous Multi-Agent Audit in Progress
                  </h3>
                  <p className="text-xs text-slate-muted mb-6">
                    Auditing advertisement creative against approved organizational knowledge with live multi-stage pipeline:
                  </p>
                  
                  {/* Stepper tracking Extracting -> Reviewing -> Consolidating -> Ready */}
                  <Stepper
                    currentStep={
                      selectedJob.status === 'EXTRACTING'
                        ? 0
                        : selectedJob.status === 'REVIEWING' || selectedJob.status === 'AUDITING'
                        ? 1
                        : selectedJob.status === 'CONSOLIDATING'
                        ? 2
                        : selectedJob.status === 'COMPLETED' || selectedJob.status === 'READY'
                        ? 3
                        : 0
                    }
                    steps={[
                      { id: 'extract', label: 'Extracting', description: 'OCR & Vision' },
                      { id: 'review', label: 'Reviewing', description: '6 Guardians' },
                      { id: 'consolidate', label: 'Consolidating', description: 'Risk Manager' },
                      { id: 'ready', label: 'Ready', description: 'Evidence Report' }
                    ]}
                  />

                  <div className="mt-6 pt-4 border-t-2 border-slate-border">
                    <ProgressBar
                      value={selectedJob.progress || 25}
                      label="Pipeline Progress"
                      showPercentage={true}
                      variant="primary"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* COMPLETED REPORT VIEW */
              <div className="space-y-6">

                {/* Report Header & Verdict Card */}
                <div className={`p-6 border-2 bg-obsidian-850 ${
                  selectedJob.report.overall_severity === 'RED'
                    ? 'border-status-critical shadow-neo-critical'
                    : selectedJob.report.overall_severity === 'YELLOW'
                    ? 'border-status-warning shadow-neo-warning'
                    : 'border-status-success shadow-neo-success'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-obsidian-700">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-muted">
                          Report ID: {selectedJob.report.report_id}
                        </span>
                        <span className="text-slate-muted">•</span>
                        <span className="text-[10px] font-mono text-slate-muted">
                          {new Date(selectedJob.report.generated_at).toLocaleString()}
                        </span>
                      </div>
                      <h2 className="text-xl font-black text-slate-text uppercase">
                        {selectedJob.title}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.print()}
                        className="gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Print / Export PDF
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExportJson(selectedJob.report!)}
                        className="gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Export JSON
                      </Button>
                    </div>
                  </div>

                  {/* Verdict & Score Meter */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 mt-5 items-center">
                    <div className="sm:col-span-8 space-y-2">
                      <div className="flex items-center gap-2.5">
                        <span className={`text-xs font-mono font-black uppercase px-2.5 py-1 border-2 text-black ${
                          selectedJob.report.overall_severity === 'RED'
                            ? 'bg-status-critical border-black shadow-neo-sm'
                            : selectedJob.report.overall_severity === 'YELLOW'
                            ? 'bg-status-warning border-black shadow-neo-sm'
                            : 'bg-status-success border-black shadow-neo-sm'
                        }`}>
                          OVERALL VERDICT: {selectedJob.report.overall_severity}
                        </span>
                        <span className="text-xs font-mono text-slate-muted">
                          ({selectedJob.report.total_findings} Total Findings Evaluated)
                        </span>
                      </div>
                      <p className="text-xs text-slate-text leading-relaxed font-mono">
                        {selectedJob.report.summary}
                      </p>
                    </div>

                    <div className="sm:col-span-4 bg-obsidian-900 border-2 border-obsidian-700 p-3.5 text-center">
                      <div className="text-[10px] font-mono text-slate-muted uppercase">Risk Score</div>
                      <div className={`text-3xl font-black font-mono mt-0.5 ${
                        selectedJob.report.risk_score >= 60 
                          ? 'text-status-critical' 
                          : selectedJob.report.risk_score >= 25 
                          ? 'text-status-warning' 
                          : 'text-status-success'
                      }`}>
                        {selectedJob.report.risk_score.toFixed(0)} <span className="text-xs text-slate-muted">/ 100</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-muted mt-1">
                        {selectedJob.report.red_count} Critical • {selectedJob.report.yellow_count} Warning • {selectedJob.report.green_count} Verified
                      </div>
                    </div>
                  </div>

                  {/* Mandatory Human Responsibility Disclaimer Banner */}
                  <div className="mt-4 pt-3 border-t-2 border-obsidian-700/80 flex items-start gap-2.5 bg-paper p-3 border-2 border-ink text-ink text-xs font-mono shadow-neo-sm">
                    <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold uppercase tracking-tight block">
                        HONEST POSITIONING & HUMAN RESPONSIBILITY NOTICE:
                      </span>
                      <p className="text-[11px] text-slate-muted mt-0.5 leading-relaxed">
                        NEXORA supports human reviewers. It does not guarantee legal compliance or perfect factual accuracy. GREEN means "no critical issues detected by the automated checks performed", never "safe" or "compliant". Humans make all final approval decisions.
                      </p>
                    </div>
                  </div>
                </div>

                {/* UNVERIFIABLE Alert Banner (Strict Citation Rule) */}
                {selectedJob.report.unverifiable_claims && selectedJob.report.unverifiable_claims.length > 0 && (
                  <div className="bg-obsidian-850 border-2 border-status-warning p-4 shadow-neo-warning space-y-2">
                    <div className="flex items-center gap-2 text-status-warning font-mono font-bold text-xs uppercase tracking-wider">
                      <AlertTriangle className="w-4 h-4" />
                      Strict Knowledge Hub Grounding Alert: Unverifiable Claims Detected
                    </div>
                    <p className="text-xs text-slate-muted leading-relaxed font-mono">
                      The following assertions could not be confirmed against approved Knowledge Hub documentation. In accordance with zero-hallucination policy, these claims are flagged for Legal review prior to publication:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-xs font-mono text-status-warning pl-1">
                      {selectedJob.report.unverifiable_claims.map((claim, idx) => (
                        <li key={idx}>"{claim}"</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Six Guardians Telemetry Bar */}
                <div className="bg-obsidian-850 border-2 border-obsidian-700 p-4 shadow-neo">
                  <h3 className="text-xs font-mono font-bold uppercase text-slate-text tracking-wider mb-3">
                    Six Specialist Guardians Telemetry
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { name: 'Fact Guardian', count: selectedJob.report.findings.filter(f => f.agent === 'Fact Guardian').length },
                      { name: 'Voice Guardian', count: selectedJob.report.findings.filter(f => f.agent === 'Voice Guardian').length },
                      { name: 'Terminology Guardian', count: selectedJob.report.findings.filter(f => f.agent === 'Terminology Guardian').length },
                      { name: 'Claims Guardian', count: selectedJob.report.findings.filter(f => f.agent === 'Claims Guardian').length },
                      { name: 'Visual Guardian', count: selectedJob.report.findings.filter(f => f.agent === 'Visual Guardian').length },
                      { name: 'Accessibility Guardian', count: selectedJob.report.findings.filter(f => f.agent === 'Accessibility Guardian').length },
                    ].map((g) => (
                      <button
                        key={g.name}
                        onClick={() => setFilterGuardian(filterGuardian === g.name ? 'ALL' : g.name)}
                        className={`flex items-center justify-between p-2.5 border-2 text-left transition-all ${
                          filterGuardian === g.name 
                            ? 'border-glacial bg-obsidian-800 shadow-neo-sm' 
                            : 'border-obsidian-700 bg-obsidian-900 hover:border-slate-border'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {getGuardianIcon(g.name)}
                          <span className="text-[11px] font-mono font-bold text-slate-text">{g.name}</span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-muted">{g.count}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Findings Feed & Filters */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-obsidian-850 border-2 border-obsidian-700 p-3 shadow-neo-sm">
                    <div className="flex items-center gap-2 overflow-x-auto">
                      <span className="text-[10px] font-mono text-slate-muted uppercase">Filter Severity:</span>
                      {['ALL', 'RED', 'YELLOW', 'GREEN', 'UNVERIFIABLE'].map(sev => (
                        <button
                          key={sev}
                          onClick={() => setFilterSeverity(sev)}
                          className={`text-[10px] font-mono font-bold px-2 py-1 border transition-all ${
                            filterSeverity === sev
                              ? 'bg-glacial text-obsidian-950 border-black shadow-neo-sm'
                              : 'bg-obsidian-900 text-slate-muted border-obsidian-700 hover:text-slate-text'
                          }`}
                        >
                          {sev}
                        </button>
                      ))}
                    </div>

                    <div className="relative min-w-[200px]">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-muted" />
                      <input
                        type="text"
                        placeholder="Search findings..."
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        className="w-full bg-obsidian-900 border-2 border-obsidian-700 text-xs font-mono text-slate-text pl-8 pr-3 py-1.5 focus:border-glacial focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Findings Cards List */}
                  {filteredFindings.length === 0 ? (
                    <div className="p-8 text-center text-xs font-mono text-slate-muted border-2 border-dashed border-obsidian-700">
                      No findings match current filter criteria.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredFindings.map((finding) => (
                        <div 
                          key={finding.id}
                          className={`p-4 border-2 bg-obsidian-850 shadow-neo-sm space-y-3 ${
                            finding.severity === 'RED'
                              ? 'border-status-critical/80'
                              : finding.severity === 'YELLOW'
                              ? 'border-status-warning/80'
                              : 'border-status-success/80'
                          }`}
                        >
                          {/* Finding Header */}
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {getGuardianIcon(finding.agent)}
                              <span className="text-xs font-mono font-bold text-slate-text">
                                {finding.agent}
                              </span>
                              <span className="text-slate-muted font-mono">•</span>
                              <span className="text-[11px] font-mono text-slate-muted uppercase">
                                {finding.category}
                              </span>
                              <span className="text-[10px] font-mono text-slate-tertiary">
                                [{finding.id}]
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {finding.is_unverifiable && (
                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 border border-status-warning text-status-warning bg-obsidian-900">
                                  UNVERIFIABLE
                                </span>
                              )}
                              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 border text-black ${
                                finding.severity === 'RED'
                                  ? 'bg-status-critical border-black'
                                  : finding.severity === 'YELLOW'
                                  ? 'bg-status-warning border-black'
                                  : 'bg-status-success border-black'
                              }`}>
                                {finding.severity}
                              </span>
                              <span className="text-[10px] font-mono text-slate-muted">
                                {(finding.confidence * 100).toFixed(0)}% Conf
                              </span>
                            </div>
                          </div>

                          {/* Claim Excerpt */}
                          <div className="bg-obsidian-900 border border-obsidian-700 p-2.5">
                            <div className="text-[10px] font-mono uppercase text-slate-muted tracking-wider mb-1">
                              Creative Excerpt
                            </div>
                            <div className="text-xs font-mono text-slate-text font-bold">
                              "{finding.original_claim}"
                            </div>
                          </div>

                          {/* Finding Explanation */}
                          <p className="text-xs text-slate-muted font-mono leading-relaxed">
                            {finding.explanation}
                          </p>

                          {/* Authoritative Citation Reference (Strict Evidence) */}
                          {finding.evidence && (
                            <div className="bg-obsidian-950 border-2 border-glacial/40 p-3 space-y-1.5">
                              <div className="flex items-center gap-2 text-glacial text-[11px] font-mono font-bold">
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>Authoritative Evidence Citation</span>
                                <span className="text-[10px] text-slate-muted">
                                  [{finding.evidence.source_document} {finding.evidence.version} • Page {finding.evidence.page_number}]
                                </span>
                              </div>
                              <blockquote className="text-xs font-mono text-glacial italic pl-2 border-l-2 border-glacial">
                                "{finding.evidence.supporting_excerpt}"
                              </blockquote>
                            </div>
                          )}

                          {/* Suggested Correction */}
                          {finding.suggested_correction && (
                            <div className="flex items-start gap-2 bg-obsidian-900 border border-status-success/40 p-2.5 text-xs font-mono text-status-success">
                              <ArrowRight className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold">Recommended Correction: </span>
                                {finding.suggested_correction}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>

        </div>

        {/* Audit Submission Modal */}
        <Modal
          isOpen={isSubmitModalOpen}
          onClose={() => setIsSubmitModalOpen(false)}
          title="Submit Advertisement Creative for 6-Agent Audit"
        >
          <form onSubmit={handleSubmitAudit} className="space-y-4">
            <div className="flex border-b-2 border-obsidian-700 pb-2 gap-4">
              <button
                type="button"
                onClick={() => setSubmitMode('file')}
                className={`text-xs font-mono font-bold pb-1 transition-all ${
                  submitMode === 'file'
                    ? 'text-glacial border-b-2 border-glacial'
                    : 'text-slate-muted hover:text-slate-text'
                }`}
              >
                [ UPLOAD CREATIVE FILE ]
              </button>
              <button
                type="button"
                onClick={() => setSubmitMode('url')}
                className={`text-xs font-mono font-bold pb-1 transition-all ${
                  submitMode === 'url'
                    ? 'text-glacial border-b-2 border-glacial'
                    : 'text-slate-muted hover:text-slate-text'
                }`}
              >
                [ PUBLIC ADVERTISEMENT URL ]
              </button>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-text mb-1 uppercase">
                Campaign / Creative Title *
              </label>
              <Input
                placeholder="e.g. Q4 Flagship Drone Launch - Print & Web Copy"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {submitMode === 'file' ? (
              <div>
                <label className="block text-xs font-mono font-bold text-slate-text mb-1 uppercase">
                  Select Creative Asset (PDF, DOCX, PPTX, PNG, JPG) *
                </label>
                <div 
                  role="button"
                  tabIndex={0}
                  aria-label="Upload advertisement creative file. Drag and drop or press Enter or Space to browse files"
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      const dropped = e.dataTransfer.files[0];
                      const validExts = ['pdf', 'docx', 'pptx', 'png', 'jpg', 'jpeg'];
                      const ext = dropped.name.split('.').pop()?.toLowerCase();
                      if (!ext || !validExts.includes(ext)) {
                        toast.critical('Unsupported Format', 'Please upload a PDF, DOCX, PPTX, PNG, or JPG file.');
                        return;
                      }
                      if (dropped.size > 25 * 1024 * 1024) {
                        toast.critical('File Oversized', 'Maximum permissible file size is 25MB.');
                        return;
                      }
                      setSelectedFile(dropped);
                      if (!title) {
                        setTitle(dropped.name.replace(/\.[^/.]+$/, ''));
                      }
                    }
                  }}
                  className={`border-3 border-dashed p-6 text-center cursor-pointer transition-colors outline-none focus:ring-3 focus:ring-primary ${
                    isDragOver 
                      ? 'border-primary bg-primary/10' 
                      : 'border-ink bg-paper hover:border-primary shadow-neo-sm'
                  }`}
                >
                  <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-xs font-mono text-ink font-bold">
                    {selectedFile ? selectedFile.name : 'Drag & drop creative asset, or press Enter to browse'}
                  </div>
                  <div className="text-[10px] font-mono text-slate-muted mt-1">
                    Max size: 25MB • Multimodal OCR, layout regions, & color extraction enabled
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.pptx,.png,.jpg,.jpeg"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const f = e.target.files[0];
                      if (f.size > 25 * 1024 * 1024) {
                        toast.critical('File Oversized', 'Maximum permissible file size is 25MB.');
                        return;
                      }
                      setSelectedFile(f);
                      if (!title) {
                        setTitle(f.name.replace(/\.[^/.]+$/, ''));
                      }
                    }
                  }}
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-mono font-bold text-slate-text mb-1 uppercase">
                  Public Advertisement / Landing Page URL *
                </label>
                <Input
                  type="url"
                  placeholder="https://example.com/promotions/winter-flagship"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="pt-3 border-t-2 border-obsidian-700 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsSubmitModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Initializing Guardians...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Run 6-Agent Governance Audit
                  </>
                )}
              </Button>
            </div>
          </form>
        </Modal>

      </div>
    </>
  );
}
