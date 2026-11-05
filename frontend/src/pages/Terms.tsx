import { SectionHeader } from '../components/common/SectionHeader';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { SEO } from '../components/common/SEO';

export function Terms() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <SEO
        title="Terms and Conditions — Governance Agreement"
        description="NEXORA Terms and Conditions: human reviewer responsibility, decision-support scope, and acceptable governance usage."
      />

      <SectionHeader
        badge="Governance Terms"
        title="Terms &"
        highlight="Conditions"
        description="Last Updated: November 6, 2026. Please read these terms carefully before deploying or operating the NEXORA brand governance platform."
      />

      <div className="space-y-8 text-xs sm:text-sm text-slate-muted leading-relaxed">
        
        <Card className="border-status-warning/40">
          <CardHeader title="1. Important Legal Notice & Scope Disclaimer" />
          <CardContent className="space-y-3">
            <p className="text-slate-text font-medium">
              NEXORA is an automated decision-support platform designed to assist human reviewers in maintaining brand consistency and factual alignment. NEXORA does not provide legal advice, regulatory compliance guarantees, or warranty of perfect factual completeness.
            </p>
            <p>
              Under no circumstances does an automated GREEN rating replace or waive the necessity of human approval. All publication and distribution authorizations remain solely the legal responsibility of your organization and designated human approvers.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="2. Acceptable Use & Content Warranties" />
          <CardContent className="space-y-3">
            <p>
              When uploading brand guidelines, specification sheets, and marketing creatives to NEXORA, you warrant that:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-text">
              <li>Your organization holds all necessary rights, licenses, and permissions to process and analyze the submitted creative assets.</li>
              <li>You will not upload malicious code, unauthorized prompt-injection exploits, or illegal materials.</li>
              <li>You will not use the platform to fabricate misleading claims or deceptive advertising.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="3. Role-Based Authority & Administrator Obligations" />
          <CardContent className="space-y-3">
            <p>
              Your organization agrees to assign roles responsibly:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-text">
              <li><strong>Administrators</strong> bear sole responsibility for verifying and approving documents into the Brand Knowledge Hub.</li>
              <li><strong>Approvers</strong> are responsible for validating agent findings and conducting final publication sign-offs.</li>
              <li><strong>Review Memory Precedents</strong> recorded during reviews provide contextual guidance for subsequent evaluations, but do not replace official policy without Administrator ratification.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="4. Limitation of Liability" />
          <CardContent className="space-y-3">
            <p>
              To the fullest extent permitted by applicable law, Team PINNACLE, Code Nexus Hackathon organizers, and problem provider Inkloom AI shall not be liable for any direct, indirect, incidental, or consequential damages arising from the publication of advertising content evaluated by NEXORA.
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
