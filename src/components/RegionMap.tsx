import React from 'react';
import { Site } from '../types';
import { MapPin, Zap, AlertTriangle } from 'lucide-react';

interface RegionMapProps {
  sites: Site[];
  selectedRegion: string;
  onRegionSelect: (region: string) => void;
}

export function RegionMap({ sites, selectedRegion, onRegionSelect }: RegionMapProps) {
  const regions = [...new Set(sites.map(site => site.region))];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'offline': return 'text-red-500';
      case 'maintenance': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <Zap className="w-4 h-4" />;
      case 'offline': return <AlertTriangle className="w-4 h-4" />;
      case 'maintenance': return <MapPin className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Carte des Sites BTS</h2>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {regions.map(region => {
            const regionSites = sites.filter(site => site.region === region);
            const onlineSites = regionSites.filter(site => site.status === 'online').length;
            const offlineSites = regionSites.filter(site => site.status === 'offline').length;
            const maintenanceSites = regionSites.filter(site => site.status === 'maintenance').length;

            return (
              <div
                key={region}
                onClick={() => onRegionSelect(region)}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  selectedRegion === region
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="text-lg font-medium text-gray-900 mb-3">{region}</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Sites totaux:</span>
                    <span className="font-medium">{regionSites.length}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Zap className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-gray-600">En ligne:</span>
                    </div>
                    <span className="font-medium text-green-600">{onlineSites}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertTriangle className="w-4 h-4 text-red-500 mr-1" />
                      <span className="text-sm text-gray-600">Hors ligne:</span>
                    </div>
                    <span className="font-medium text-red-600">{offlineSites}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="text-sm text-gray-600">Maintenance:</span>
                    </div>
                    <span className="font-medium text-yellow-600">{maintenanceSites}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Sites:</h4>
                  <div className="space-y-1">
                    {regionSites.map(site => (
                      <div key={site.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{site.name}</span>
                        <div className={`flex items-center ${getStatusColor(site.status)}`}>
                          {getStatusIcon(site.status)}
                          <span className="ml-1 capitalize">{site.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}