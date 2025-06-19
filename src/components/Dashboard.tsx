import React, { useState, useEffect } from 'react';
import { AlarmPanel } from './AlarmPanel';
import { StatsCards } from './StatsCards';
import { RegionChart } from './RegionChart';
import { AlarmChart } from './AlarmChart';
import { TopImpactedSites } from './TopImpactedSites';
import { alarmService } from '../services/alarmService';
import { DashboardStats } from '../types';
import { Activity, Zap, AlertTriangle, CheckCircle } from 'lucide-react';

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
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatsCards cards={statCards} />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <RegionChart 
              sites={alarmService.getSites()}
              alarms={alarmService.getAlarms()}
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