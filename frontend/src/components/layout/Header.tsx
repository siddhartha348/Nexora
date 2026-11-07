import { useState, useEffect, useRef } from 'react';
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
  FileCheck,
  LayoutDashboard,
  Archive,
  RotateCcw,
  BookOpen,
  ChevronDown,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../ui/Badge';
import { useTheme } from '../../hooks/useTheme';

interface HeaderProps {
  onOpenSearch: () => void;
}

/** Public marketing nav links shown to everyone */
const PUBLIC_NAV = [
  { label: 'Overview',    path: '/' },
  { label: 'How It Works',path: '/how-it-works' },
  { label: 'Features',    path: '/features' },
  { label: 'AI Guardians',path: '/agents',   badge: '6 Agents' },
  { label: 'Ad Recall',   path: '/recall',   badge: 'Active' },
  { label: 'Security',    path: '/security' },
  { label: 'About',       path: '/about' },
  { label: 'FAQ',         path: '/faq' },
];

/** App links shown only when authenticated — rendered as a dropdown on desktop */
const APP_NAV = [
  { label: 'Dashboard',     path: '/app/dashboard',              icon: LayoutDashboard },
  { label: 'Ad Audit',      path: '/app/audits',   badge: '6-AI', icon: FileCheck },
  { label: 'Registry',      path: '/app/registry',               icon: Archive },
  { label: 'Knowledge Hub', path: '/app/knowledge', badge: 'RAG', icon: Database },
  { label: 'Recall Engine', path: '/app/recall',                 icon: RotateCcw },
  { label: 'Brand Memory',  path: '/app/memory',                 icon: BookOpen },
  { label: 'Audit Logs',    path: '/app/admin/audit-logs', badge: 'Admin', icon: ShieldCheck, adminOnly: true },
];

