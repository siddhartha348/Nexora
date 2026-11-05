import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ScrollProgress } from './components/layout/ScrollProgress';
import { BackToTop, FloatingAction } from './components/layout/FloatingWidgets';
import { CookieBanner } from './components/layout/CookieBanner';
import { SearchModal } from './components/layout/SearchModal';

// Pages
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Features } from './pages/Features';
import { HowItWorks } from './pages/HowItWorks';
import { Agents } from './pages/Agents';
import { Recall } from './pages/Recall';
import { Security } from './pages/Security';
import { Contact } from './pages/Contact';
import { FAQ } from './pages/FAQ';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { CookiePolicy } from './pages/CookiePolicy';
import { RefundPolicy } from './pages/RefundPolicy';
import { NotFound } from './pages/NotFound';

function MainApp() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Global keyboard shortcut for search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-obsidian text-slate-text flex flex-col selection:bg-glacial/20 selection:text-glacial-100">
      {/* Top Reading Progress Bar */}
      <ScrollProgress />

      {/* Primary Sticky Header */}
      <Header onOpenSearch={() => setIsSearchOpen(true)} />

      {/* Dynamic Content Routes */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/features" element={<Features />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/recall" element={<Recall />} />
          <Route path="/security" element={<Security />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="*" element={<NotFound onOpenSearch={() => setIsSearchOpen(true)} />} />
        </Routes>
      </main>

      {/* Comprehensive Footer */}
      <Footer />

      {/* Floating Interactive Utilities */}
      <BackToTop />
      <FloatingAction />
      <CookieBanner />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <MainApp />
      </ToastProvider>
    </BrowserRouter>
  );
}
