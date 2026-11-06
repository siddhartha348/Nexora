/**
 * shared/types/knowledge.ts
 *
 * Canonical types for the Brand Knowledge Hub.
 * Documents flow: uploaded → pending_review → approved | rejected.
 * Only approved versions feed the RAG pipeline and guardian agents.
 */

export type KnowledgeDocStatus = 'pending_review' | 'approved' | 'rejected' | 'superseded';

export type KnowledgeDocCategory =
  | 'product_specs'
  | 'brand_guidelines'
  | 'terminology_lexicon'
  | 'legal_compliance'
  | 'pricing'
  | 'warranty'
  | 'other';

export interface KnowledgeDocVersion {
  version: string;
  uploaded_by: string;
  uploaded_at: string;
  approved_by?: string;
  approved_at?: string;
  status: KnowledgeDocStatus;
  change_summary?: string;
  file_path?: string;
}

export interface KnowledgeDocument {
  id: string;
  organization_id: string;
  title: string;
  category: KnowledgeDocCategory;
  current_version: string;
  versions: KnowledgeDocVersion[];
  tags?: string[];
  created_at: string;
  updated_at: string;
}

