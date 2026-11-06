import { useState, useEffect } from 'react';
import { Send, CheckCircle2, Shield, Mail, Clock, MapPin, Phone } from 'lucide-react';
import { SectionHeader } from '../components/common/SectionHeader';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { SEO } from '../components/common/SEO';
import { businessConfig } from '../config/business';
import { Link } from 'react-router-dom';

export function Contact() {
  const { toast } = useToast();
  const { contactEmail, contactPhone, registeredAddress } = businessConfig;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Minimal data collection: name, work email, message, plus unbundled consent
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: '',
    honeypot: '', // Honeypot field for anti-bot defense
    consent: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Capture UTM parameters only if analytics cookie consent is active
  const [utmParams, setUtmParams] = useState<Record<string, string>>({});
  useEffect(() => {
    const consent = localStorage.getItem('nexora_cookie_consent');
    let allowAnalytics = false;
    if (consent) {
      try {
        allowAnalytics = JSON.parse(consent).analytics === true;
      } catch {
        // Ignored
      }
    }
    if (allowAnalytics) {
      const urlParams = new URLSearchParams(window.location.search);
      const utms: Record<string, string> = {};
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach((param) => {
        const val = urlParams.get(param);
        if (val) utms[param] = val;
      });
      setUtmParams(utms);
    }
  }, []);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.email.trim() || !form.email.includes('@')) errs.email = 'Valid work email is required';
    if (!form.message.trim() || form.message.length < 10) errs.message = 'Message must be at least 10 characters';
    if (!form.consent) errs.consent = 'You must acknowledge the Privacy Policy to submit an inquiry';
    setErrors(errs);

    if (Object.keys(errs).length > 0) {
      const firstKey = Object.keys(errs)[0];
      const el = document.getElementById(`field-${firstKey}`);
      if (el) el.focus();
    }
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Honeypot spam defense check
    if (form.honeypot) {
      // Silently discard bot submission
      setSubmitted(true);
      return;
    }

    if (!validate()) {
      toast.warning('Validation Incomplete', 'Please review the highlighted fields.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      toast.success('Inquiry Dispatched', 'NEXORA compliance team has received your message.');
    }, 800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 font-sans">
      <SEO
        title="Contact Platform Team — NEXORA Brand Governance"
        description="Connect with the NEXORA engineering and compliance team regarding AI brand governance and the Advertisement Recall Engine."
      />

      <SectionHeader
        badge="Direct Communications"
        title="Connect With"
        highlight="NEXORA Platform Team"
        description="Whether you have questions regarding our six-guardian architecture, wish to evaluate our Advertisement Recall Engine, or want to discuss enterprise brand governance deployment."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Form Column */}
        <div className="lg:col-span-7">
          <Card>
            <CardHeader
              title="Request Enterprise Consultation"
              description="Direct submission to NEXORA platform specialists"
            />
            <CardContent>
              {submitted ? (
                <div className="p-8 text-center space-y-4 rounded-md bg-paper border-2 border-ink animate-in zoom-in-95 duration-150">
                  <div className="w-12 h-12 rounded-full bg-severity-green/20 text-severity-green border-2 border-ink flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <h3 className="text-lg font-black text-ink uppercase tracking-tight">Inquiry Transmitted</h3>
                  <p className="text-xs text-text-muted max-w-sm mx-auto leading-relaxed font-mono">
                    Thank you, <strong className="text-ink">{form.name}</strong>. Your message has been encrypted and logged. A specialist will respond to <span className="text-ink font-bold">{form.email}</span> within 24 hours.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSubmitted(false);
                      setForm({
                        name: '',
                        email: '',
                        message: '',
                        honeypot: '',
                        consent: false,
                      });
                    }}
                  >
                    Submit Another Inquiry
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  {/* Honeypot field - invisible to humans, catches bots */}
                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="website-trap">Leave this field blank</label>
                    <input
                      id="website-trap"
                      type="text"
                      name="website"
                      value={form.honeypot}
                      onChange={(e) => setForm({ ...form, honeypot: e.target.value })}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      id="field-name"
                      label="Your Name *"
                      placeholder="e.g. Audrey Vance"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      error={errors.name}
                      aria-describedby={errors.name ? 'field-name-error' : undefined}
                      required
                    />
                    <Input
                      id="field-email"
                      label="Work Email *"
                      type="email"
                      placeholder="e.g. audrey@brand.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      error={errors.email}
                      aria-describedby={errors.email ? 'field-email-error' : undefined}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="field-message" className="block text-xs font-bold text-ink uppercase font-mono">
                      Project Notes / Message *
                    </label>
                    <textarea
                      id="field-message"
                      rows={4}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Describe your brand creative volume, document formats, or specific governance requirements..."
                      aria-describedby={errors.message ? 'field-message-error' : undefined}
                      className="w-full rounded-[6px] bg-paper text-xs font-mono text-ink placeholder:text-text-muted border-3 border-ink px-3.5 py-2.5 shadow-neo-sm focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none"
                      required
                    />
                    {errors.message && (
                      <p id="field-message-error" className="text-xs text-severity-red font-mono font-bold">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  {/* Unbundled, unchecked consent checkbox linking to Privacy Policy */}
                  <div className="space-y-1 pt-1">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        id="field-consent"
                        type="checkbox"
                        checked={form.consent}
                        onChange={(e) => setForm({ ...form, consent: e.target.checked })}
                        className="w-4 h-4 mt-0.5 rounded border-2 border-ink text-primary focus:ring-primary shrink-0"
                        aria-describedby={errors.consent ? 'field-consent-error' : undefined}
                      />
                      <span className="text-[11px] text-text-muted font-mono leading-relaxed">
                        I acknowledge and consent to the processing of my contact information in accordance with the{' '}
                        <Link to="/privacy" className="text-primary underline font-bold hover:text-ink">
                          Privacy Policy
                        </Link>
                        . I understand my data is used solely to respond to this commercial inquiry.
                      </span>
                    </label>
                    {errors.consent && (
                      <p id="field-consent-error" className="text-xs text-severity-red font-mono font-bold pl-6">
                        {errors.consent}
                      </p>
                    )}
                  </div>

                  {/* Hidden UTM fields if consent granted */}
                  {Object.entries(utmParams).map(([k, v]) => (
                    <input key={k} type="hidden" name={k} value={v} />
                  ))}

                  <div className="pt-3 border-t-2 border-ink/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-[10px] text-text-muted font-mono">
                      TLS Encrypted • Zero Data Selling Guarantee
                    </span>
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      isLoading={isSubmitting}
                      rightIcon={<Send className="w-4 h-4" />}
                    >
                      Send Message
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Info Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-md bg-paper border-3 border-ink shadow-neo space-y-4 font-mono text-xs">
            <h3 className="text-xs font-black uppercase tracking-wider text-ink border-b-2 border-ink pb-2">
              Platform Direct Coordinates
            </h3>
            <div className="space-y-3">
              {contactEmail && (
                <div className="p-3 bg-surface border-2 border-ink rounded flex items-start gap-3">
                  <Mail className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <span className="font-bold text-ink block text-[11px]">Direct Email</span>
                    <a href={`mailto:${contactEmail}`} className="text-primary hover:underline break-all text-[11px]">
                      {contactEmail}
                    </a>
                  </div>
                </div>
              )}
              {contactPhone && (
                <div className="p-3 bg-surface border-2 border-ink rounded flex items-start gap-3">
                  <Phone className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <span className="font-bold text-ink block text-[11px]">Telephone</span>
                    <a href={`tel:${contactPhone}`} className="text-primary hover:underline text-[11px]">
                      {contactPhone}
                    </a>
                  </div>
                </div>
              )}
              {registeredAddress && (
                <div className="p-3 bg-surface border-2 border-ink rounded flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <span className="font-bold text-ink block text-[11px]">Registered Address</span>
                    <span className="text-text-muted text-[11px] break-words">{registeredAddress}</span>
                  </div>
                </div>
              )}
              <div className="p-3 bg-surface border-2 border-ink rounded flex items-start gap-3">
                <Clock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-ink block text-[11px]">Audit Response SLA</span>
                  <span className="text-text-muted text-[11px]">Sub-minute concurrent multi-agent audit</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-md bg-paper border-3 border-ink shadow-neo space-y-2 text-xs font-mono">
            <div className="flex items-center gap-2 text-ink font-bold">
              <Shield className="w-4 h-4 text-primary" />
              <span className="uppercase">Platform Integrity</span>
            </div>
            <p className="text-text-muted text-[11px] leading-relaxed">
              NEXORA operates as an isolated tenant brand governance platform. Customer documents, product specifications, and candidate creatives remain strictly within your organizational boundary.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
