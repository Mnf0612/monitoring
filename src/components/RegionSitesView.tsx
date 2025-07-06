import React from 'react';
import { Site, Alarm } from '../types';
import { MapPin, Activity, AlertTriangle, CheckCircle, Clock, Wifi, WifiOff, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface RegionSitesViewProps {
  sites: Site[];
  alarms: Alarm[];
  selectedRegion: string;
  onRegionChange: (region: string) => void;
  regions: string[];
}

export function RegionSitesView({ sites, alarms, selectedRegion, onRegionChange, regions }: RegionSitesViewProps) {
  // Filtrer les sites selon la région sélectionnée
  const filteredSites = selectedRegion === 'all' 
    ? sites 
    : sites.filter(site => site.region === selectedRegion);

  // Compter les alarmes par site
  const getAlarmCountForSite = (siteName: string) => {
    return alarms.filter(alarm => alarm.site === siteName && alarm.status === 'active').length;
  };

  // Obtenir la sévérité la plus élevée pour un site
  const getHighestSeverityForSite = (siteName: string) => {
    const siteAlarms = alarms.filter(alarm => alarm.site === siteName && alarm.status === 'active');
    if (siteAlarms.length === 0) return null;
    
    const severityOrder = { critical: 4, major: 3, minor: 2, warning: 1 };
    return siteAlarms.reduce((highest, alarm) => {
      return severityOrder[alarm.severity as keyof typeof severityOrder] > severityOrder[highest.severity as keyof typeof severityOrder] 
        ? alarm 
        : highest;
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <Wifi className="w-5 h-5 text-green-500" />;
      case 'offline': return <WifiOff className="w-5 h-5 text-red-500" />;
      case 'maintenance': return <Settings className="w-5 h-5 text-yellow-500" />;
      default: return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-50 border-green-200';
      case 'offline': return 'text-red-600 bg-red-50 border-red-200';
      case 'maintenance': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'En ligne';
      case 'offline': return 'Hors ligne';
      case 'maintenance': return 'Maintenance';
      default: return status;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'major': return 'text-orange-600 bg-orange-100';
      case 'minor': return 'text-yellow-600 bg-yellow-100';
      case 'warning': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <MapPin className="w-5 h-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">
              Sites BTS {selectedRegion !== 'all' ? `- ${selectedRegion}` : ''}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Région:</label>
            <select
              value={selectedRegion}
              onChange={(e) => onRegionChange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toutes les régions</option>
              {regions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {filteredSites.length} site{filteredSites.length > 1 ? 's' : ''} affiché{filteredSites.length > 1 ? 's' : ''}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Site
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Région
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Alarmes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sévérité Max
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Coordonnées
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dernière MAJ
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSites.map((site) => {
              const alarmCount = getAlarmCountForSite(site.name);
              const highestSeverityAlarm = getHighestSeverityForSite(site.name);
              
              return (
                <tr key={site.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(site.status)}
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{site.name}</div>
                        <div className="text-sm text-gray-500">ID: {site.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{site.region}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(site.status)}`}>
                      {getStatusText(site.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {alarmCount > 0 ? (
                        <>
                          <AlertTriangle className="w-4 h-4 text-red-500 mr-1" />
                          <span className="text-sm font-bold text-red-600">{alarmCount}</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                          <span className="text-sm text-green-600">0</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {highestSeverityAlarm ? (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${getSeverityColor(highestSeverityAlarm.severity)}`}>
                        {highestSeverityAlarm.severity}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="font-mono text-xs">
                      <div>Lat: {site.coordinates[1].toFixed(4)}</div>
                      <div>Lng: {site.coordinates[0].toFixed(4)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {format(new Date(site.lastUpdate), 'dd/MM/yyyy HH:mm', { locale: fr })}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredSites.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun site trouvé</h3>
          <p className="mt-1 text-sm text-gray-500">
            {selectedRegion === 'all' 
              ? 'Aucun site disponible dans le système'
              : `Aucun site trouvé dans la région ${selectedRegion}`
            }
          </p>
        </div>
      )}

      {/* Résumé en bas */}
      {filteredSites.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {filteredSites.filter(s => s.status === 'online').length}
              </div>
              <div className="text-gray-600">En ligne</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">
                {filteredSites.filter(s => s.status === 'offline').length}
              </div>
              <div className="text-gray-600">Hors ligne</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-600">
                {filteredSites.filter(s => s.status === 'maintenance').length}
              </div>
              <div className="text-gray-600">Maintenance</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">
                {filteredSites.reduce((total, site) => total + getAlarmCountForSite(site.name), 0)}
              </div>
              <div className="text-gray-600">Alarmes totales</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}