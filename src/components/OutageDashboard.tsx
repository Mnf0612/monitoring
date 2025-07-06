import React, { useState, useEffect } from 'react';
import { OutageMap } from './outage/OutageMap';
import { OutageList } from './outage/OutageList';
import { OutageStats } from './outage/OutageStats';
import { OutageTimeline } from './outage/OutageTimeline';
import { outageService } from '../services/outageService';
import { Outage } from '../types';
import { AlertOctagon, MapPin, Clock, TrendingUp } from 'lucide-react';

export function OutageDashboard() {
  const [outages, setOutages] = useState<Outage[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedOutage, setSelectedOutage] = useState<Outage | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const updateOutages = () => {
      const currentOutages = outageService.getOutages();
      setOutages(currentOutages);
    };

    updateOutages();
    
    // Actualiser toutes les 30 secondes
    const interval = setInterval(() => {
      updateOutages();
      setRefreshKey(prev => prev + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const stats = outageService.getOutageStats();
  const regions = outageService.getRegions();

  const statCards = [
    {
      title: 'Pannes Actives',
      value: stats.activeOutages,
      icon: AlertOctagon,
      color: 'bg-red-500'
    },
    {
      title: 'Sites Impactés',
      value: stats.affectedSites,
      icon: MapPin,
      color: 'bg-orange-500'
    },
    {
      title: 'Temps Moyen Résolution',
      value: `${stats.averageResolutionTime}h`,
      icon: Clock,
      color: 'bg-blue-500'
    },
    {
      title: 'Pannes Résolues (24h)',
      value: stats.resolvedToday,
      icon: TrendingUp,
      color: 'bg-green-500'
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
                  Surveillance des Pannes Réseau
                </h1>
                <p className="mt-2 text-gray-600">
                  Détection automatique et gestion des pannes multi-sites
                </p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <span>Surveillance temps réel</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <OutageStats cards={statCards} />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <OutageMap 
              outages={outages}
              selectedRegion={selectedRegion}
              onRegionSelect={setSelectedRegion}
              onOutageSelect={setSelectedOutage}
            />
            
            <OutageTimeline outages={outages} />
          </div>
          
          <div>
            <OutageList 
              outages={outages}
              selectedRegion={selectedRegion}
              onRegionChange={setSelectedRegion}
              regions={regions}
              onOutageSelect={setSelectedOutage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}