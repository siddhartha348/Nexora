/**
 * shared/types/recall.ts
 *
 * Advertisement Recall Engine types.
 */

import type { Severity } from './advertisement.js';

export type RecallAlertStatus = 'open' | 'investigating' | 'resolved' | 'dismissed';

export interface RecallAlert {
  id: string;
  organization_id: string;
  advertisement_id: string;
  advertisement_title: string;
  triggered_by_document_id: string;
  triggered_by_document_title: string;
  reason: string;
  severity: Severity;
  status: RecallAlertStatus;
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
  resolution_note?: string;
}

export interface RecallSweepResult {
  sweep_id: string;
  triggered_by: string;
  alerts_created: number;
  advertisements_checked: number;
  completed_at: string;
}

