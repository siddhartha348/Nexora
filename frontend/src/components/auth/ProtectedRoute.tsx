import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth, type UserRole } from '../../context/AuthContext';
import { ArrowLeft, Lock } from 'lucide-react';
import { Button } from '../ui/Button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRoles }) => {
  const { user, loading, isAuthenticated, hasRole } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-glacial border-t-transparent animate-spin" />
          <span className="text-xs font-mono text-slate-muted">Verifying authenticated session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRoles && !hasRole(requiredRoles)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center space-y-6 p-8 rounded-3xl glass-panel border border-status-critical/30 shadow-glass-glow animate-in zoom-in-95 duration-200">
          <div className="w-14 h-14 rounded-2xl bg-status-critical/15 border border-status-critical/30 flex items-center justify-center text-status-critical mx-auto shadow-status-critical">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <span className="font-mono text-xs uppercase tracking-widest text-status-critical font-bold">
              Access Restricted • RBAC Gate
            </span>
            <h2 className="text-xl font-bold text-slate-text">
              Insufficient Permissions
            </h2>
            <p className="text-xs text-slate-muted leading-relaxed">
              This module requires one of the following roles: <strong className="text-glacial font-mono">{requiredRoles.join(', ')}</strong>. 
              Your active assigned role is <strong className="text-slate-text font-mono">{user?.role}</strong>.
            </p>
          </div>

          <div className="pt-2">
            <Link to="/">
              <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Return to Overview
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
