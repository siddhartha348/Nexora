import { SectionHeader } from '../components/common/SectionHeader';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { SEO } from '../components/common/SEO';
import { businessConfig } from '../config/business';
import { CheckCircle2 } from 'lucide-react';

export function AccessibilityStatement() {
  const { contactEmail, lastUpdated } = businessConfig;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 font-sans">
      <SEO
        title="Accessibility Statement — WCAG 2.2 AA Conformance"
        description="NEXORA's official accessibility commitment, keyboard navigability standards, and WCAG 2.2 AA conformance benchmarks."
      />

      <SectionHeader
        badge="Inclusivity & Standards"
        title="Accessibility"
        highlight="Statement"
        description={`Last updated: ${lastUpdated ?? 'November 2026'}. Conformance with Web Content Accessibility Guidelines (WCAG) 2.2 Level AA.`}
      />

      <div className="p-4 rounded-md bg-paper border-3 border-ink shadow-neo text-ink text-xs font-mono flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-severity-green shrink-0 mt-0.5" />
        <div>
          <span className="font-bold uppercase tracking-tight block">
            ACCESSIBILITY GUARANTEE:
          </span>
          <p className="text-text-muted mt-1 leading-relaxed">
            NEXORA is designed from the ground up to empower all users, including individuals with visual, motor, auditory, or cognitive disabilities, to participate fully in brand governance and audit workflows.
          </p>
        </div>
      </div>

      <div className="space-y-6 text-xs sm:text-sm text-text-muted leading-relaxed font-mono">

        <Card>
          <CardHeader title="1. Conformance Standard" />
          <CardContent className="space-y-2">
            <p>
              We target and programmatically verify conformance with the <strong>World Wide Web Consortium (W3C) Web Content Accessibility Guidelines (WCAG) 2.2 at Level AA</strong>.
            </p>
            <p>
              All interactive components are validated against contrast thresholds (minimum 4.5:1 for body copy and 3:1 for large typography and active UI borders).
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="2. Keyboard Navigation & Assistive Technology" />
          <CardContent className="space-y-2">
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-ink">
              <li><strong>Skip to Content:</strong> A direct skip-link is the first focusable element on every page.</li>
              <li><strong>Full Keyboard Traversal:</strong> Every button, link, modal, input, dropdown, and tab can be fully operated via Tab, Shift+Tab, Enter, and Space.</li>
              <li><strong>Focus Trapping:</strong> Modal dialogues trap keyboard focus and dismiss immediately upon pressing Escape.</li>
              <li><strong>Thick Visible Focus Rings:</strong> High-visibility 3px outline in primary brand blue with a 2px offset.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="3. Contrast & Color Independence" />
          <CardContent className="space-y-2">
            <p>
              NEXORA strictly enforces that color is never the sole indicator of severity, risk, or status. Every severity finding is paired with a distinct geometric icon and an uppercase textual label (<code>RED</code>, <code>YELLOW</code>, <code>GREEN</code>).
            </p>
            <p>
              Both light mode (#FFFBF0 paper) and dark mode (#14110F obsidian) have been mathematically verified using automated automated contrast testing scripts.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="4. Motion & Animation Preferences" />
          <CardContent className="space-y-2">
            <p>
              The application honors the <code>prefers-reduced-motion</code> media query. Users with vestibular sensitivities experience zero non-essential animations, parallax, or transitions.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="5. Feedback & Remediation Contact" />
          <CardContent className="space-y-2">
            <p>
              We continuously test the platform with automated checkers, screen readers, and keyboard navigation. If you encounter an accessibility barrier, please reach out to our team:
            </p>
            <div className="p-3 bg-paper border-2 border-ink rounded text-xs space-y-1 text-ink">
              <div><strong>Accessibility Officer:</strong> Compliance & Design Governance Lead</div>
              <div>
                <strong>Email:</strong>{' '}
                <a href={`mailto:${contactEmail || 'accessibility@nexora.internal'}`} className="text-primary hover:underline font-bold">
                  {contactEmail || 'accessibility@nexora.internal'}
                </a>
              </div>
              <div><strong>SLA:</strong> Responses to accessibility inquiries within 3 business days.</div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
