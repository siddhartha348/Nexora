import { SectionHeader } from '../components/common/SectionHeader';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { SEO } from '../components/common/SEO';
import { businessConfig } from '../config/business';
import { AlertTriangle } from 'lucide-react';

export function Privacy() {
  const { lastUpdated, grievanceOfficerName, grievanceOfficerEmail, jurisdiction, legalName } = businessConfig;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 font-sans">
      <SEO
        title="Privacy Policy — Data Protection, DPDP Act 2023 & GDPR"
        description="NEXORA's enterprise privacy policy aligned with the Digital Personal Data Protection Act, 2023 (India) and EU GDPR. Zero AI model training on client data."
      />

      <SectionHeader
        badge="Compliance & Trust"
        title="Privacy Policy &"
        highlight="Data Protection"
        description={`Effective Date: ${lastUpdated ?? 'November 2026'}. Purpose-specific data processing, strict enterprise isolation, and zero unauthorized data egress.`}
      />

      {/* Mandatory Lawyer Review Disclaimer Notice */}
      <div className="p-4 rounded-md bg-paper border-3 border-ink shadow-neo text-ink text-xs font-mono flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-accent-yellow shrink-0 mt-0.5" />
        <div>
          <span className="font-bold uppercase tracking-tight block">
            LEGAL NOTICE & PRE-LAUNCH DIRECTIVE:
          </span>
          <p className="text-text-muted mt-1 leading-relaxed">
            This document outlines the actual data handling, processing flows, and technical safeguards implemented in NEXORA. It must be reviewed, customized, and approved by a qualified corporate legal practitioner before production commercial launch.
          </p>
        </div>
      </div>

      <div className="space-y-6 text-xs sm:text-sm text-text-muted leading-relaxed">

        <Card>
          <CardHeader title="1. Overview & Data Fiduciary Details" />
          <CardContent className="space-y-3">
            <p>
              {legalName ? `${legalName} ` : ''}NEXORA (&quot;we&quot;, &quot;us&quot;, or &quot;the Service&quot;) provides an automated brand governance platform designed for organizations. We process business contact credentials, brand specification documents, and marketing advertising creatives exclusively to audit creative accuracy and facilitate automated advertisement recall.
            </p>
            <p>
              <strong>Not for Children:</strong> NEXORA is an enterprise governance platform intended strictly for commercial organizations, marketing teams, and compliance personnel. It is not intended for or directed towards minors or children under 18 years of age.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="2. Digital Personal Data Protection Act, 2023 (DPDP India) Compliance" />
          <CardContent className="space-y-3">
            <p>
              In full alignment with the <strong>Digital Personal Data Protection Act, 2023 (DPDPA)</strong> of India, we observe purpose-specific notice and consent principles:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-ink font-mono text-xs">
              <li><strong>Free, Specific & Informed Consent:</strong> Contact inquiries and registrations require affirmative, unbundled consent checkboxes linking directly to this policy.</li>
              <li><strong>Data Principal Rights:</strong> Users have the affirmative right to access, rectify, update, or erase their personal data from our systems.</li>
              <li><strong>Right to Withdraw Consent:</strong> You may withdraw processing consent at any time, resulting in account deactivation and removal of personal identifiers.</li>
              <li><strong>Security Safeguards:</strong> Cryptographic hashing (bcrypt rounds=12 / argon2id), HttpOnly cookie token storage, and tenant-isolated databases.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="3. General Data Protection Regulation (EU GDPR) Basics" />
          <CardContent className="space-y-3">
            <p>
              For users accessing the Service from the European Economic Area (EEA), we act as a Data Processor for organizational data and a Data Controller for direct user account credentials:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-ink font-mono text-xs">
              <li><strong>Lawful Basis:</strong> Processing is conducted under Article 6(1)(b) (Performance of a Contract) and Article 6(1)(f) (Legitimate Interest in brand compliance).</li>
              <li><strong>Data Portability & Erasure:</strong> Export full audit histories in structured JSON format or request permanent deletion (Article 17).</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="4. Third-Party Sub-Processors & External AI Processing" />
          <CardContent className="space-y-3">
            <p>
              NEXORA operates with complete transparency regarding third parties. We send only bounded excerpts necessary for guardian analysis:
            </p>
            <div className="overflow-x-auto border-2 border-ink rounded my-2">
              <table className="w-full text-xs font-mono">
                <thead className="bg-paper border-b-2 border-ink text-left font-bold text-ink">
                  <tr>
                    <th className="p-2">Provider</th>
                    <th className="p-2">Purpose</th>
                    <th className="p-2">Data Transferred</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/20">
                  <tr>
                    <td className="p-2 font-bold text-ink">Google Cloud (Gemini API)</td>
                    <td className="p-2">Multimodal AI reasoning & copy validation</td>
                    <td className="p-2">Claim excerpts only (No training: X-No-Train: 1)</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-ink">Self-Hosted MongoDB / ChromaDB</td>
                    <td className="p-2">Encrypted vector embeddings & metadata store</td>
                    <td className="p-2">Tenant-isolated chunks & review records</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-ink">Fontsource (@fontsource/outfit)</td>
                    <td className="p-2">Self-hosted typography</td>
                    <td className="p-2">Zero external requests (0 bytes transferred)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              <strong>Zero Model Training Guarantee:</strong> Uploaded advertisement creatives and internal brand guidelines are never utilized to train, fine-tune, or improve third-party AI foundation models.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="5. Data Retention, Breach Notification & Deletion" />
          <CardContent className="space-y-3">
            <p>
              Creative uploads, extraction logs, and review records are retained only for the duration required by your organization's governance lifecycle. Brand Administrators have full self-service authority to delete documents, clear Brand Memory precedents, or purge registered advertisements from the Registry at any time.
            </p>
            <p>
              In the event of a verified data breach, affected organizations and relevant authorities will be notified within statutory deadlines (including CERT-In guidelines under the Information Technology Act).
            </p>
          </CardContent>
        </Card>

        {jurisdiction && (
          <Card>
            <CardHeader title="6. Governing Law & Jurisdiction" />
            <CardContent className="space-y-3">
              <p>
                This Privacy Policy is governed by the laws of <strong className="text-ink">{jurisdiction}</strong>. Any legal disputes shall be subject to the exclusive jurisdiction of the competent courts in that territory.
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader title="7. Grievance Redressal Officer" />
          <CardContent className="space-y-2">
            <p>
              In accordance with the Information Technology Act, 2000 and the DPDP Act, 2023, the details of the designated Grievance Redressal Officer are as follows:
            </p>
            <div className="p-3 bg-paper border-2 border-ink rounded text-xs font-mono space-y-1">
              <div><strong>Name:</strong> {grievanceOfficerName || 'Compliance Officer'}</div>
              <div>
                <strong>Email:</strong>{' '}
                {grievanceOfficerEmail ? (
                  <a href={`mailto:${grievanceOfficerEmail}`} className="text-primary hover:underline font-bold">
                    {grievanceOfficerEmail}
                  </a>
                ) : (
                  'compliance@nexora.internal'
                )}
              </div>
              <div><strong>Jurisdiction:</strong> {jurisdiction || 'New Delhi, India'}</div>
              <div><strong>Response Window:</strong> Within 48 hours for acknowledgment; resolution within statutory periods.</div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
