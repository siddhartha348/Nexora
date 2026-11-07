import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, User, Building, ArrowRight, Ticket, Lock } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { PasswordInput } from '../../components/ui/PasswordInput';
import { PasswordStrengthMeter } from '../../components/ui/PasswordStrengthMeter';
import { CardContent } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { SEO } from '../../components/common/SEO';
import { evaluatePassword } from '../../utils/passwordStrength';

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

  const pwdEvaluation = evaluatePassword(password);
  const isPasswordValid = pwdEvaluation.isValid;

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
      navigate('/app/dashboard');
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
          <div className="w-12 h-12 rounded bg-neo-mint border-3 border-black flex items-center justify-center text-black mx-auto shadow-neo">
            <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-text tracking-tight">
            Create Your <span className="bg-neo-mint px-1.5 py-0.5 rounded border-2 border-black shadow-neo-sm text-black">NEXORA</span> Account
          </h1>
          <p className="text-xs text-slate-muted">
            Establish a new brand workspace or join an existing organisation
          </p>
        </div>

        {/* Register Card */}
        <div className="bg-surface border-3 border-black rounded-xl p-6 shadow-neo-lg space-y-4">
          <CardContent className="p-0">
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
              <div className="space-y-1">
                <PasswordInput
                  label="Password *"
                  placeholder="Create secure master password (12+ characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                  required
                />
                <PasswordStrengthMeter password={password} showRules={true} />
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
        </div>

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
