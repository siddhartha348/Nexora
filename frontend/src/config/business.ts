/**
 * NEXORA Brand Governance Platform
 * Business Configuration — reads from VITE_ env variables.
 *
 * Rules enforced here:
 *  - Every field returns `string | undefined`.
 *  - Components MUST guard: `{config.contactEmail && <a>…</a>}`.
 *  - Any field that is undefined/empty is omitted from the UI; no placeholder is shown.
 *  - Missing values are catalogued in TODO_BUSINESS_DETAILS.md at the repo root.
 */

function env(key: string): string | undefined {
  const val = import.meta.env[key];
  return val && val.trim() !== '' ? val.trim() : undefined;
}

export interface BusinessConfig {
  /** Registered legal name of the operating entity */
  legalName: string | undefined;
  /** Public-facing trading / brand name */
  tradingName: string | undefined;
  /** Registered address (single string, may contain commas) */
  registeredAddress: string | undefined;
  /** Primary contact email */
  contactEmail: string | undefined;
  /** Primary contact phone number (E.164 or local format) */
  contactPhone: string | undefined;
  /** Full name of the Grievance / Data Protection Officer */
  grievanceOfficerName: string | undefined;
  /** Email address of the Grievance Officer */
  grievanceOfficerEmail: string | undefined;
  /**
   * Governing law jurisdiction shown in legal pages.
   * Example: "India (Telangana)" or "England and Wales"
   */
  jurisdiction: string | undefined;
  /**
   * Company registration / GST / VAT number for display on
   * invoices and legal pages. Example: "GSTIN 36XXXXX1234Z"
   */
  gstOrRegistrationNumber: string | undefined;
  /**
   * ISO 8601 date string — the date the legal documents were last
   * updated. Used in Privacy, Terms, Cookie Policy pages.
   * Example: "2026-11-06"
   */
  lastUpdated: string | undefined;
}

/**
 * Singleton business config object.
 * All fields are read from VITE_-prefixed environment variables.
 * See `.env.example` for the full list.
 */
export const businessConfig: BusinessConfig = {
  legalName: env('VITE_BUSINESS_LEGAL_NAME'),
  tradingName: env('VITE_BUSINESS_TRADING_NAME') ?? 'NEXORA',
  registeredAddress: env('VITE_BUSINESS_ADDRESS'),
  contactEmail: env('VITE_BUSINESS_CONTACT_EMAIL'),
  contactPhone: env('VITE_BUSINESS_CONTACT_PHONE'),
  grievanceOfficerName: env('VITE_GRIEVANCE_OFFICER_NAME'),
  grievanceOfficerEmail: env('VITE_GRIEVANCE_OFFICER_EMAIL'),
  jurisdiction: env('VITE_JURISDICTION'),
  gstOrRegistrationNumber: env('VITE_GST_OR_REG_NUMBER'),
  lastUpdated: env('VITE_LEGAL_LAST_UPDATED') ?? new Date().toISOString().slice(0, 10),
};

