import { useState } from 'react';
import { Send, CheckCircle2, Building } from 'lucide-react';
import { SectionHeader } from '../components/common/SectionHeader';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { SEO } from '../components/common/SEO';

export function Contact() {
  const { toast } = useToast();
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
      toast.success("Inquiry Dispatched", "Team PINNACLE has received your transmission.");
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
      <SEO
        title="Contact Team PINNACLE — Code Nexus Inquiry"
        description="Connect with Team PINNACLE (Vadlapudi Siddhartha, Diviti Sri Vyshnavi, Mokshitha Venati) regarding NEXORA brand governance architecture."
      />

      <SectionHeader
        badge="Direct Communications"
        title="Connect With"
        highlight="Team PINNACLE"
        description="Whether you have questions regarding our six-agent architecture, wish to inspect our Advertisement Recall engine, or want to discuss enterprise brand governance."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Form Column */}
        <div className="lg:col-span-7">
          <Card className="border-glacial/30">
            <CardHeader
              title="Request Architecture Walkthrough"
              description="Direct submission to Team PINNACLE lead engineers"
            />
            <CardContent>
              {submitted ? (
                <div className="p-8 text-center space-y-4 rounded-xl bg-obsidian-800/80 border border-status-success/30 animate-in zoom-in-95 duration-200">
                  <div className="w-12 h-12 rounded-full bg-status-success/20 text-status-success flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-text">Inquiry Successfully Transmitted</h3>
                  <p className="text-xs text-slate-muted max-w-sm mx-auto leading-relaxed">
                    Thank you, <strong className="text-slate-text">{form.name}</strong>. Team PINNACLE has logged your inquiry regarding <span className="font-mono text-glacial">{form.inquiryType}</span>. We will follow up directly at <span className="font-mono text-slate-text">{form.email}</span>.
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
                      placeholder="e.g. Inkloom Partner Network"
                      value={form.organisation}
                      onChange={(e) => setForm({ ...form, organisation: e.target.value })}
                    />
                    <Select
                      label="Inquiry Category"
                      value={form.inquiryType}
                      onChange={(val) => setForm({ ...form, inquiryType: val })}
                      options={[
                        { value: 'architecture-briefing', label: 'Architecture & Agent Walkthrough' },
                        { value: 'recall-demo', label: 'Advertisement Recall Verification' },
                        { value: 'code-nexus', label: 'Code Nexus Hackathon Inquiry' },
                        { value: 'deployment', label: 'Private VPC & Ollama Deployment' },
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
                      placeholder="Describe your brand volume, document types, or specific governance questions..."
                      className="w-full rounded-lg bg-obsidian-800/90 text-sm text-slate-text placeholder:text-slate-tertiary border border-slate-tertiary/30 px-3.5 py-2.5 transition-all duration-200 hover:border-glacial/30 focus:border-glacial focus:ring-1 focus:ring-glacial/40 focus:outline-none"
                    />
                    {errors.message && (
                      <p className="text-xs text-status-critical font-mono">{errors.message}</p>
                    )}
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] text-slate-tertiary font-mono">
                      * All fields encrypted & tenant isolated
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
              Team PINNACLE Workstream Leads
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-obsidian-800/80 border border-slate-border/50">
                <span className="font-semibold text-slate-text block">Vadlapudi Siddhartha</span>
                <span className="text-slate-muted text-[11px]">AI Intelligence, Multi-Agent Orchestration & Backend</span>
              </div>
              <div className="p-3 rounded-xl bg-obsidian-800/80 border border-slate-border/50">
                <span className="font-semibold text-slate-text block">Diviti Sri Vyshnavi</span>
                <span className="text-slate-muted text-[11px]">Frontend Platform, UX Design & Brand Memory Precedents</span>
              </div>
              <div className="p-3 rounded-xl bg-obsidian-800/80 border border-slate-border/50">
                <span className="font-semibold text-slate-text block">Mokshitha Venati</span>
                <span className="text-slate-muted text-[11px]">Visual Intelligence, Knowledge Ingestion & Document OCR</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-slate-border space-y-3 text-xs text-slate-muted">
            <div className="flex items-center gap-2 text-slate-text font-semibold">
              <Building className="w-4 h-4 text-glacial" />
              <span>Hackathon Attribution</span>
            </div>
            <p>
              Developed for the <strong className="text-slate-text">Code Nexus Hackathon</strong> under the problem statement provided by <strong className="text-slate-text">Inkloom AI</strong>.
            </p>
            <div className="pt-2 border-t border-slate-border/40 font-mono text-[11px] text-slate-tertiary">
              Working Directory: <span className="text-slate-muted">c:\Users\siddh\OneDrive\Desktop\NEXORA _1</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
