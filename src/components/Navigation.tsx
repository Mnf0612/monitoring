import React, { useState } from 'react';
import { Activity, Ticket, Users, Settings, Mail, LogOut, User, Shield, AlertOctagon } from 'lucide-react';
import { authService } from '../services/authService';
import { EmailConfigModal } from './EmailConfigModal';

interface NavigationProps {
  currentPage: 'dashboard' | 'tickets' | 'admin' | 'outages';
  onPageChange: (page: 'dashboard' | 'tickets' | 'admin' | 'outages') => void;
  onLogout: () => void;
}

export function Navigation({ currentPage, onPageChange, onLogout }: NavigationProps) {
  const [isEmailConfigOpen, setIsEmailConfigOpen] = useState(false);
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    onLogout();
  };

  return (
    <>
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-2 overflow-hidden">
                  <img 
                    src="/image.png" 
                    alt="Logo" 
                    className="h-6 w-6 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <Activity className="w-5 h-5 text-blue-600 hidden" />
                </div>
                <span className="text-xl font-bold text-gray-900">BTS Monitor</span>
              </div>
              
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <button
                  onClick={() => onPageChange('dashboard')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    currentPage === 'dashboard'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Dashboard Principal
                </button>
                
                <button
                  onClick={() => onPageChange('outages')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    currentPage === 'outages'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <AlertOctagon className="w-4 h-4 mr-2" />
                  Surveillance Pannes
                </button>
                
                <button
                  onClick={() => onPageChange('tickets')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    currentPage === 'tickets'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <Ticket className="w-4 h-4 mr-2" />
                  Gestion des Tickets
                </button>

                {authService.hasPermission('view_admin') && (
                  <button
                    onClick={() => onPageChange('admin')}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      currentPage === 'admin'
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Administration
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-500">
                <User className="w-4 h-4 mr-1" />
                <span>{user?.username} ({user?.role})</span>
              </div>
              
              <button 
                onClick={() => setIsEmailConfigOpen(true)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                title="Configuration Email"
              >
                <Mail className="w-5 h-5" />
              </button>
              
              <button 
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                title="Paramètres"
              >
                <Settings className="w-5 h-5" />
              </button>

              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100"
                title="Se déconnecter"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <EmailConfigModal 
        isOpen={isEmailConfigOpen}
        onClose={() => setIsEmailConfigOpen(false)}
      />
    </>
  );
}