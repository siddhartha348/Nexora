import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, ShieldCheck, Settings, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  
  // Granular preference states
  const [analyticsOptIn, setAnalyticsOptIn] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('nexora_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    } else {
      try {
        const parsed = JSON.parse(consent);
        setAnalyticsOptIn(!!parsed.analytics);
        setMarketingOptIn(!!parsed.marketing);
      } catch {
        // Legacy fallback
      }
    }
  }, []);

  const saveConsent = (essentialOnly: boolean, analytics: boolean, marketing: boolean) => {
    const consentData = {
      essential: true, // Always required
      analytics: essentialOnly ? false : analytics,
      marketing: essentialOnly ? false : marketing,
      timestamp: new Date().toISOString(),
      policyVersion: 'v2.1'
    };

    localStorage.setItem('nexora_cookie_consent', JSON.stringify(consentData));
    setVisible(false);
    setIsManageModalOpen(false);

    // If analytics rejected, clear any pending UTM tracking parameters
    if (!consentData.analytics) {
      sessionStorage.removeItem('nexora_utm_source');
      sessionStorage.removeItem('nexora_utm_campaign');
      sessionStorage.removeItem('nexora_utm_medium');
    }
  };

  // Re-open banner event listener for footer link
  useEffect(() => {
    const handleReopen = () => {
      setVisible(true);
      setIsManageModalOpen(true);
    };
    window.addEventListener('openCookiePreferences', handleReopen);
    return () => window.removeEventListener('openCookiePreferences', handleReopen);
  }, []);

  if (!visible) return null;

  return (
    <>
      <aside 
        aria-label="Cookie Consent Banner"
        className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-lg z-40 p-5 rounded-md bg-surface border-3 border-ink shadow-neo-xl animate-in slide-in-from-bottom-5 fade-in-0 duration-200 font-sans"
      >
        <div className="flex items-start gap-3.5 mb-3">
          <div className="w-8 h-8 rounded bg-accent-yellow border-2 border-ink flex items-center justify-center text-ink shrink-0 mt-0.5">
            <Cookie className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <h4 className="text-sm font-black text-ink uppercase tracking-tight flex items-center gap-1.5">
              Privacy & Cookie Notice
            </h4>
            <p className="text-xs text-text-muted mt-1 leading-relaxed font-mono text-[11px]">
              We use strictly necessary cookies for authenticated JWT sessions and contrast theme state. Optional analytics and campaign parameters load only after explicit opt-in.
            </p>
          </div>
        </div>

        {/* Equal-weight buttons: Accept All, Reject Non-Essential, Manage */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-3 border-t-2 border-ink/20">
          <Link 
            to="/cookie-policy" 
            className="text-[11px] text-text-muted hover:text-primary transition-colors underline font-mono text-center sm:text-left"
          >
            Cookie Policy
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsManageModalOpen(true)}
              leftIcon={<Settings className="w-3.5 h-3.5" />}
            >
              Manage
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => saveConsent(true, false, false)}
            >
              Reject Non-Essential
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={() => saveConsent(false, true, true)}
              leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}
            >
              Accept All
            </Button>
          </div>
        </div>
      </aside>

      {/* Granular Cookie Management Modal */}
      <Modal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        title="Manage Cookie Preferences"
        description="Configure which cookie categories are permitted to run in your session."
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsManageModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => saveConsent(false, analyticsOptIn, marketingOptIn)}
              leftIcon={<Check className="w-3.5 h-3.5" />}
            >
              Save Preferences
            </Button>
          </div>
        }
      >
        <div className="space-y-4 font-mono text-xs">
          {/* Strictly Necessary */}
          <div className="p-3 bg-paper border-2 border-ink rounded space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-ink uppercase">1. Strictly Necessary Cookies</span>
              <span className="px-2 py-0.5 rounded bg-primary text-white text-[10px] font-bold">ALWAYS ACTIVE</span>
            </div>
            <p className="text-text-muted text-[11px] leading-relaxed">
              Required for secure authentication, CSRF tokens, session verification, and light/dark theme contrast. Cannot be deactivated.
            </p>
          </div>

          {/* Performance & Analytics */}
          <div className="p-3 bg-paper border-2 border-ink rounded space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-ink uppercase block">2. Performance & Analytics</span>
                <span className="text-[10px] text-text-muted">Anonymized telemetry and error diagnostics</span>
              </div>
              <input
                type="checkbox"
                checked={analyticsOptIn}
                onChange={(e) => setAnalyticsOptIn(e.target.checked)}
                className="w-4 h-4 rounded border-2 border-ink text-primary focus:ring-primary"
                aria-label="Opt-in to analytics cookies"
              />
            </div>
            <p className="text-text-muted text-[11px] leading-relaxed">
              Enables retention of UTM campaign tags and aggregate platform error diagnostics. Never sells or profiles data.
            </p>
          </div>

          {/* Marketing & Attribution */}
          <div className="p-3 bg-paper border-2 border-ink rounded space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-ink uppercase block">3. Marketing Attribution</span>
                <span className="text-[10px] text-text-muted">Inbound referral channel attribution</span>
              </div>
              <input
                type="checkbox"
                checked={marketingOptIn}
                onChange={(e) => setMarketingOptIn(e.target.checked)}
                className="w-4 h-4 rounded border-2 border-ink text-primary focus:ring-primary"
                aria-label="Opt-in to marketing attribution cookies"
              />
            </div>
            <p className="text-text-muted text-[11px] leading-relaxed">
              Identifies source campaign channels when you submit a public inquiry. Disabled by default.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}
