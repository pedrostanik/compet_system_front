import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import type { Role } from '@/types';

interface Props {
  children: React.ReactNode;
  /** Only these roles may open the page; others go to /home. Omit = any logged-in user. */
  roles?: Role[];
  /** The "new password" page itself must stay reachable while a password change is pending. */
  allowPendingPasswordChange?: boolean;
}

export default function PrivateRoute({ children, roles, allowPendingPasswordChange }: Props) {
  const { user, status } = useAuth();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm" style={{ color: 'var(--text-muted)' }}>
        Carregando…
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.mustChangePassword && !allowPendingPasswordChange) {
    return <Navigate to="/change-password" replace />;
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/home" replace />;
  }
  return <>{children}</>;
}
