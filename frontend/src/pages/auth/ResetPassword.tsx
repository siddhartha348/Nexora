import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, ArrowRight, Check, X, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { apiRequest } from '../../services/api';
import { useToast } from '../../components/ui/Toast';
import { SEO } from '../../components/common/SEO';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [token, setToken] = useState(searchParams.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) setToken(urlToken);
  }, [searchParams]);

  const checks = {
    length: newPassword.length >= 8,
    upper: /[A-Z]/.test(newPassword),
    lower: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\/;]/.test(newPassword),
    matches: newPassword.length > 0 && newPassword === confirmPassword
  };
  const isValid = checks.length && checks.upper && checks.lower && checks.number && checks.special && checks.matches;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isValid) {
      setErrorMessage("Please ensure passwords match and fulfill all security criteria.");
      return;
    }

    setLoading(true);
    try {
      await apiRequest('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token: token.trim(), new_password: newPassword })
      });
      toast.success("Password Updated", "Your credentials have been securely updated. Please sign in.");
      navigate('/login');
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to reset password. The recovery token may be invalid or expired.");
      toast.critical("Reset Error", err.message || "Password update rejected.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <SEO
        title="Set New Password — NEXORA Security"
        description="Establish a new master password for your NEXORA account."
      />

      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-glacial/15 border border-glacial/40 flex items-center justify-center text-glacial mx-auto">
            <Lock className="w-6 h-6 stroke-[2]" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-text tracking-tight">
            Set New Master Password
          </h1>
          <p className="text-xs text-slate-muted">
            Update your enterprise credentials using your verified recovery token
          </p>
        </div>

        <Card className="border-glacial/30">
          <CardContent>
            {errorMessage && (
              <div className="p-3.5 mb-4 rounded-xl bg-status-critical/15 border border-status-critical/30 text-xs text-status-critical">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Recovery Token *"
                placeholder="Paste your reset token..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
                hint="Provided in recovery dispatch"
                required
              />

              <Input
                label="New Master Password *"
                type="password"
                placeholder="••••••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />

              <Input
                label="Confirm Master Password *"
                type="password"
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                leftIcon={<ShieldCheck className="w-4 h-4" />}
                required
              />

              <div className="p-3 rounded-xl bg-obsidian-800/60 border border-slate-border/50 space-y-1.5 text-[11px] font-mono">
                <span className="text-[10px] uppercase text-slate-tertiary block font-sans font-medium">Security Criteria:</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <span className={`flex items-center gap-1.5 ${checks.length ? 'text-status-success' : 'text-slate-tertiary'}`}>
                    {checks.length ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} 8+ Chars
                  </span>
                  <span className={`flex items-center gap-1.5 ${checks.upper ? 'text-status-success' : 'text-slate-tertiary'}`}>
                    {checks.upper ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} Upper (A-Z)
                  </span>
                  <span className={`flex items-center gap-1.5 ${checks.number ? 'text-status-success' : 'text-slate-tertiary'}`}>
                    {checks.number ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} Number (0-9)
                  </span>
                  <span className={`flex items-center gap-1.5 ${checks.special ? 'text-status-success' : 'text-slate-tertiary'}`}>
                    {checks.special ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} Symbol (!@#)
                  </span>
                  <span className={`flex items-center gap-1.5 ${checks.matches ? 'text-status-success' : 'text-slate-tertiary'} col-span-2`}>
                    {checks.matches ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} Passwords Match
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full"
                  isLoading={loading}
                  disabled={!isValid || !token}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Commit New Password
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
