import { Link } from 'react-router-dom';
import { ShieldAlert, Home, Search } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { SEO } from '../components/common/SEO';

export function NotFound({ onOpenSearch }: { onOpenSearch?: () => void }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <SEO
        title="404 — Page Not Found"
        description="The requested page route could not be found on the NEXORA brand governance platform."
      />

      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-3xl glass-panel border border-status-critical/30 shadow-glass-glow animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-status-critical/15 border border-status-critical/30 flex items-center justify-center text-status-critical mx-auto shadow-status-critical">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-xs uppercase tracking-widest text-status-critical font-bold">
            HTTP 404 Error
          </span>
          <h1 className="text-2xl font-bold text-slate-text">
            Route Not Located
          </h1>
          <p className="text-xs text-slate-muted leading-relaxed">
            The governance page, audit record, or URL resource you requested does not exist or has been relocated within the registry.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="primary" size="sm" className="w-full" leftIcon={<Home className="w-4 h-4 text-obsidian" />}>
              Return Home
            </Button>
          </Link>
          {onOpenSearch && (
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              onClick={onOpenSearch}
              leftIcon={<Search className="w-4 h-4 text-glacial" />}
            >
              Open Search
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
