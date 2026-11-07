import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { PasswordInput } from '../../components/ui/PasswordInput';
import { Card, CardContent } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { SEO } from '../../components/common/SEO';

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
          <div className="w-12 h-12 rounded-2xl bg-glacial/15 border border-glacial/40 flex items-center justify-center text-glacial mx-auto shadow-glass-glow">
            <ShieldCheck className="w-6 h-6 stroke-[2]" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-text tracking-tight">
            Sign In to <span className="text-glacial">NEXORA</span>
          </h1>
          <p className="text-xs text-slate-muted">
            Enter your credentials to access your organisation's governance hub
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-glacial/30 shadow-glass-glow">
          <CardContent>
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
                  className="w-full"
                  isLoading={loading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Sign In to Platform
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

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
