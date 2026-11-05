import { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  UserPlus, 
  Copy, 
  Check, 
  Trash2, 
  Sliders, 
  Key
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { useAuth, type UserRole } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';
import { useToast } from '../../components/ui/Toast';
import { SEO } from '../../components/common/SEO';

interface Member {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  joined_at: string;
}

interface OrgData {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  industry: string;
  settings: Record<string, any>;
  member_count: number;
  created_at: string;
}

export function OrganizationSettings() {
  const { user, hasRole } = useAuth();
  const { toast } = useToast();

  const [org, setOrg] = useState<OrgData | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Settings edit state
  const [orgName, setOrgName] = useState('');
  const [industry, setIndustry] = useState('');
  const [autoRecall, setAutoRecall] = useState(true);
  const [strictMode, setStrictMode] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Invite modal state
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('CREATOR');
  const [isInviting, setIsInviting] = useState(false);
  const [generatedInvite, setGeneratedInvite] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const isAdmin = hasRole(['ADMIN']);

  const loadOrgData = async () => {
    if (!user) return;
    try {
      const orgData = await apiRequest<OrgData>('/organizations/current');
      setOrg(orgData);
      setOrgName(orgData.name);
      setIndustry(orgData.industry || 'Consumer Technology');
      setAutoRecall(orgData.settings?.auto_recall_on_spec_update ?? true);
      setStrictMode(orgData.settings?.strict_mode ?? true);

      const memberList = await apiRequest<Member[]>(`/organizations/${orgData.id}/members`);
      setMembers(memberList);
    } catch (err: any) {
      toast.critical("Failed to load organisation", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrgData();
  }, [user]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org) return;
    setIsSaving(true);
    try {
      const updated = await apiRequest<OrgData>(`/organizations/${org.id}/settings`, {
        method: 'PUT',
        body: JSON.stringify({
          name: orgName,
          industry,
          settings: {
            strict_mode: strictMode,
            auto_recall_on_spec_update: autoRecall
          }
        })
      });
      setOrg(updated);
      toast.success("Settings Saved", "Organisation governance baseline updated.");
    } catch (err: any) {
      toast.critical("Update Error", err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org || !inviteEmail) return;
    setIsInviting(true);
    try {
      const invite = await apiRequest(`/organizations/${org.id}/invitations`, {
        method: 'POST',
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole
        })
      });
      setGeneratedInvite(invite.invite_code);
      toast.success("Invitation Code Generated", `Role: ${inviteRole} assigned.`);
      loadOrgData();
    } catch (err: any) {
      toast.critical("Invite Failed", err.message);
    } finally {
      setIsInviting(false);
    }
  };

  const handleUpdateRole = async (targetUserId: string, newRole: UserRole) => {
    if (!org) return;
    try {
      await apiRequest(`/organizations/${org.id}/members/${targetUserId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole })
      });
      toast.success("Role Reassigned", `User privilege adjusted to ${newRole}.`);
      loadOrgData();
    } catch (err: any) {
      toast.critical("Role Change Blocked", err.message);
    }
  };

  const handleDeactivate = async (targetUserId: string) => {
    if (!org) return;
    try {
      await apiRequest(`/organizations/${org.id}/members/${targetUserId}`, {
        method: 'DELETE'
      });
      toast.warning("Member Deactivated", "Account privileges revoked.");
      loadOrgData();
    } catch (err: any) {
      toast.critical("Action Failed", err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-glacial border-t-transparent animate-spin" />
          <span className="text-xs font-mono text-slate-muted">Loading organisation workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <SEO
        title="Organisation Governance & Access Control"
        description="Administer organisation profile, security policies, team roles, and data isolation parameters."
      />

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-border/50">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <Badge variant="mono" size="sm">Tenant ID: {org?.id.substring(0, 8)}...</Badge>
            <Badge variant="primary" dot size="sm">Active Organisation</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-text">
            {org?.name} <span className="text-glacial">Governance Controls</span>
          </h1>
          <p className="text-xs text-slate-muted">
            Manage your organisation profile, member roles, security parameters, and invitation codes
          </p>
        </div>

        {isAdmin && (
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              setGeneratedInvite(null);
              setInviteEmail('');
              setIsInviteOpen(true);
            }}
            leftIcon={<UserPlus className="w-4 h-4 text-obsidian" />}
          >
            Invite Team Member
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Organization Settings & Security Policy */}
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader
              title="Organisation Profile"
              description="Authoritative identity parameters"
            />
            <CardContent>
              <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                <Input
                  label="Organisation Name"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  disabled={!isAdmin}
                />

                <Input
                  label="Industry Vertical"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  disabled={!isAdmin}
                />

                <div className="p-3.5 rounded-xl bg-obsidian-800/80 border border-slate-border/50 space-y-3">
                  <span className="text-[10px] font-mono uppercase text-slate-tertiary block">
                    Security & Automation Policies
                  </span>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={strictMode}
                      onChange={(e) => setStrictMode(e.target.checked)}
                      disabled={!isAdmin}
                      className="mt-0.5 rounded border-slate-border text-glacial focus:ring-glacial"
                    />
                    <div>
                      <strong className="text-slate-text block">Strict Evidence Citation Gate</strong>
                      <span className="text-slate-muted text-[11px]">Require document ID and page excerpt for every verified claim.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoRecall}
                      onChange={(e) => setAutoRecall(e.target.checked)}
                      disabled={!isAdmin}
                      className="mt-0.5 rounded border-slate-border text-glacial focus:ring-glacial"
                    />
                    <div>
                      <strong className="text-slate-text block">Continuous Advertisement Recall</strong>
                      <span className="text-slate-muted text-[11px]">Automatically re-audit registered creatives when a spec sheet updates.</span>
                    </div>
                  </label>
                </div>

                {isAdmin && (
                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      isLoading={isSaving}
                      leftIcon={<Sliders className="w-3.5 h-3.5" />}
                    >
                      Save Configuration
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Data Isolation Safeguard Card */}
          <div className="p-5 rounded-2xl glass-panel border border-status-success/30 bg-status-success-bg/10 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-status-success font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Tenant Data Isolation Active</span>
            </div>
            <p className="text-slate-muted leading-relaxed text-[11px]">
              Every MongoDB query and ChromaDB collection is strictly namespaced under tenant <span className="font-mono text-glacial">{org?.id}</span>. Cross-organisation access attempts are blocked with 403 Forbidden.
            </p>
          </div>
        </div>

        {/* Right Column: Team Members & RBAC Table */}
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <CardHeader
              title="Team Members & Role Access"
              description={`${members.length} registered members with role-based access rights`}
            />
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Assigned Role</TableHead>
                    <TableHead>Status</TableHead>
                    {isAdmin && <TableHead className="text-right">Manage</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((m) => {
                    const isSelf = m.id === user?.id;
                    return (
                      <TableRow key={m.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold text-xs text-slate-text">
                              {m.full_name} {isSelf && <span className="text-glacial text-[10px] font-mono">(You)</span>}
                            </span>
                            <span className="text-[10px] text-slate-tertiary font-mono">{m.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {isAdmin && !isSelf ? (
                            <select
                              value={m.role}
                              onChange={(e) => handleUpdateRole(m.id, e.target.value as UserRole)}
                              className="text-xs bg-obsidian-800 border border-slate-border text-slate-text rounded px-2 py-1 focus:border-glacial focus:outline-none"
                            >
                              <option value="ADMIN">ADMIN</option>
                              <option value="APPROVER">APPROVER</option>
                              <option value="REVIEWER">REVIEWER</option>
                              <option value="CREATOR">CREATOR</option>
                              <option value="VIEWER">VIEWER</option>
                            </select>
                          ) : (
                            <Badge variant={m.role === 'ADMIN' ? 'primary' : 'mono'} size="sm">
                              {m.role}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className={`text-[11px] font-mono ${m.is_active ? 'text-status-success' : 'text-status-critical'}`}>
                            {m.is_active ? 'Active' : 'Deactivated'}
                          </span>
                        </TableCell>
                        {isAdmin && (
                          <TableCell className="text-right">
                            {!isSelf && m.is_active && (
                              <button
                                onClick={() => handleDeactivate(m.id)}
                                className="text-slate-tertiary hover:text-status-critical transition-colors p-1"
                                title="Deactivate user"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Invite Member Modal */}
      <Modal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title="Invite Team Member"
        description="Generate an invitation code to grant access to this brand workspace"
      >
        {generatedInvite ? (
          <div className="space-y-4 text-center">
            <div className="w-10 h-10 rounded-full bg-status-success/20 text-status-success flex items-center justify-center mx-auto">
              <Check className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-text">Invitation Code Generated</h3>
            <p className="text-xs text-slate-muted">
              Share this single-use registration code with <strong className="text-slate-text">{inviteEmail}</strong>:
            </p>

            <div className="p-3 rounded-xl bg-obsidian-900 border border-glacial/40 flex items-center justify-between">
              <span className="font-mono text-base font-bold text-glacial tracking-wider">{generatedInvite}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedInvite);
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                  toast.info("Code Copied", "Invitation code copied to clipboard.");
                }}
                className="p-1.5 rounded-lg bg-obsidian-800 text-slate-muted hover:text-glacial transition-colors"
              >
                {copiedCode ? <Check className="w-4 h-4 text-status-success" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsInviteOpen(false)}
              className="w-full mt-2"
            >
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleCreateInvite} className="space-y-4">
            <Input
              label="Recipient Work Email *"
              type="email"
              placeholder="colleague@agency.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
            />

            <Select
              label="Assigned RBAC Role *"
              value={inviteRole}
              onChange={(val) => setInviteRole(val as UserRole)}
              options={[
                { value: 'APPROVER', label: 'APPROVER (Brand & Legal Sign-off)', description: 'Authorized to approve or reject advertisements' },
                { value: 'REVIEWER', label: 'REVIEWER (Findings & Suggestions)', description: 'Review agent findings and record precedents' },
                { value: 'CREATOR', label: 'CREATOR (Submit & View Reports)', description: 'Upload campaign creatives and inspect feedback' },
                { value: 'VIEWER', label: 'VIEWER (Read-Only Analytics)', description: 'Inspect dashboards and audit trends' },
                { value: 'ADMIN', label: 'ADMIN (Full Administration)', description: 'Manage users, settings, and official knowledge' },
              ]}
            />

            <div className="pt-2 flex justify-end gap-3">
              <Button variant="ghost" size="sm" onClick={() => setIsInviteOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isInviting}
                leftIcon={<Key className="w-3.5 h-3.5 text-obsidian" />}
              >
                Generate Code
              </Button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
}
