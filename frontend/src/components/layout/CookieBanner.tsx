import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('nexora_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = (level: 'all' | 'essential') => {
    localStorage.setItem('nexora_cookie_consent', level);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside 
      aria-label="Cookie Consent"
      className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-40 p-5 rounded-2xl glass-panel shadow-glass border border-slate-border animate-in slide-in-from-bottom-5 fade-in-0 duration-300"
    >
      <div className="flex items-start gap-3.5 mb-3">
        <div className="w-8 h-8 rounded-lg bg-glacial/15 border border-glacial/30 flex items-center justify-center text-glacial shrink-0 mt-0.5">
          <Cookie className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-text flex items-center gap-1.5">
            Privacy & Cookie Preferences
          </h4>
          <p className="text-xs text-slate-muted mt-1 leading-relaxed">
            We use strictly essential session cookies and local storage tokens for JWT authentication and UI theme preferences. We do not track or sell marketing cookies.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-border/50">
        <Link 
          to="/cookie-policy" 
          className="text-xs text-slate-muted hover:text-glacial transition-colors underline"
        >
          Read Policy
        </Link>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleConsent('essential')}
          >
            Essential Only
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={() => handleConsent('all')}
            leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}
          >
            Accept All
          </Button>
        </div>
      </div>
    </aside>
  );
}
