import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { 
  ShieldCheck, 
  Menu, 
  X, 
  Layers, 
  FileText, 
  Compass, 
  RotateCcw, 
  Sliders, 
  Bell, 
  ChevronRight
} from 'lucide-react';
import { Button } from './Button';
import { Badge } from './Badge';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  active?: boolean;
}

export interface NavigationProps {
  activeTab: string;
  onSelectTab: (id: string) => void;
  orgName?: string;
  userRole?: string;
  userName?: string;
  breadcrumbs?: string[];
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  orgName = "Team PINNACLE",
  userRole = "Administrator",
  userName = "V. Siddhartha",
  breadcrumbs = ["Governance Hub", "Design System"],
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: NavItem[] = [
    { id: 'overview', label: 'Design System', icon: <Layers className="w-4 h-4" /> },
    { id: 'knowledge', label: 'Brand Knowledge Hub', icon: <FileText className="w-4 h-4" />, badge: 'Admin Gated' },
    { id: 'review', label: 'Advertisement Review', icon: <Compass className="w-4 h-4" /> },
    { id: 'recall', label: 'Advertisement Recall', icon: <RotateCcw className="w-4 h-4" />, badge: 'Active' },
    { id: 'settings', label: 'Governance Controls', icon: <Sliders className="w-4 h-4" /> },
  ];

  return (
    <>
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-border px-4 lg:px-8 py-3 transition-all">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 select-none cursor-pointer" onClick={() => onSelectTab('overview')}>
              <div className="w-9 h-9 rounded-xl bg-glacial/15 border border-glacial/40 flex items-center justify-center text-glacial shadow-glass-glow">
                <ShieldCheck className="w-5 h-5 text-glacial stroke-[2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold tracking-widest text-base text-slate-text uppercase">
                    NEXORA
                  </span>
                  <span className="text-[10px] tracking-wider uppercase px-1.5 py-0.5 rounded bg-glacial/10 text-glacial font-mono border border-glacial/20">
                    Gov-AI
                  </span>
                </div>
                <p className="text-[10px] text-slate-muted tracking-tight font-mono">
                  {orgName}
                </p>
              </div>
            </div>

            {/* Desktop Breadcrumbs */}
            <nav className="hidden md:flex items-center gap-2 text-xs text-slate-muted pl-4 border-l border-slate-border/60">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-tertiary" />}
                  <span className={idx === breadcrumbs.length - 1 ? "text-slate-text font-medium" : ""}>
                    {crumb}
                  </span>
                </React.Fragment>
              ))}
            </nav>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 relative",
                    isActive
                      ? "text-glacial bg-glacial/15 border border-glacial/30 shadow-sm"
                      : "text-slate-muted hover:text-slate-text hover:bg-obsidian-700/50"
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-glacial/20 text-glacial">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            <button
              aria-label="Alerts"
              className="p-2 rounded-lg text-slate-muted hover:text-slate-text hover:bg-obsidian-700/60 transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-status-warning animate-pulse" />
            </button>

            {/* User Profile Pill */}
            <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-slate-border/60">
              <div className="w-8 h-8 rounded-lg bg-obsidian-700 border border-slate-border flex items-center justify-center text-glacial text-xs font-semibold">
                VS
              </div>
              <div className="text-left select-none">
                <p className="text-xs font-semibold text-slate-text leading-tight">{userName}</p>
                <p className="text-[10px] text-slate-muted font-mono">{userRole}</p>
              </div>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-muted hover:text-slate-text hover:bg-obsidian-700/60 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
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
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="py-6 space-y-2 flex-1 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between p-3.5 rounded-xl text-sm font-medium transition-colors",
                      isActive
                        ? "bg-glacial/20 text-glacial border border-glacial/30 font-semibold"
                        : "text-slate-muted hover:bg-obsidian-800/80 hover:text-slate-text"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-glacial/20 text-glacial">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-obsidian-700 border border-slate-border flex items-center justify-center text-glacial text-xs font-semibold">
                  VS
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-text">{userName}</p>
                  <p className="text-[10px] text-slate-muted font-mono">{userRole}</p>
                </div>
              </div>
              <Badge variant="mono" size="sm">{orgName}</Badge>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
