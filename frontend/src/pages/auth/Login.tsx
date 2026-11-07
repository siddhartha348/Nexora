import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, KeyRound } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { PasswordInput } from '../../components/ui/PasswordInput';
import { CardContent } from '../../components/ui/Card';
import { useAuth, type UserRole } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { SEO } from '../../components/common/SEO';

const DEMO_ACCOUNTS: { role: UserRole; email: string; label: string; badgeColor: string }[] = [
  { role: 'ADMIN', email: 'admin@nexora.com', label: 'Admin (Audrey)', badgeColor: 'bg-neo-purple text-white' },
  { role: 'APPROVER', email: 'approver@nexora.com', label: 'Approver (Marcus)', badgeColor: 'bg-neo-mint text-black' },
  { role: 'REVIEWER', email: 'reviewer@nexora.com', label: 'Reviewer (Elena)', badgeColor: 'bg-neo-yellow text-black' },
  { role: 'CREATOR', email: 'creator@nexora.com', label: 'Creator (Liam)', badgeColor: 'bg-neo-pink text-white' },
  { role: 'VIEWER', email: 'viewer@nexora.com', label: 'Viewer (Sophia)', badgeColor: 'bg-glacial text-black' },
];

export function Login() {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const from = location.state?.from?.pathname || '/app/dashboard';

  const handleSelectDemoAccount = (demoEmail: string, roleName: string) => {
    setEmail(demoEmail);
    setPassword('NexoraDemo2026!');
    toast.info('Demo Account Selected', `Populated credentials for ${roleName}. Click 'Sign In' to proceed.`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage("Please enter both your work email and password.");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success("Authentication Verified", "Welcome to the NEXORA Governance Platform.");
      navigate(from, { replace: true });
    } catch (err: any) {
      setErrorMessage(err.message || "Invalid credentials or session error.");
      toast.critical("Access Denied", err.message || "Authentication rejected.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <SEO
        title="Sign In — Secure Access Gateway"
        description="Authenticate into the NEXORA Brand Governance platform with role-based access controls."
      />

      <div className="max-w-md w-full space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded bg-neo-yellow border-3 border-black flex items-center justify-center text-black mx-auto shadow-neo">
            <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-text tracking-tight">
            Sign In to <span className="bg-neo-yellow px-1.5 py-0.5 rounded border-2 border-black shadow-neo-sm text-black">NEXORA</span>
          </h1>
          <p className="text-xs text-slate-muted">
            Enter your credentials to access your organisation's governance hub
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-surface border-3 border-black rounded-xl p-6 shadow-neo-lg space-y-4">
          <CardContent className="p-0">
            {errorMessage && (
              <div className="p-3.5 mb-4 rounded-xl bg-status-critical/15 border border-status-critical/30 text-xs text-status-critical flex items-start gap-2.5 animate-in fade-in-0 duration-150">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Work Email"
                type="email"
                placeholder="name@organisation.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <div className="space-y-1">
                <PasswordInput
                  label="Password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                  required
                />
                <div className="flex justify-end pt-1">
                  <Link
                    to="/forgot-password"
                    className="text-[11px] text-slate-muted hover:text-glacial transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full bg-neo-blue text-white shadow-neo border-3 border-black font-extrabold"
                  isLoading={loading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Sign In to Platform
                </Button>
              </div>
            </form>

            {/* Neo-Brutalist Demo Accounts Selector */}
            <div className="mt-6 pt-5 border-t-3 border-black/15 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-extrabold text-slate-text flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-neo-blue" />
                  Instant Demo Accounts:
                </span>
                <span className="text-[10px] text-slate-muted bg-surface px-1.5 py-0.5 rounded border border-black font-bold">
                  PW: NexoraDemo2026!
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleSelectDemoAccount(acc.email, acc.label)}
                    className="p-2 rounded border-2 border-black bg-surface text-left shadow-neo-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neo transition-all group flex flex-col justify-between"
                  >
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-extrabold border border-black inline-block mb-1 ${acc.badgeColor}`}>
                      {acc.role}
                    </span>
                    <span className="text-[11px] font-bold text-slate-text truncate group-hover:text-neo-blue transition-colors">
                      {acc.label.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-muted">
          Need a new organisation?{' '}
          <Link to="/register" className="text-glacial font-medium hover:underline">
            Register new organisation
          </Link>
        </p>

      </div>
    </div>
  );
}
