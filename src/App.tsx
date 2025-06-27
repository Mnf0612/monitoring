import React, { useState, useEffect } from 'react';
import { LoginForm } from './components/LoginForm';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { TicketDashboard } from './components/TicketDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
import { authService } from './services/authService';
import { AuthState } from './types';

function App() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'tickets' | 'admin'>('dashboard');

  useEffect(() => {
    // Initialize auth state
    const initialAuthState = authService.getAuthState();
    setAuthState({ ...initialAuthState, isLoading: false });

    // Subscribe to auth changes
    const unsubscribe = authService.subscribe((newAuthState) => {
      setAuthState({ ...newAuthState, isLoading: false });
    });

    return unsubscribe;
  }, []);

  const handleLogin = () => {
    const newAuthState = authService.getAuthState();
    setAuthState({ ...newAuthState, isLoading: false });
  };

  const handleLogout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
    setCurrentPage('dashboard');
  };

  // Show loading state
  if (authState.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!authState.isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
        onLogout={handleLogout}
      />
      
      <main>
        {currentPage === 'dashboard' && (
          <ProtectedRoute requiredPermission="view_dashboard">
            <Dashboard />
          </ProtectedRoute>
        )}
        
        {currentPage === 'tickets' && (
          <ProtectedRoute requiredPermission="view_dashboard">
            <TicketDashboard />
          </ProtectedRoute>
        )}
        
        {currentPage === 'admin' && (
          <ProtectedRoute requiredPermission="view_admin">
            <AdminDashboard />
          </ProtectedRoute>
        )}
      </main>
    </div>
  );
}

export default App;