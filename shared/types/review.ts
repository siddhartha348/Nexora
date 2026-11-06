/**
 * shared/types/review.ts
 *
 * Human Review workflow types — approval decisions and Brand Memory precedents.
 */

import type { Severity } from './advertisement.js';

export type ReviewDecision = 'approved' | 'rejected' | 'approved_with_conditions';

export interface ReviewComment {
  reviewer_id: string;
  reviewer_name: string;
  comment: string;
  timestamp: string;
}

export interface HumanReview {
  id: string;
  advertisement_id: string;
  organization_id: string;
  reviewer_id: string;
  reviewer_name: string;
  decision: ReviewDecision;
  rationale: string;
  conditions?: string;
  reviewed_at: string;
  comments: ReviewComment[];
}

export interface BrandMemoryEntry {
  id: string;
  organization_id: string;
  category: string;
  guardian: string;
  decision: ReviewDecision;
  context_summary: string;
  rationale: string;
  severity_at_review: Severity;
  /**
   * Always false — Brand Memory provides contextual precedents only.
   * It never overrides approved knowledge or official policy.
   */
  is_official_policy: false;
  created_at: string;
  created_by: string;
}

