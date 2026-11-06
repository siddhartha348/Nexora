import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, 
  Menu, 
  X, 
  Search, 
  Moon, 
  Sun, 
  ArrowRight,
  LogOut,
  Database,
  FileCheck
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../ui/Badge';

interface HeaderProps {
  onOpenSearch: () => void;
}

export function Header({ onOpenSearch }: HeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [themeMode, setThemeMode] = useState<'pure-obsidian' | 'deep-slate'>('pure-obsidian');
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route transition
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleTheme = () => {
    const next = themeMode === 'pure-obsidian' ? 'deep-slate' : 'pure-obsidian';
    setThemeMode(next);
    document.documentElement.classList.toggle('theme-deep-slate', next === 'deep-slate');
  };

  const navLinks = [
    { label: 'Overview', path: '/' },
    { label: 'Features', path: '/features' },
    { label: 'How It Works', path: '/how-it-works' },
    { label: 'AI Agents', path: '/agents', badge: '6 Guardians' },
    { label: 'Ad Recall', path: '/recall', badge: 'Active' },
    ...(isAuthenticated ? [
      { label: 'Ad Audit', path: '/app/audits', badge: '6-Agents' },
      { label: 'Knowledge Hub', path: '/app/knowledge', badge: 'RAG' }
    ] : []),
    { label: 'Security', path: '/security' },
    { label: 'About', path: '/about' },
    { label: 'FAQ', path: '/faq' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-150">
      {/* Neo-Brutalist Top Telemetry Bar */}
      <div className="w-full bg-obsidian-950 border-b-2 border-slate-border py-1 px-4 sm:px-6 lg:px-8 text-[11px] font-mono text-slate-text flex items-center justify-between overflow-x-auto select-none">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-glacial font-bold">
            <span className="w-2 h-2 rounded-full bg-glacial border border-black" />
            NEXORA // NEO-BRUTALIST GOVERNANCE
          </span>
          <span className="hidden sm:inline text-slate-border font-bold">•</span>
          <span className="hidden sm:inline text-slate-muted">PROTOCOL: EVIDENCE-FIRST</span>
          <span className="hidden md:inline text-slate-border font-bold">•</span>
          <span className="hidden md:inline text-slate-muted">GUARDIANS: 6 CONCURRENT</span>
          <span className="hidden lg:inline text-slate-border font-bold">•</span>
          <span className="hidden lg:inline text-status-warning font-bold">RECALL ENGINE: READY</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-obsidian-950 bg-status-success font-bold text-[10px] px-2 py-0.5 rounded border border-black uppercase shadow-neo-sm">
            RAG: ACTIVE
          </span>
          <span className="text-slate-muted text-[10px] font-mono font-bold">
            TEAM PINNACLE
          </span>
        </div>
      </div>

      <div 
        className={`w-full transition-all duration-150 border-b-2 border-slate-border bg-obsidian-900 ${
          scrolled ? 'shadow-neo py-2' : 'py-3'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          
          {/* Clickable Brand Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-3 select-none group"
            aria-label="NEXORA Home"
          >
            <div className="w-9 h-9 rounded bg-glacial border-2 border-black flex items-center justify-center text-obsidian-950 shadow-neo-sm group-hover:translate-x-[-1px] group-hover:translate-y-[-1px] group-hover:shadow-neo transition-all">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-wider text-base text-slate-text uppercase">
                  NEXORA
                </span>
                <span className="text-[9px] tracking-wider uppercase px-1.5 py-0.5 rounded bg-obsidian-800 text-glacial font-mono border-2 border-slate-border font-bold shadow-neo-sm">
                  NEO-CORE
                </span>
              </div>
              <p className="text-[10px] text-slate-muted tracking-tight font-mono">
                Brand Governance
              </p>
            </div>
          </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-all duration-150 ${
                  isActive
                    ? 'text-obsidian-950 bg-glacial border-2 border-black font-bold shadow-neo-sm'
                    : 'text-slate-text hover:bg-obsidian-800 border-2 border-transparent font-medium'
                }`}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className={`text-[10px] font-mono px-1 py-0.2 rounded font-bold border ${
                    isActive 
                      ? 'bg-obsidian-950 text-glacial border-black' 
                      : link.badge === 'Active' 
                      ? 'bg-status-warning text-obsidian-950 border-black' 
                      : link.badge === '6-Agents'
                      ? 'bg-status-success text-obsidian-950 border-black'
                      : 'bg-obsidian-800 text-glacial border-slate-border'
                  }`}>
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls & Utilities */}
        <div className="flex items-center gap-2.5">
          {/* Quick Search Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-obsidian-800 border-2 border-slate-border text-xs text-slate-text font-bold shadow-neo-sm hover:border-glacial transition-all"
            aria-label="Open site search"
          >
            <Search className="w-3.5 h-3.5 text-glacial" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden sm:inline text-[10px] font-mono px-1.5 py-0.2 rounded bg-obsidian-900 border border-slate-border text-slate-muted">
              ⌘K
            </kbd>
          </button>

          {/* Theme Display Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded bg-obsidian-800 border-2 border-slate-border text-slate-text shadow-neo-sm hover:border-glacial transition-colors"
            title={`Active: ${themeMode === 'pure-obsidian' ? 'Obsidian Black (#050707)' : 'Deep Slate (#0A1012)'}`}
            aria-label="Toggle theme contrast"
          >
            {themeMode === 'pure-obsidian' ? (
              <Moon className="w-4 h-4 text-glacial" />
            ) : (
              <Sun className="w-4 h-4 text-status-warning" />
            )}
          </button>

          {/* Auth State Actions */}
          <div className="hidden sm:flex items-center gap-2">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 pl-2 border-l-2 border-slate-border">
                <Link
                  to="/app/audits"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-status-success text-obsidian-950 font-bold border-2 border-black text-xs shadow-neo-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neo transition-all"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Ad Audit</span>
                </Link>
                <Link
                  to="/app/knowledge"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-glacial text-obsidian-950 font-bold border-2 border-black text-xs shadow-neo-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neo transition-all"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Knowledge Hub</span>
                </Link>
                <Link to="/app/settings/organization" className="flex items-center gap-2 group">
                  <div className="w-8 h-8 rounded bg-obsidian-800 border-2 border-slate-border flex items-center justify-center text-glacial text-xs font-bold shadow-neo-sm group-hover:border-glacial transition-colors">
                    {user.full_name.substring(0, 2).toUpperCase()}
                  </div>
                </Link>
                <button
                  onClick={() => logout()}
                  title="Sign Out"
                  aria-label="Sign Out"
                  className="p-1.5 rounded bg-obsidian-800 border-2 border-slate-border text-slate-muted hover:text-status-critical hover:border-status-critical shadow-neo-sm transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-muted hover:text-slate-text hover:bg-obsidian-700/60 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-obsidian-950 animate-in fade-in-0 duration-200">
          <div className="p-5 flex flex-col h-full">
            <div className="flex items-center justify-between pb-4 border-b border-slate-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-glacial/15 border border-glacial/40 flex items-center justify-center text-glacial">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="font-bold tracking-wider text-sm uppercase text-slate-text">NEXORA</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-slate-muted hover:text-slate-text"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-6 space-y-1.5 flex-1 overflow-y-auto">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-glacial/20 text-glacial border border-glacial/30 font-semibold'
                        : 'text-slate-muted hover:bg-obsidian-800/80 hover:text-slate-text'
                    }`}
                  >
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-glacial/20 text-glacial">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-border space-y-3">
              {isAuthenticated && user ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-obsidian-800 border border-slate-border flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-text">{user.full_name}</p>
                      <p className="text-[10px] text-slate-muted font-mono">{user.email} • {user.role}</p>
                    </div>
                    <Badge variant="mono" size="sm">{user.role}</Badge>
                  </div>
                  <Link to="/app/knowledge" className="block w-full">
                    <Button variant="secondary" size="md" className="w-full flex items-center justify-center gap-2">
                      <Database className="w-4 h-4 text-glacial" />
                      <span>Brand Knowledge Hub</span>
                    </Button>
                  </Link>
                  <Link to="/app/settings/organization" className="block w-full">
                    <Button variant="primary" size="md" className="w-full">
                      Governance Controls
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={() => logout()} className="w-full text-status-critical">
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link to="/login" className="block w-full">
                    <Button variant="secondary" size="md" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register" className="block w-full">
                    <Button variant="primary" size="md" className="w-full">
                      Register Organisation
                    </Button>
                  </Link>
                </div>
              )}
              <div className="text-center text-[11px] text-slate-tertiary font-mono pt-1">
                Team PINNACLE • Code Nexus Hackathon
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
