import { useState, useEffect } from 'react';
import { ArrowUp, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll back to top"
      className="fixed bottom-6 right-6 z-40 p-3 rounded-xl glass-panel shadow-glass border border-slate-border text-slate-text hover:text-glacial hover:border-glacial/40 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 animate-in fade-in-0 duration-200"
    >
      <ArrowUp className="w-4 h-4" />
    </button>
  );
}

export function FloatingAction() {
  return (
    <Link
      to="/contact"
      aria-label="Inquire or contact Team PINNACLE"
      className="fixed bottom-6 left-6 z-40 hidden sm:flex items-center gap-2 px-3.5 py-2.5 rounded-full glass-panel shadow-glass border border-slate-border text-xs font-medium text-slate-text hover:text-glacial hover:border-glacial/40 transition-all duration-200 hover:-translate-y-0.5"
    >
      <div className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
      <MessageSquare className="w-3.5 h-3.5 text-glacial" />
      <span>Contact Team</span>
    </Link>
  );
}

