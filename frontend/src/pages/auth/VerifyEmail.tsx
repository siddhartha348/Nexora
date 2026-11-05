import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, ArrowRight, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { apiRequest } from '../../services/api';
import { SEO } from '../../components/common/SEO';

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const doVerify = async () => {
      if (!token) {
        setError("Missing verification token in URL parameter.");
        setLoading(false);
        return;
      }
      try {
        await apiRequest(`/auth/verify-email?token=${encodeURIComponent(token)}`);
        setVerified(true);
      } catch (err: any) {
        setError(err.message || "Failed to verify email. The token may have expired.");
      } finally {
        setLoading(false);
      }
    };
    doVerify();
  }, [token]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <SEO
        title="Email Verification — NEXORA Identity"
        description="Verify your organizational email address."
      />

      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-12 h-12 rounded-2xl bg-glacial/15 border border-glacial/40 flex items-center justify-center text-glacial mx-auto">
          <ShieldCheck className="w-6 h-6 stroke-[2]" />
        </div>

        <Card className="border-glacial/30">
          <CardContent className="py-8">
            {loading ? (
              <div className="space-y-4">
                <div className="w-8 h-8 rounded-full border-2 border-glacial border-t-transparent animate-spin mx-auto" />
                <p className="text-xs font-mono text-slate-muted">Verifying email credentials...</p>
              </div>
            ) : verified ? (
              <div className="space-y-4 animate-in zoom-in-95 duration-200">
                <CheckCircle2 className="w-10 h-10 text-status-success mx-auto" />
                <h2 className="text-lg font-bold text-slate-text">Email Address Verified</h2>
                <p className="text-xs text-slate-muted max-w-sm mx-auto leading-relaxed">
                  Your identity has been authenticated. Your account now holds full permissions within your designated organization.
                </p>
                <div className="pt-2">
                  <Link to="/login">
                    <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      Proceed to Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-in zoom-in-95 duration-200">
                <AlertTriangle className="w-10 h-10 text-status-critical mx-auto" />
                <h2 className="text-lg font-bold text-slate-text">Verification Anomaly</h2>
                <p className="text-xs text-status-critical max-w-sm mx-auto leading-relaxed font-mono">
                  {error}
                </p>
                <div className="pt-2">
                  <Link to="/login">
                    <Button variant="outline" size="sm">
                      Return to Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
