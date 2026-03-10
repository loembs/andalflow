import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import type { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole | UserRole[];
}

// Composant de protection des routes (Principe SOLID - Single Responsibility)
export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoadingUser } = useAuth();
  const location = useLocation();

  // Affichage du skeleton pendant le chargement
  if (isLoadingUser) {
    return (
      <div className="flex min-h-screen w-full">
        <div className="flex-1 p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-32" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Redirection vers login si non authentifié
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Vérification du rôle si requis
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

    // Admin et assistant admin ont accès à tout
    if (
      user.role !== 'ADMIN' &&
      user.role !== 'ADMIN_ASSISTANT' &&
      !roles.includes(user.role)
    ) {
      // Redirection vers une page d'erreur ou le dashboard
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};