import { SectionHeader } from '../components/common/SectionHeader';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { SEO } from '../components/common/SEO';

export function RefundPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <SEO
        title="Refund & Cancellation Policy — Enterprise Governance"
        description="NEXORA Refund, Subscription Cancellation, and SLA Guarantee Policy."
      />

      <SectionHeader
        badge="Commercial Terms"
        title="Refund &"
        highlight="Cancellation Policy"
        description="Effective Date: November 6, 2026. Clear and predictable commercial terms for NEXORA enterprise brand governance subscriptions and evaluation pilots."
      />

      <div className="space-y-8 text-xs sm:text-sm text-slate-muted leading-relaxed">
        
        <Card>
          <CardHeader title="1. Enterprise Pilot Engagements" />
          <CardContent className="space-y-3">
            <p>
              Organizations participating in initial NEXORA proof-of-concept (POC) evaluation pilots receive full technical onboarding and custom knowledge hub calibration. If an enterprise terminates the evaluation within the first 14 days due to verifiable system non-performance against agreed testing benchmarks, 100% of the pilot setup fee is refundable.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="2. Subscription Cancellations" />
          <CardContent className="space-y-3">
            <p>
              Standard SaaS subscriptions may be cancelled by an authorized Administrator at any time prior to the next billing cycle via the Governance Controls panel. Upon cancellation, your data remains accessible through the end of the active billing period, after which it may be exported or permanently purged pursuant to your data retention settings.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="3. SLA & Service Uptime Commitments" />
          <CardContent className="space-y-3">
            <p>
              For commercial enterprise deployments, NEXORA guarantees 99.9% uptime for the multi-agent review gateway. Scheduled maintenance windows announced at least 48 hours in advance are excluded from uptime calculations. In the event of an unscheduled platform outage exceeding SLA limits, service credits will be credited proportionally toward the subsequent billing cycle.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="4. Contacting Billing Operations" />
          <CardContent className="space-y-2">
            <p>
              For invoicing adjustments, cancellation assistance, or credit queries, submit a ticket through the Contact portal or direct an inquiry to <span className="font-mono text-glacial">billing@nexora.internal</span>.
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
