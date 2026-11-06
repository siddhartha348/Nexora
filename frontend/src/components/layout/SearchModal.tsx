import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, Shield, Compass, FileText, RotateCcw, HelpCircle, Lock } from 'lucide-react';

interface SearchItem {
  title: string;
  category: string;
  path: string;
  description: string;
  icon: React.ReactNode;
}

export function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const searchIndex: SearchItem[] = [
    { title: 'Advertisement Audit Engine', category: 'Application', path: '/app/audits', description: 'Run multimodal 6-Guardian audits on ads, view consolidated governance report', icon: <Shield className="w-4 h-4 text-glacial" /> },
    { title: 'Brand Knowledge Hub', category: 'Application', path: '/app/knowledge', description: 'Upload and approve official brand specs, guidelines, and view version diffs', icon: <FileText className="w-4 h-4 text-glacial" /> },
    { title: 'Platform Overview', category: 'Core', path: '/', description: 'AI-powered brand governance overview and system architecture', icon: <Shield className="w-4 h-4 text-glacial" /> },
    { title: 'Six Specialist Agents', category: 'Architecture', path: '/agents', description: 'Fact, Voice, Terminology, Claims, Visual, and Accessibility Guardians', icon: <Compass className="w-4 h-4 text-glacial" /> },
    { title: 'Advertisement Recall Engine', category: 'Differentiator', path: '/recall', description: 'Continuous re-checking of published ads against updated specs', icon: <RotateCcw className="w-4 h-4 text-status-warning" /> },
    { title: 'Brand Knowledge Hub', category: 'Features', path: '/features#knowledge-hub', description: 'Ingest and administer official guidelines, specs, and palettes', icon: <FileText className="w-4 h-4 text-glacial" /> },
    { title: 'How It Works', category: 'Workflow', path: '/how-it-works', description: 'Step-by-step review process from upload to human sign-off', icon: <Shield className="w-4 h-4 text-glacial" /> },
    { title: 'Security & Responsible Design', category: 'Compliance', path: '/security', description: 'Zero client data training, JWT auth, and air-gapped options', icon: <Lock className="w-4 h-4 text-status-success" /> },
    { title: 'Frequently Asked Questions', category: 'Support', path: '/faq', description: 'Answers about multi-agent RAG, accuracy, and enterprise usage', icon: <HelpCircle className="w-4 h-4 text-glacial" /> },
    { title: 'Team PINNACLE (About)', category: 'Team', path: '/about', description: 'Meet the architects behind NEXORA for Code Nexus', icon: <Shield className="w-4 h-4 text-glacial" /> },
    { title: 'Contact & Inquiries', category: 'Contact', path: '/contact', description: 'Get in touch with the team or schedule an architecture briefing', icon: <Shield className="w-4 h-4 text-glacial" /> },
    { title: 'Privacy Policy', category: 'Legal', path: '/privacy', description: 'Data retention, tenant isolation, and external AI disclosure', icon: <Lock className="w-4 h-4 text-slate-muted" /> },
    { title: 'Terms & Conditions', category: 'Legal', path: '/terms', description: 'Governance service terms, human reviewer responsibility', icon: <FileText className="w-4 h-4 text-slate-muted" /> },
    { title: 'Cookie Policy', category: 'Legal', path: '/cookie-policy', description: 'Strictly necessary and preference cookies used by NEXORA', icon: <FileText className="w-4 h-4 text-slate-muted" /> },
  ];

  const filtered = query.trim() === '' 
    ? searchIndex.slice(0, 6)
    : searchIndex.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) || 
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault();
      handleSelect(filtered[selectedIndex].path);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <div 
        className="fixed inset-0 bg-obsidian-950/80 transition-opacity animate-in fade-in-0 duration-150"
        onClick={onClose}
      />
      <div 
        className="relative w-full max-w-xl bg-obsidian-850 shadow-neo-lg border-2 border-obsidian-700 rounded-none p-4 z-10 animate-in fade-in-0 zoom-in-95 duration-150"
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center gap-3 pb-3 border-b border-slate-border/50">
          <Search className="w-5 h-5 text-glacial shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search pages, guardians, features, workflows..."
            className="w-full bg-transparent text-sm text-slate-text placeholder:text-slate-tertiary focus:outline-none"
          />
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-tertiary hover:text-slate-text hover:bg-obsidian-700/50"
            aria-label="Close search"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-2 max-h-80 overflow-y-auto space-y-1">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-muted">
              No matching pages or platform topics found for "<span className="text-glacial">{query}</span>"
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.path + item.title}
                  onClick={() => handleSelect(item.path)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                    isSelected ? 'bg-glacial/15 border border-glacial/30' : 'hover:bg-obsidian-700/40 border border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-0.5 shrink-0">{item.icon}</div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-text truncate">{item.title}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-obsidian-700 text-slate-muted">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-muted truncate mt-0.5">{item.description}</p>
                    </div>
                  </div>
                  <ArrowRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'translate-x-1 text-glacial' : 'text-slate-tertiary'}`} />
                </div>
              );
            })
          )}
        </div>

        <div className="pt-2 border-t border-slate-border/50 flex items-center justify-between text-[11px] text-slate-tertiary font-mono">
          <span>Use <kbd className="px-1.5 py-0.5 rounded bg-obsidian-700 border border-slate-border text-slate-muted">↑</kbd> <kbd className="px-1.5 py-0.5 rounded bg-obsidian-700 border border-slate-border text-slate-muted">↓</kbd> to navigate</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-obsidian-700 border border-slate-border text-slate-muted">ESC</kbd> to close</span>
        </div>
      </div>
    </div>
  );
}

