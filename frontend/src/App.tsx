import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminGuard } from './components/auth/RoleGuard';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ScrollProgress } from './components/layout/ScrollProgress';
import { BackToTop, FloatingAction } from './components/layout/FloatingWidgets';
import { CookieBanner } from './components/layout/CookieBanner';
import { SearchModal } from './components/layout/SearchModal';

// Public Pages
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
import { AccessibilityStatement } from './pages/AccessibilityStatement';
import { NotFound } from './pages/NotFound';

// Auth & Org Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { VerifyEmail } from './pages/auth/VerifyEmail';
import { OrganizationSettings } from './pages/app/OrganizationSettings';
import { KnowledgeHub } from './pages/app/KnowledgeHub';
import { AdAudit } from './pages/app/AdAudit';
import { AdRegistry } from './pages/app/AdRegistry';
import { RecallWorkspace } from './pages/app/RecallWorkspace';
import { BrandMemory } from './pages/app/BrandMemory';
import { Dashboard } from './pages/app/Dashboard';
import { AuditLog } from './pages/app/AuditLog';

function MainApp() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Global keyboard shortcut for search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (((e.metaKey || e.ctrlKey) && e.key === 'k') || (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA')) {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-dvh bg-obsidian text-slate-text flex flex-col selection:bg-glacial selection:text-obsidian-950 relative overflow-x-hidden max-w-[100vw]">
      {/* Skip to Content for Screen Readers & Keyboard Navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:font-bold focus:rounded-md focus:border-2 focus:border-ink shadow-neo"
      >
        Skip to main content
      </a>

      {/* Top Reading Progress Bar */}
      <ScrollProgress />

      {/* Primary Sticky Header */}
      <Header onOpenSearch={() => setIsSearchOpen(true)} />

      {/* Dynamic Content Routes */}
      <main id="main-content" tabIndex={-1} className="flex-1 relative z-0 page-transition outline-none">
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
          <Route path="/accessibility" element={<AccessibilityStatement />} />

          {/* Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Protected Application Routes */}
          <Route
            path="/app/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/registry"
            element={
              <ProtectedRoute>
                <AdRegistry />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/audits"
            element={
              <ProtectedRoute>
                <AdAudit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/knowledge"
            element={
              <ProtectedRoute>
                <KnowledgeHub />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/recall"
            element={
              <ProtectedRoute>
                <RecallWorkspace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/memory"
            element={
              <ProtectedRoute>
                <BrandMemory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/settings/organization"
            element={
              <ProtectedRoute>
                <OrganizationSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/admin/audit-logs"
            element={
              <ProtectedRoute>
                <AdminGuard>
                  <AuditLog />
                </AdminGuard>
              </ProtectedRoute>
            }
          />

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
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
