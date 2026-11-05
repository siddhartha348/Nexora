import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export function Footer() {
  const currentYear = 2026;

  return (
    <footer className="border-t border-slate-border/70 bg-obsidian-950/90 backdrop-blur-xl pt-16 pb-12 text-slate-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-border/50">
          
          {/* Brand Identity & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3 select-none">
              <div className="w-9 h-9 rounded-xl bg-glacial/15 border border-glacial/40 flex items-center justify-center text-glacial shadow-glass-glow">
                <ShieldCheck className="w-5 h-5 text-glacial stroke-[2]" />
              </div>
              <span className="font-extrabold tracking-widest text-lg text-slate-text uppercase">
                NEXORA
              </span>
            </Link>
            
            <p className="text-xs text-slate-muted leading-relaxed max-w-sm">
              An evidence-driven, multimodal brand governance platform. Auditing advertisements against approved guidelines, specification facts, terminology, and visual assets before publication with active Advertisement Recall.
            </p>

            <div className="p-3 rounded-xl bg-obsidian-800/60 border border-slate-border/60 text-[11px] space-y-1 font-mono">
              <div className="text-glacial font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-glacial animate-pulse" />
                Code Nexus Hackathon Entry
              </div>
              <div className="text-slate-tertiary">Problem Provider: <span className="text-slate-text">Inkloom AI</span></div>
              <div className="text-slate-tertiary">Category: <span className="text-slate-text">AI Brand Governance</span></div>
            </div>
          </div>

          {/* Navigation Column 1: Platform & Architecture */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-text font-mono">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/" className="hover:text-glacial transition-colors">Platform Overview</Link></li>
              <li><Link to="/features" className="hover:text-glacial transition-colors">Features & Hub</Link></li>
              <li><Link to="/how-it-works" className="hover:text-glacial transition-colors">How It Works</Link></li>
              <li><Link to="/agents" className="hover:text-glacial transition-colors">Six Specialist Agents</Link></li>
              <li><Link to="/recall" className="hover:text-glacial transition-colors">Advertisement Recall</Link></li>
              <li><Link to="/security" className="hover:text-glacial transition-colors">Security & Isolation</Link></li>
            </ul>
          </div>

          {/* Navigation Column 2: Architecture & Knowledge */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-text font-mono">
              Intelligence
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/agents#fact-guardian" className="hover:text-glacial transition-colors">Fact Guardian</Link></li>
              <li><Link to="/agents#voice-guardian" className="hover:text-glacial transition-colors">Voice Guardian</Link></li>
              <li><Link to="/agents#claims-guardian" className="hover:text-glacial transition-colors">Claims Guardian</Link></li>
              <li><Link to="/agents#visual-guardian" className="hover:text-glacial transition-colors">Visual Guardian</Link></li>
              <li><Link to="/agents#accessibility-guardian" className="hover:text-glacial transition-colors">Accessibility Guardian</Link></li>
              <li><Link to="/agents#risk-manager" className="hover:text-glacial transition-colors">Risk Manager Arbiter</Link></li>
            </ul>
          </div>

          {/* Navigation Column 3: Legal & Governance */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-text font-mono">
              Governance & Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/faq" className="hover:text-glacial transition-colors">Platform FAQ</Link></li>
              <li><Link to="/about" className="hover:text-glacial transition-colors">Team PINNACLE</Link></li>
              <li><Link to="/contact" className="hover:text-glacial transition-colors">Contact & Briefing</Link></li>
              <li><Link to="/privacy" className="hover:text-glacial transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-glacial transition-colors">Terms of Governance</Link></li>
              <li><Link to="/cookie-policy" className="hover:text-glacial transition-colors">Cookie Preferences</Link></li>
              <li><Link to="/refund-policy" className="hover:text-glacial transition-colors">Refund & SLA Policy</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-slate-tertiary">
            <p>© {currentYear} NEXORA. Developed by <strong className="text-slate-text">Team PINNACLE</strong>.</p>
            <span className="hidden sm:inline">•</span>
            <p>Vadlapudi Siddhartha • Diviti Sri Vyshnavi • Mokshitha Venati</p>
          </div>

          <div className="flex items-center gap-4 text-slate-tertiary">
            <Link to="/privacy" className="hover:text-slate-text transition-colors">Privacy</Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-slate-text transition-colors">Terms</Link>
            <span>•</span>
            <Link to="/security" className="hover:text-slate-text transition-colors">Security</Link>
            <span>•</span>
            <span className="font-mono text-[10px] text-glacial">v1.0-RC</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
