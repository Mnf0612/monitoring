import React, { useState, useEffect } from 'react';
import { AlarmPanel } from './AlarmPanel';
import { StatsCards } from './StatsCards';
import { RegionMap } from './RegionMap';
import { AlarmChart } from './AlarmChart';
import { TopImpactedSites } from './TopImpactedSites';
import { alarmService } from '../services/alarmService';
import { emailService } from '../services/emailService';
import { ticketService } from '../services/ticketService';
import { DashboardStats } from '../types';
import { Activity, Zap, AlertTriangle, CheckCircle, Mail, TestTube, Send } from 'lucide-react';

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalSites: 0,
    activeSites: 0,
    totalAlarms: 0,
    criticalAlarms: 0,
    openTickets: 0,
    resolvedTickets: 0
  });

  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const regions = alarmService.getRegions();

  useEffect(() => {
    const updateStats = () => {
      const dashboardStats = alarmService.getDashboardStats();
      setStats(dashboardStats);
    };

    updateStats();
    
    // Actualiser les stats toutes les 30 secondes
    const interval = setInterval(() => {
      updateStats();
      setRefreshKey(prev => prev + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleTestEmail = async (team: string) => {
    setIsTestingEmail(true);
    try {
      console.log(`🧪 Test d'envoi d'email RÉEL pour l'équipe ${team}...`);
      const result = await emailService.testEmail(team);
      if (result) {
        alert(`✅ Email de test envoyé avec succès à l'équipe ${team}!`);
      } else {
        alert(`❌ Échec d'envoi de l'email de test à l'équipe ${team}`);
      }
    } catch (error) {
      console.error('Erreur test email:', error);
      alert('❌ Erreur lors du test d\'email');
    } finally {
      setIsTestingEmail(false);
    }
  };

  const handleTestTicketCreation = async () => {
    setIsTestingEmail(true);
    try {
      console.log('🧪 Test de création de ticket avec EMAIL RÉEL...');
      await ticketService.testTicketCreation();
      alert('✅ Ticket de test créé et email envoyé!');
    } catch (error) {
      console.error('Erreur test ticket:', error);
      alert('❌ Erreur lors du test de création de ticket');
    } finally {
      setIsTestingEmail(false);
    }
  };

  const statCards = [
    {
      title: 'Sites Totaux',
      value: stats.totalSites,
      icon: Activity,
      color: 'bg-blue-500'
    },
    {
      title: 'Sites Actifs',
      value: stats.activeSites,
      icon: Zap,
      color: 'bg-green-500'
    },
    {
      title: 'Alarmes Critiques',
      value: stats.criticalAlarms,
      icon: AlertTriangle,
      color: 'bg-red-500'
    },
    {
      title: 'Tickets Ouverts',
      value: stats.openTickets,
      icon: CheckCircle,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Dashboard de Monitoring BTS
                </h1>
                <p className="mt-2 text-gray-600">
                  Surveillance en temps réel des 50 sites BTS - 10 régions du Cameroun
                </p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Mise à jour automatique</span>
              </div>
            </div>

            {/* Boutons de test d'emails RÉELS */}
            <div className="mt-6 bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-3 flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                Tests d'envoi d'emails RÉELS
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleTestEmail('ip')}
                  disabled={isTestingEmail}
                  className="px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                  <Send className="w-3 h-3 mr-1" />
                  Test Email IP
                </button>
                <button
                  onClick={() => handleTestEmail('bss')}
                  disabled={isTestingEmail}
                  className="px-3 py-2 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
                >
                  <Send className="w-3 h-3 mr-1" />
                  Test Email BSS
                </button>
                <button
                  onClick={handleTestTicketCreation}
                  disabled={isTestingEmail}
                  className="px-3 py-2 text-xs font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 flex items-center"
                >
                  <TestTube className="w-3 h-3 mr-1" />
                  Test Ticket Complet
                </button>
              </div>
              <p className="text-xs text-blue-700 mt-2">
                📧 Emails configurés: IP → manuelmayi581@gmail.com | BSS → manuelmayi237@gmail.com
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatsCards cards={statCards} />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <RegionMap 
              sites={alarmService.getSites()}
              selectedRegion={selectedRegion}
              onRegionSelect={setSelectedRegion}
            />
          </div>
          
          <div className="space-y-6">
            <AlarmChart alarms={alarmService.getAlarms()} />
            <TopImpactedSites sites={alarmService.getTopImpactedSites()} />
          </div>
        </div>

        <div className="mt-8">
          <AlarmPanel 
            key={refreshKey}
            alarms={selectedRegion === 'all' 
              ? alarmService.getAlarms() 
              : alarmService.getAlarmsByRegion(selectedRegion)
            }
            regions={regions}
            selectedRegion={selectedRegion}
            onRegionChange={setSelectedRegion}
          />
        </div>
      </div>
    </div>
  );
}