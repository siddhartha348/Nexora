import { SectionHeader } from '../components/common/SectionHeader';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { SEO } from '../components/common/SEO';
import { businessConfig } from '../config/business';

export function Privacy() {
  const { lastUpdated, grievanceOfficerName, grievanceOfficerEmail, jurisdiction, legalName } = businessConfig;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <SEO
        title="Privacy Policy — Data Isolation & AI Transparency"
        description="NEXORA's Privacy Policy: zero client data model training, organization-level data isolation, and minimal external AI excerpt transmission."
      />

      <SectionHeader
        badge="Legal & Transparency"
        title="Privacy Policy &"
        highlight="Data Governance"
        description={`Effective Date: ${lastUpdated ?? 'See latest version on this page'}. NEXORA respects and protects the confidentiality of your organization's brand assets and proprietary documents.`}
      />

      <div className="space-y-8 text-xs sm:text-sm text-slate-muted leading-relaxed">

        <Card>
          <CardHeader title="1. Overview & Core Privacy Principles" />
          <CardContent className="space-y-3">
            <p>
              {legalName ? `${legalName} ` : ''}NEXORA (&quot;we&quot;, &quot;platform&quot;, or &quot;service&quot;) is an enterprise
              AI-powered brand governance system. We adhere to the fundamental rule that your
              organization&apos;s uploaded specification sheets, guidelines, logos, and advertisement
              creatives are strictly confidential enterprise records.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="2. Organization-Level Data Isolation" />
          <CardContent className="space-y-3">
            <p>We enforce strict multi-tenant isolation across all data layers:</p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-text">
              <li>MongoDB collections are logically partitioned with mandatory tenant identifiers on every query.</li>
              <li>ChromaDB vector embedding collections are strictly namespaced per organization.</li>
              <li>No tenant can inspect, retrieve, or query another organization's Brand Knowledge Hub or Advertisement Registry.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="3. External AI Processing & Minimisation" />
          <CardContent className="space-y-3">
            <p>NEXORA uses external Large Language Model APIs (such as Google Gemini API) for advanced text analysis and multimodal visual reasoning:</p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-text">
              <li><strong>Zero Training Guarantee:</strong> Uploaded advertisement creatives and internal brand guidelines are never utilized to train, fine-tune, or improve third-party AI models.</li>
              <li><strong>Data Minimisation:</strong> Specialist agents send only the minimal necessary text excerpts required to verify a specific claim or evaluate brand tone.</li>
              <li><strong>Air-Gapped Option:</strong> Organizations requiring zero external data egress may elect to deploy locally hosted open-weights models via Ollama.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="4. Retention & Deletion" />
          <CardContent className="space-y-3">
            <p>
              Creative uploads, extraction logs, and review records are retained only for the duration
              required by your organization's governance lifecycle. Brand Administrators maintain complete
              authority to delete documents, clear Review Memory precedents, or purge registered
              advertisements from the Registry at any time.
            </p>
          </CardContent>
        </Card>

        {jurisdiction && (
          <Card>
            <CardHeader title="5. Governing Law" />
            <CardContent className="space-y-3">
              <p>
                This Privacy Policy is governed by the laws of <strong className="text-slate-text">{jurisdiction}</strong>.
                Any disputes shall be subject to the exclusive jurisdiction of the competent courts in that territory.
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader title={jurisdiction ? '6. Contacting the Data Protection Lead' : '5. Contacting the Data Protection Lead'} />
          <CardContent className="space-y-2">
            <p>
              For privacy inquiries or technical auditing verification, contact the NEXORA compliance office
              via the platform contact interface
              {grievanceOfficerEmail && (
                <> or email{' '}
                  <a
                    href={`mailto:${grievanceOfficerEmail}`}
                    className="font-mono text-glacial hover:underline"
                  >
                    {grievanceOfficerEmail}
                  </a>
                </>
              )}
              {grievanceOfficerName && (
                <> (Attn: <span className="font-mono text-slate-text">{grievanceOfficerName}</span>)</>
              )}
              .
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