export function Header({ onOpenSearch }: HeaderProps) {
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen]   = useState(false);
  const [appMenuOpen,    setAppMenuOpen]       = useState(false);
  const [scrolled,       setScrolled]          = useState(false);
  const location = useLocation();
  const appMenuRef = useRef<HTMLDivElement>(null);

  /* Scroll detection */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* Close drawers on route change */
  useEffect(() => {
    setMobileMenuOpen(false);
    setAppMenuOpen(false);
  }, [location.pathname]);

  /* Close app-menu on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (appMenuRef.current && !appMenuRef.current.contains(e.target as Node)) {
        setAppMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isAppRoute = location.pathname.startsWith('/app');

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-150">

      {/* ── Telemetry Status Bar ─────────────────────────────── */}
      <div
        className="w-full bg-obsidian-950 border-b-2 border-slate-border py-1 overflow-hidden
                   px-4 sm:px-6 lg:px-8 text-[11px] font-mono text-slate-text
                   flex items-center justify-between gap-2 select-none"
      >
        <div className="flex items-center gap-3 min-w-0 overflow-hidden">
          <span className="flex items-center gap-1.5 text-glacial font-bold shrink-0">
            <span className="w-2 h-2 rounded-full bg-glacial border border-black" />
            NEXORA
          </span>
          <span className="hidden sm:inline text-slate-border font-bold">•</span>
          <span className="hidden sm:inline text-slate-muted truncate">EVIDENCE-FIRST PROTOCOL</span>
          <span className="hidden md:inline text-slate-border font-bold">•</span>
          <span className="hidden md:inline text-slate-muted truncate">6 CONCURRENT GUARDIANS</span>
          <span className="hidden lg:inline text-slate-border font-bold">•</span>
          <span className="hidden lg:inline text-status-warning font-bold truncate">RECALL ENGINE: READY</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-obsidian-950 bg-status-success font-bold text-[10px] px-2 py-0.5 rounded border border-black uppercase shadow-neo-sm">
            RAG: ACTIVE
          </span>
          <span className="text-slate-muted text-[10px] font-mono font-bold hidden sm:inline">
            ENTERPRISE
          </span>
        </div>
      </div>

      {/* ── Main Navigation Bar ──────────────────────────────── */}
      <div
        className={`w-full transition-all duration-150 border-b-2 border-slate-border bg-obsidian-900 ${
          scrolled ? 'shadow-neo py-2' : 'py-3'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">

          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 select-none group shrink-0"
            aria-label="NEXORA Home"
          >
            <div className="w-9 h-9 rounded bg-glacial border-2 border-black flex items-center justify-center text-obsidian-950 shadow-neo-sm group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-neo transition-all">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="hidden xs:block">
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-wider text-base text-slate-text uppercase">
                  NEXORA
                </span>
                <span className="text-[9px] tracking-wider uppercase px-1.5 py-0.5 rounded bg-obsidian-800 text-glacial font-mono border-2 border-slate-border font-bold shadow-neo-sm hidden sm:inline">
                  GOVERNANCE
                </span>
              </div>
              <p className="text-[10px] text-slate-muted tracking-tight font-mono">
                Brand Governance
              </p>
            </div>
          </Link>

          {/* Desktop Public Nav */}
          <nav className="hidden lg:flex items-center gap-1 overflow-x-auto max-w-[520px] xl:max-w-none">
            {PUBLIC_NAV.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs whitespace-nowrap transition-all duration-150 ${
                    isActive
                      ? 'text-obsidian-950 bg-glacial border-2 border-black font-bold shadow-neo-sm'
                      : 'text-slate-text hover:bg-obsidian-800 border-2 border-transparent font-medium'
                  }`}
                >
                  {link.label}
                  {link.badge && (
                    <span
                      className={`text-[10px] font-mono px-1 rounded font-bold border ${
                        isActive
                          ? 'bg-obsidian-950 text-glacial border-black'
                          : link.badge === 'Active'
                          ? 'bg-status-warning text-obsidian-950 border-black'
                          : 'bg-obsidian-800 text-glacial border-slate-border'
                      }`}
                    >
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* App Dropdown (role-aware navigation) */}
            {isAuthenticated && user && (
              <div className="relative ml-1" ref={appMenuRef}>
                <button
                  onClick={() => setAppMenuOpen(v => !v)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs whitespace-nowrap transition-all duration-150 border-2 font-medium ${
                    isAppRoute
                      ? 'text-obsidian-950 bg-glacial border-black font-bold shadow-neo-sm'
                      : 'text-slate-text hover:bg-obsidian-800 border-transparent'
                  }`}
                  aria-haspopup="true"
                  aria-expanded={appMenuOpen}
                >
                  <span className="font-bold text-glacial font-mono">[{user.role}]</span>
                  Workspace
                  <ChevronDown className={`w-3 h-3 transition-transform ${appMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {appMenuOpen && (
                  <div className="absolute top-full left-0 mt-1.5 w-56 bg-obsidian-850 border-2 border-slate-border shadow-neo-lg rounded z-50">
                    <div className="px-3.5 py-2 border-b border-slate-border text-[10px] font-mono text-slate-tertiary">
                      WORKSPACE // {user.role} MODE
                    </div>
                    {APP_NAV
                      .filter(item => {
                        if (user.role === 'CREATOR') {
                          return ['/app/dashboard', '/app/audits', '/app/registry'].includes(item.path);
                        }
                        if (user.role === 'VIEWER') {
                          return ['/app/dashboard', '/app/registry'].includes(item.path);
                        }
                        if (user.role === 'REVIEWER') {
                          return ['/app/dashboard', '/app/audits', '/app/registry', '/app/memory'].includes(item.path);
                        }
                        if (user.role === 'APPROVER') {
                          return ['/app/dashboard', '/app/audits', '/app/registry', '/app/knowledge', '/app/recall', '/app/memory'].includes(item.path);
                        }
                        // ADMIN sees all
                        return !item.adminOnly || hasRole(['ADMIN']);
                      })
                      .map((link) => {
                        const Icon = link.icon;
                        const isActive = location.pathname === link.path;
                        return (
                          <Link
                            key={link.path}
                            to={link.path}
                            className={`flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium transition-colors border-b border-slate-border last:border-0 ${
                              isActive
                                ? 'bg-glacial text-obsidian-950 font-bold'
                                : 'text-slate-text hover:bg-obsidian-800'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5 shrink-0" />
                            <span>{link.label}</span>
                            {link.badge && (
                              <span className="ml-auto text-[9px] font-mono px-1 py-0.5 rounded bg-obsidian-950 text-glacial border border-slate-border font-bold">
                                {link.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* Action Controls */}
          <div className="flex items-center gap-2">

            {/* Search */}
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-obsidian-800 border-2 border-slate-border text-xs text-slate-text font-bold shadow-neo-sm hover:border-glacial transition-all"
              aria-label="Open site search"
            >
              <Search className="w-3.5 h-3.5 text-glacial" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden sm:inline text-[10px] font-mono px-1.5 rounded bg-obsidian-900 border border-slate-border text-slate-muted">
                ⌘K
              </kbd>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded bg-obsidian-800 border-2 border-slate-border text-slate-text shadow-neo-sm hover:border-glacial transition-colors"
              title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
              aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-status-warning" />
              ) : (
                <Moon className="w-4 h-4 text-glacial" />
              )}
            </button>

            {/* Auth State */}
            <div className="hidden sm:flex items-center gap-2">
              {isAuthenticated && user ? (
                <div className="flex items-center gap-2 pl-2 border-l-2 border-slate-border">
                  {/* Role-Specific Portal Button */}
                  <Link
                    to="/app/dashboard"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-bold border-2 border-black text-xs shadow-neo-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neo transition-all whitespace-nowrap ${
                      user.role === 'ADMIN'
                        ? 'bg-neo-purple text-white'
                        : user.role === 'APPROVER'
                        ? 'bg-neo-mint text-black'
                        : user.role === 'REVIEWER'
                        ? 'bg-neo-yellow text-black'
                        : user.role === 'CREATOR'
                        ? 'bg-neo-pink text-white'
                        : 'bg-glacial text-obsidian-950'
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
                    <span>{user.role} PORTAL</span>
                  </Link>

                  {/* Role-filtered direct action */}
                  {['ADMIN', 'CREATOR', 'REVIEWER', 'APPROVER'].includes(user.role) && (
                    <Link
                      to="/app/audits"
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-neo-mint text-black font-bold border-2 border-black text-xs shadow-neo-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neo transition-all whitespace-nowrap"
                    >
                      <FileCheck className="w-3.5 h-3.5 shrink-0" />
                      <span className="hidden xl:inline">Ad Audit</span>
                    </Link>
                  )}

                  {['ADMIN', 'APPROVER'].includes(user.role) && (
                    <Link
                      to="/app/knowledge"
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-neo-yellow text-black font-bold border-2 border-black text-xs shadow-neo-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neo transition-all whitespace-nowrap"
                    >
                      <Database className="w-3.5 h-3.5 shrink-0" />
                      <span className="hidden xl:inline">Knowledge Hub</span>
                    </Link>
                  )}

                  <Link
                    to="/app/settings/organization"
                    className="flex items-center gap-2 group shrink-0"
                    title={`${user.full_name} (${user.role})`}
                    aria-label="Organisation settings"
                  >
                    <div className="w-8 h-8 rounded bg-obsidian-800 border-2 border-slate-border flex items-center justify-center text-glacial text-xs font-bold shadow-neo-sm group-hover:border-glacial transition-colors">
                      {user.full_name.substring(0, 2).toUpperCase()}
                    </div>
                  </Link>

                  <button
                    onClick={() => logout()}
                    title="Sign Out"
                    aria-label="Sign Out"
                    className="p-1.5 rounded bg-obsidian-800 border-2 border-slate-border text-slate-muted hover:text-status-critical hover:border-status-critical shadow-neo-sm transition-colors shrink-0"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login">
                    <Button variant="outline" size="sm">Sign In</Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(v => !v)}
              className="lg:hidden p-2 rounded text-slate-muted hover:text-slate-text hover:bg-obsidian-800 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Full-Screen Drawer ─────────────────────────── */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-obsidian-950 flex flex-col"
          style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-5 border-b-2 border-slate-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-glacial border-2 border-black flex items-center justify-center text-obsidian-950">
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

          {/* Scrollable Nav */}
          <div className="flex-1 overflow-y-auto py-4 px-5 space-y-1">

            {/* Public Links */}
            <p className="text-[10px] font-mono font-bold text-slate-tertiary uppercase tracking-widest px-2 pb-1">
              Platform
            </p>
            {PUBLIC_NAV.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center justify-between w-full p-3 rounded text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-glacial text-obsidian-950 font-bold border-2 border-black shadow-neo-sm'
                      : 'text-slate-muted hover:bg-obsidian-800 hover:text-slate-text border-2 border-transparent'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-glacial/20 text-glacial">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* App Links (authenticated) */}
            {isAuthenticated && (
              <>
                <p className="text-[10px] font-mono font-bold text-slate-tertiary uppercase tracking-widest px-2 pt-4 pb-1">
                  Workspace
                </p>
                {APP_NAV.filter(item => !item.adminOnly || hasRole(['ADMIN'])).map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`flex items-center gap-3 w-full p-3 rounded text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-glacial text-obsidian-950 font-bold border-2 border-black shadow-neo-sm'
                          : 'text-slate-muted hover:bg-obsidian-800 hover:text-slate-text border-2 border-transparent'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{link.label}</span>
                      {link.badge && (
                        <span className="ml-auto text-[10px] font-mono px-1.5 rounded bg-glacial/20 text-glacial">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-5 border-t-2 border-slate-border space-y-3">
            {isAuthenticated && user ? (
              <div className="space-y-3">
                <div className="p-3 rounded bg-obsidian-800 border-2 border-slate-border flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-text truncate">{user.full_name}</p>
                    <p className="text-[10px] text-slate-muted font-mono truncate">{user.email}</p>
                  </div>
                  <Badge variant="mono" size="sm">{user.role}</Badge>
                </div>
                <Link to="/app/settings/organization" className="block w-full">
                  <Button variant="secondary" size="md" className="w-full">
                    Organisation Settings
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={() => logout()} className="w-full text-status-critical">
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link to="/login" className="block w-full">
                  <Button variant="secondary" size="md" className="w-full">Sign In</Button>
                </Link>
                <Link to="/register" className="block w-full">
                  <Button variant="primary" size="md" className="w-full">Register Organisation</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
