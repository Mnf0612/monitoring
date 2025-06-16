import React, { useState, useEffect } from 'react';
import { AlarmPanel } from './AlarmPanel';
import { StatsCards } from './StatsCards';
import { RegionMap } from './RegionMap';
import { AlarmChart } from './AlarmChart';
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
  const regions = alarmService.getRegions();

  useEffect(() => {
    const dashboardStats = alarmService.getDashboardStats();
    setStats(dashboardStats);
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
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard de Monitoring BTS
            </h1>
            <p className="mt-2 text-gray-600">
              Surveillance en temps réel des sites et gestion des alarmes
            </p>
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
          
          <div>
            <AlarmChart alarms={alarmService.getAlarms()} />
          </div>
        </div>

        <div className="mt-8">
          <AlarmPanel 
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