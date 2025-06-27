import React, { useState } from 'react';
import { UserManagement } from './admin/UserManagement';
import { AlarmManagement } from './admin/AlarmManagement';
import { SystemSettings } from './admin/SystemSettings';
import { AdminStats } from './admin/AdminStats';
import { Users, AlertTriangle, Settings, BarChart3 } from 'lucide-react';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'alarms' | 'settings'>('stats');

  const tabs = [
    { id: 'stats', label: 'Statistiques', icon: BarChart3 },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'alarms', label: 'Alarmes', icon: AlertTriangle },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Panneau d'Administration
            </h1>
            <p className="mt-2 text-gray-600">
              Gestion des utilisateurs, alarmes et paramètres système
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'stats' && <AdminStats />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'alarms' && <AlarmManagement />}
          {activeTab === 'settings' && <SystemSettings />}
        </div>
      </div>
    </div>
  );
}