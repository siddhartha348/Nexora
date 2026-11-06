import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, type UserRole } from '../../context/AuthContext';
import { ShieldAlert } from 'lucide-react';
import { Button } from '../ui/Button';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallbackPath?: string;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  fallbackPath = '/app/dashboard',
}) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full p-6 rounded-md bg-paper border-3 border-ink shadow-neo text-center space-y-4">
          <div className="w-12 h-12 rounded-md bg-severity-red/20 border-2 border-ink flex items-center justify-center mx-auto text-severity-red">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold uppercase tracking-tight text-ink">
              Access Restricted
            </h2>
            <p className="text-xs text-slate-muted mt-1">
              Your current role (<span className="font-mono font-bold text-ink">{user.role}</span>) does not have authorization to view this resource. Required role(s): {allowedRoles.join(', ')}.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => window.location.href = fallbackPath}
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <RoleGuard allowedRoles={['ADMIN']}>{children}</RoleGuard>;
};
