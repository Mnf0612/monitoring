import React from 'react';
import { Outage } from '../../types';
import { MapPin, AlertTriangle, Clock, Users } from 'lucide-react';

interface OutageMapProps {
  outages: Outage[];
  selectedRegion: string;
  onRegionSelect: (region: string) => void;
  onOutageSelect: (outage: Outage) => void;
}

export function OutageMap({ outages, selectedRegion, onRegionSelect, onOutageSelect }: OutageMapProps) {
  const cameroonRegions = [
    { name: 'Adamaoua', coords: { x: 45, y: 35 } },
    { name: 'Centre', coords: { x: 50, y: 55 } },
    { name: 'Est', coords: { x: 75, y: 50 } },
    { name: 'Extrême-Nord', coords: { x: 40, y: 15 } },
    { name: 'Littoral', coords: { x: 35, y: 65 } },
    { name: 'Nord', coords: { x: 45, y: 25 } },
    { name: 'Nord-Ouest', coords: { x: 25, y: 35 } },
    { name: 'Ouest', coords: { x: 35, y: 45 } },
    { name: 'Sud', coords: { x: 50, y: 75 } },
    { name: 'Sud-Ouest', coords: { x: 20, y: 55 } }
  ];

  const getOutagesForRegion = (regionName: string) => {
    return outages.filter(outage => 
      outage.affectedSites.some(site => site.region === regionName) && 
      outage.status === 'active'
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600';
      case 'major': return 'bg-orange-500';
      case 'minor': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  const getRegionOutageLevel = (regionName: string) => {
    const regionOutages = getOutagesForRegion(regionName);
    if (regionOutages.length === 0) return 'none';
    
    const hasCritical = regionOutages.some(o => o.severity === 'critical');
    const hasMajor = regionOutages.some(o => o.severity === 'major');
    
    if (hasCritical) return 'critical';
    if (hasMajor) return 'major';
    return 'minor';
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <MapPin className="w-5 h-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Carte des Pannes - Cameroun</h2>
          </div>
          <div className="text-sm text-gray-500">
            {outages.filter(o => o.status === 'active').length} panne(s) active(s)
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Carte stylisée du Cameroun */}
        <div className="relative bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-8 h-96 overflow-hidden">
          {/* Contour simplifié du Cameroun */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
            <path
              d="M20 20 L80 15 L85 25 L90 40 L85 60 L80 75 L70 85 L50 90 L30 85 L15 70 L10 50 L15 30 Z"
              fill="rgba(34, 197, 94, 0.1)"
              stroke="rgba(34, 197, 94, 0.3)"
              strokeWidth="0.5"
            />
          </svg>

          {/* Régions avec indicateurs de pannes */}
          {cameroonRegions.map((region) => {
            const outageLevel = getRegionOutageLevel(region.name);
            const regionOutages = getOutagesForRegion(region.name);
            const totalAffectedSites = regionOutages.reduce((sum, outage) => 
              sum + outage.affectedSites.filter(site => site.region === region.name).length, 0
            );

            return (
              <div
                key={region.name}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                style={{ left: `${region.coords.x}%`, top: `${region.coords.y}%` }}
                onClick={() => onRegionSelect(selectedRegion === region.name ? 'all' : region.name)}
              >
                {/* Indicateur de panne */}
                <div className={`relative ${
                  outageLevel === 'critical' ? 'animate-pulse' : ''
                }`}>
                  <div className={`w-6 h-6 rounded-full border-2 border-white shadow-lg ${
                    outageLevel === 'critical' ? 'bg-red-600' :
                    outageLevel === 'major' ? 'bg-orange-500' :
                    outageLevel === 'minor' ? 'bg-yellow-500' :
                    'bg-green-500'
                  } ${selectedRegion === region.name ? 'ring-4 ring-blue-300' : ''}`}>
                    {regionOutages.length > 0 && (
                      <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {regionOutages.length}
                      </div>
                    )}
                  </div>
                  
                  {/* Tooltip au survol */}
                  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    <div className="font-semibold">{region.name}</div>
                    <div>Pannes: {regionOutages.length}</div>
                    <div>Sites impactés: {totalAffectedSites}</div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>

                {/* Nom de la région */}
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700 whitespace-nowrap">
                  {region.name}
                </div>
              </div>
            );
          })}
        </div>

        {/* Légende */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Aucune panne</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Panne mineure</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Panne majeure</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Panne critique</span>
            </div>
          </div>
          
          <div className="text-xs text-gray-500">
            💡 Cliquez sur une région pour filtrer
          </div>
        </div>

        {/* Liste des pannes actives */}
        {outages.filter(o => o.status === 'active').length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-medium text-gray-900 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
              Pannes Actives
            </h3>
            <div className="space-y-2">
              {outages
                .filter(o => o.status === 'active')
                .slice(0, 3)
                .map((outage) => (
                  <div
                    key={outage.id}
                    onClick={() => onOutageSelect(outage)}
                    className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200 cursor-pointer hover:bg-red-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getSeverityColor(outage.severity)}`}></div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          Panne {outage.type} - {outage.affectedSites.length} sites
                        </div>
                        <div className="text-xs text-gray-500">
                          {outage.affectedSites.map(s => s.region).filter((v, i, a) => a.indexOf(v) === i).join(', ')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {Math.floor((Date.now() - new Date(outage.startTime).getTime()) / 60000)}min
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}