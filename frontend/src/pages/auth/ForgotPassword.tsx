import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { apiRequest } from '../../services/api';
import { useToast } from '../../components/ui/Toast';
import { SEO } from '../../components/common/SEO';

export function ForgotPassword() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const data = await apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      setSubmitted(true);
      if (data.reset_token) {
        setResetToken(data.reset_token);
      }
      toast.success("Reset Dispatched", "Password reset instructions have been dispatched.");
    } catch (err: any) {
      toast.critical("Error", err.message || "Failed to process password reset request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <SEO
        title="Forgot Password — NEXORA Recovery"
        description="Recover access to your NEXORA Brand Governance account."
      />

      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-glacial/15 border border-glacial/40 flex items-center justify-center text-glacial mx-auto">
            <KeyRound className="w-6 h-6 stroke-[2]" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-text tracking-tight">
            Password Recovery
          </h1>
          <p className="text-xs text-slate-muted">
            Enter your registered email to receive a secure recovery token
          </p>
        </div>

        <Card className="border-glacial/30">
          <CardContent>
            {submitted ? (
              <div className="p-6 text-center space-y-4 rounded-xl bg-obsidian-800/80 border border-status-success/30 animate-in zoom-in-95 duration-200">
                <CheckCircle2 className="w-8 h-8 text-status-success mx-auto" />
                <h3 className="text-sm font-semibold text-slate-text">Recovery Request Processed</h3>
                <p className="text-xs text-slate-muted leading-relaxed">
                  If an account exists for <span className="font-mono text-glacial">{email}</span>, password reset credentials have been issued.
                </p>

                {resetToken && (
                  <div className="p-3 rounded-lg bg-obsidian-900 border border-slate-border text-left space-y-2">
                    <span className="text-[10px] uppercase font-mono text-slate-tertiary block">Development Reset Token:</span>
                    <p className="font-mono text-[11px] text-glacial break-all select-all">{resetToken}</p>
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => navigate(`/reset-password?token=${resetToken}`)}
                    >
                      Proceed to Reset Form
                    </Button>
                  </div>
                )}

                <div className="pt-2">
                  <Link to="/login">
                    <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
                      Return to Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Registered Work Email"
                  type="email"
                  placeholder="name@organisation.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4" />}
                  required
                />

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="w-full"
                    isLoading={loading}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Request Recovery Token
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-muted">
          Remembered your password?{' '}
          <Link to="/login" className="text-glacial font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
