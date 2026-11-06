/**
 * shared/types/advertisement.ts
 *
 * Canonical TypeScript types for Advertisements, Findings, and Reports.
 * Shared between the frontend (src/), server (server/src/), and
 * used as the source of truth for MongoDB document shapes.
 */

export type Severity = 'RED' | 'YELLOW' | 'GREEN';

export type AdStatus =
  | 'uploaded'
  | 'processing'
  | 'audit_complete'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'recalled';

export type GuardianName =
  | 'fact_guardian'
  | 'voice_guardian'
  | 'terminology_guardian'
  | 'claims_guardian'
  | 'visual_guardian'
  | 'accessibility_guardian';

export interface EvidenceReference {
  /** Source document title */
  source_document: string;
  /** Exact verbatim quote from the source document */
  verbatim_quote: string;
  /** Version of the source document at audit time */
  source_version: string;
  /** Page or section reference */
  location?: string;
}

export interface Finding {
  id: string;
  guardian: GuardianName;
  severity: Severity;
  category: string;
  issue: string;
  excerpt: string;
  suggested_correction?: string;
  evidence: EvidenceReference;
  confidence: number; // 0–1
}

export interface GuardianReport {
  guardian: GuardianName;
  status: 'completed' | 'failed' | 'skipped';
  findings: Finding[];
  processed_at: string; // ISO 8601
  model_used?: string;
}

export interface ConsolidatedReport {
  id: string;
  advertisement_id: string;
  organization_id: string;
  overall_severity: Severity;
  guardian_reports: GuardianReport[];
  total_findings: number;
  red_count: number;
  yellow_count: number;
  green_count: number;
  summary: string;
  created_at: string; // ISO 8601
  audit_version: string;
}

export interface Advertisement {
  id: string;
  organization_id: string;
  title: string;
  description?: string;
  file_type: 'pdf' | 'docx' | 'pptx' | 'png' | 'jpg';
  status: AdStatus;
  uploaded_by: string;
  uploaded_at: string; // ISO 8601
  last_audited_at?: string;
  report?: ConsolidatedReport;
  recall_flag: boolean;
  registry_id?: string;
  tags?: string[];
}

