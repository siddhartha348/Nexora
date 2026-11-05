import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, User, Building, ArrowRight, Check, X, Ticket } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { SEO } from '../../components/common/SEO';

export function Register() {
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [hasInvite, setHasInvite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Password validation checks
  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\/;]/.test(password),
  };
  const isPasswordValid = Object.values(checks).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isPasswordValid) {
      setErrorMessage("Please ensure your password meets all enterprise security criteria.");
      return;
    }

    setLoading(true);
    try {
      await register({
        full_name: fullName,
        email,
        password,
        organization_name: hasInvite ? undefined : orgName || undefined,
        invite_code: hasInvite ? inviteCode.trim() : undefined
      });
      toast.success("Account Created", "Your organisation and administrator session are active.");
      navigate('/app/settings/organization');
    } catch (err: any) {
      setErrorMessage(err.message || "Registration failed. Verify your details.");
      toast.critical("Registration Error", err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <SEO
        title="Register Organisation — NEXORA Governance"
        description="Create an account and initialize your Brand Knowledge Hub on NEXORA."
      />

      <div className="max-w-md w-full space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-glacial/15 border border-glacial/40 flex items-center justify-center text-glacial mx-auto shadow-glass-glow">
            <ShieldCheck className="w-6 h-6 stroke-[2]" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-text tracking-tight">
            Create Your <span className="text-glacial">NEXORA</span> Account
          </h1>
          <p className="text-xs text-slate-muted">
            Establish a new brand workspace or join an existing organisation
          </p>
        </div>

        {/* Register Card */}
        <Card className="border-glacial/30 shadow-glass-glow">
          <CardContent>
            {errorMessage && (
              <div className="p-3.5 mb-4 rounded-xl bg-status-critical/15 border border-status-critical/30 text-xs text-status-critical animate-in fade-in-0 duration-150">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name *"
                placeholder="e.g. Diviti Sri Vyshnavi"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                leftIcon={<User className="w-4 h-4" />}
                required
              />

              <Input
                label="Work Email *"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              {/* Password & Security Checklist */}
              <div className="space-y-2">
                <Input
                  label="Password *"
                  type="password"
                  placeholder="Create secure master password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                  required
                />

                <div className="p-3 rounded-xl bg-obsidian-800/60 border border-slate-border/50 space-y-1.5 text-[11px] font-mono">
                  <span className="text-[10px] uppercase text-slate-tertiary block font-sans font-medium">Password Security Rules:</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <span className={`flex items-center gap-1.5 ${checks.length ? 'text-status-success' : 'text-slate-tertiary'}`}>
                      {checks.length ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} 8+ Characters
                    </span>
                    <span className={`flex items-center gap-1.5 ${checks.upper ? 'text-status-success' : 'text-slate-tertiary'}`}>
                      {checks.upper ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} Uppercase (A-Z)
                    </span>
                    <span className={`flex items-center gap-1.5 ${checks.lower ? 'text-status-success' : 'text-slate-tertiary'}`}>
                      {checks.lower ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} Lowercase (a-z)
                    </span>
                    <span className={`flex items-center gap-1.5 ${checks.number ? 'text-status-success' : 'text-slate-tertiary'}`}>
                      {checks.number ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} Number (0-9)
                    </span>
                    <span className={`flex items-center gap-1.5 ${checks.special ? 'text-status-success' : 'text-slate-tertiary'} col-span-2`}>
                      {checks.special ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} Special Symbol (!@#$...)
                    </span>
                  </div>
                </div>
              </div>

              {/* Organisation / Invite Code Toggle */}
              <div className="pt-1">
                <div className="flex items-center justify-between pb-2 text-xs">
                  <span className="text-slate-muted">Workspace Setup:</span>
                  <button
                    type="button"
                    onClick={() => setHasInvite(!hasInvite)}
                    className="text-glacial hover:underline font-mono text-[11px]"
                  >
                    {hasInvite ? "Create new organisation instead" : "Have an invitation code?"}
                  </button>
                </div>

                {hasInvite ? (
                  <Input
                    label="Invitation Code *"
                    placeholder="e.g. NEX-9F82A1B4"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    leftIcon={<Ticket className="w-4 h-4 text-status-warning" />}
                    hint="Provided by your Brand Administrator"
                    required
                  />
                ) : (
                  <Input
                    label="Organisation / Brand Name *"
                    placeholder="e.g. Acme Consumer Brands"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    leftIcon={<Building className="w-4 h-4" />}
                    hint="You will be assigned as the primary Brand Administrator"
                    required
                  />
                )}
              </div>

              <div className="pt-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full"
                  isLoading={loading}
                  disabled={!isPasswordValid || !fullName || !email}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Complete Registration
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-glacial font-medium hover:underline">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
}
