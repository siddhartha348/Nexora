import { SectionHeader } from '../components/common/SectionHeader';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { SEO } from '../components/common/SEO';

export function CookiePolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <SEO
        title="Cookie Policy — Transparency in Local Storage"
        description="NEXORA Cookie Policy: strictly essential session tokens, interface preferences, and zero cross-site marketing trackers."
      />

      <SectionHeader
        badge="Cookie Policy"
        title="Cookie & Local Storage"
        highlight="Practices"
        description="Effective Date: November 6, 2026. NEXORA utilizes strictly essential local storage and session tokens to deliver secure authentication and user interface preferences."
      />

      <div className="space-y-8 text-xs sm:text-sm text-slate-muted leading-relaxed">
        
        <Card>
          <CardHeader title="1. What Are Cookies and Local Storage?" />
          <CardContent className="space-y-3">
            <p>
              Cookies and local storage objects are small text strings and key-value pairs stored on your browser when visiting web applications. NEXORA uses browser storage strictly for functional platform operation and security authentication. We do not engage in behavioral advertising or third-party marketing tracking.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="2. Cookies & Storage Keys Utilized by NEXORA" />
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Storage Key</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-mono text-xs text-glacial font-semibold">nexora_token</TableCell>
                  <TableCell className="text-xs">Secure Session Token</TableCell>
                  <TableCell className="text-xs text-slate-muted">Stores encrypted JWT bearer token for role-based authentication.</TableCell>
                  <TableCell className="text-xs font-mono">Session</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-xs text-glacial font-semibold">nexora_cookie_consent</TableCell>
                  <TableCell className="text-xs">Functional Preference</TableCell>
                  <TableCell className="text-xs text-slate-muted">Records your cookie notification preference so the banner is not redisplayed.</TableCell>
                  <TableCell className="text-xs font-mono">1 Year</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-xs text-glacial font-semibold">theme-deep-slate</TableCell>
                  <TableCell className="text-xs">UI Preference</TableCell>
                  <TableCell className="text-xs text-slate-muted">Persists your Obsidian Black vs Deep Slate contrast mode toggle.</TableCell>
                  <TableCell className="text-xs font-mono">Persistent</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="3. Managing Your Preferences" />
          <CardContent className="space-y-3">
            <p>
              You may clear your browser cookies and local storage tokens at any time via your browser settings. Note that clearing authentication tokens will log you out of the active governance review session.
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
