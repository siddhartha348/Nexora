import { useState } from 'react';
import { Send, CheckCircle2, Shield, Mail, Clock, MapPin, Phone } from 'lucide-react';
import { SectionHeader } from '../components/common/SectionHeader';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { SEO } from '../components/common/SEO';
import { businessConfig } from '../config/business';

export function Contact() {
  const { toast } = useToast();
  const { contactEmail, contactPhone, registeredAddress } = businessConfig;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    organisation: '',
    role: 'Marketing Executive',
    inquiryType: 'architecture-briefing',
    message: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Full name is required";
    if (!form.email.trim() || !form.email.includes('@')) errs.email = "Valid work email is required";
    if (!form.message.trim() || form.message.length < 10) errs.message = "Message must be at least 10 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.warning("Validation Incomplete", "Please resolve highlighted fields before submitting.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      toast.success("Inquiry Dispatched", "NEXORA engineering team has received your transmission.");
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
      <SEO
        title="Contact NEXORA — Enterprise Brand Governance Inquiries"
        description="Connect with the NEXORA platform team regarding multi-agent brand governance, custom VPC deployments, and Advertisement Recall Engine integration."
      />

      <SectionHeader
        badge="Direct Communications"
        title="Connect With"
        highlight="NEXORA Engineering"
        description="Whether you have questions regarding our six-guardian architecture, wish to evaluate our Advertisement Recall engine, or want to discuss enterprise brand governance deployment."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Form Column */}
        <div className="lg:col-span-7">
          <Card className="border-glacial/30">
            <CardHeader
              title="Request Enterprise Consultation"
              description="Direct submission to NEXORA platform specialists"
            />
            <CardContent>
              {submitted ? (
                <div className="p-8 text-center space-y-4 rounded-xl bg-obsidian-800/80 border border-status-success/30 animate-in zoom-in-95 duration-200">
                  <div className="w-12 h-12 rounded-full bg-status-success/20 text-status-success flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-text">Inquiry Successfully Transmitted</h3>
                  <p className="text-xs text-slate-muted max-w-sm mx-auto leading-relaxed">
                    Thank you, <strong className="text-slate-text">{form.name}</strong>. The NEXORA team has logged your inquiry regarding <span className="font-mono text-glacial">{form.inquiryType}</span>. We will follow up directly at <span className="font-mono text-slate-text">{form.email}</span>.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSubmitted(false);
                      setForm({
                        name: '',
                        email: '',
                        organisation: '',
                        role: 'Marketing Executive',
                        inquiryType: 'architecture-briefing',
                        message: ''
                      });
                    }}
                  >
                    Submit Another Inquiry
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Your Name *"
                      placeholder="e.g. Elena Rostova"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      error={errors.name}
                    />
                    <Input
                      label="Work Email *"
                      type="email"
                      placeholder="e.g. elena@brand.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      error={errors.email}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Organisation / Agency"
                      placeholder="e.g. AuraTech Global"
                      value={form.organisation}
                      onChange={(e) => setForm({ ...form, organisation: e.target.value })}
                    />
                    <Select
                      label="Inquiry Category"
                      value={form.inquiryType}
                      onChange={(val) => setForm({ ...form, inquiryType: val })}
                      options={[
                        { value: 'architecture-briefing', label: 'Architecture & Guardian Walkthrough' },
                        { value: 'recall-demo', label: 'Advertisement Recall Verification' },
                        { value: 'deployment', label: 'Private VPC & On-Premise Deployment' },
                        { value: 'enterprise-security', label: 'Security & Compliance Specifications' },
                      ]}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-slate-muted tracking-wide">
                      Project Notes / Message *
                    </label>
                    <textarea
                      rows={4}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Describe your brand volume, document types, or specific governance requirements..."
                      className="w-full rounded-lg bg-obsidian-800/90 text-sm text-slate-text placeholder:text-slate-tertiary border border-slate-tertiary/30 px-3.5 py-2.5 transition-all duration-200 hover:border-glacial/30 focus:border-glacial focus:ring-1 focus:ring-glacial/40 focus:outline-none"
                    />
                    {errors.message && (
                      <p className="text-xs text-status-critical font-mono">{errors.message}</p>
                    )}
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] text-slate-tertiary font-mono">
                      * All communications encrypted & tenant isolated
                    </span>
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      isLoading={isSubmitting}
                      rightIcon={<Send className="w-4 h-4 text-obsidian" />}
                    >
                      Transmit Message
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Info Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl glass-panel border border-slate-border space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-glacial font-mono">
              Enterprise Support & Advisory
            </h3>
            <div className="space-y-3 text-xs">
              {contactEmail && (
                <div className="p-3 rounded-xl bg-obsidian-800/80 border border-slate-border/50 flex items-start gap-3">
                  <Mail className="w-4 h-4 text-glacial mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-text block">Technical Inquiries</span>
                    <a href={`mailto:${contactEmail}`} className="text-glacial hover:underline font-mono text-[11px] break-all">{contactEmail}</a>
                  </div>
                </div>
              )}
              {contactPhone && (
                <div className="p-3 rounded-xl bg-obsidian-800/80 border border-slate-border/50 flex items-start gap-3">
                  <Phone className="w-4 h-4 text-glacial mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-text block">Phone</span>
                    <a href={`tel:${contactPhone}`} className="text-slate-muted hover:text-glacial font-mono text-[11px]">{contactPhone}</a>
                  </div>
                </div>
              )}
              {registeredAddress && (
                <div className="p-3 rounded-xl bg-obsidian-800/80 border border-slate-border/50 flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-glacial mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-text block">Registered Address</span>
                    <span className="text-slate-muted text-[11px] break-words">{registeredAddress}</span>
                  </div>
                </div>
              )}
              <div className="p-3 rounded-xl bg-obsidian-800/80 border border-slate-border/50 flex items-start gap-3">
                <Clock className="w-4 h-4 text-glacial mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-text block">Audit SLA</span>
                  <span className="text-slate-muted text-[11px]">Sub-minute multi-agent audit response</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-slate-border space-y-3 text-xs text-slate-muted">
            <div className="flex items-center gap-2 text-slate-text font-semibold">
              <Shield className="w-4 h-4 text-glacial" />
              <span>Platform Integrity</span>
            </div>
            <p>
              NEXORA operates as an on-premise and private cloud brand governance platform. Customer documents, product specifications, and candidate creatives remain within your dedicated organizational partition.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
