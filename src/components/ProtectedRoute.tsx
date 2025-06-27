import React from 'react';
import { authService } from '../services/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, requiredPermission, fallback }: ProtectedRouteProps) {
  const isAuthenticated = authService.isAuthenticated();
  const hasPermission = requiredPermission ? authService.hasPermission(requiredPermission) : true;

  if (!isAuthenticated || !hasPermission) {
    return fallback || (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès non autorisé</h2>
          <p className="text-gray-600">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}