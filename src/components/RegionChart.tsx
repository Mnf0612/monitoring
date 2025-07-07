import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Site, Alarm } from '../types';
import { MapPin, TrendingUp, Activity } from 'lucide-react';

interface RegionChartProps {
  sites: Site[];
  alarms: Alarm[];
  selectedRegion: string;
  onRegionSelect: (region: string) => void;
}

export function RegionChart({ sites, alarms, selectedRegion, onRegionSelect }: RegionChartProps) {
  // Préparer les données pour les graphiques
  const regionData = sites.reduce((acc, site) => {
    if (!acc[site.region]) {
      acc[site.region] = {
        region: site.region,
        total: 0,
        online: 0,
        offline: 0,
        maintenance: 0,
        alarms: 0
      };
    }
    
    acc[site.region].total++;
    acc[site.region][site.status]++;
    
    return acc;
  }, {} as Record<string, any>);

  // Ajouter les données d'alarmes
  alarms.forEach(alarm => {
    if (regionData[alarm.region]) {
      regionData[alarm.region].alarms++;
    }
  });

  const chartData = Object.values(regionData);

  // Données pour le graphique en secteurs (statut global)
  const statusData = [
    { name: 'En ligne', value: sites.filter(s => s.status === 'online').length, color: '#10b981' },
    { name: 'Hors ligne', value: sites.filter(s => s.status === 'offline').length, color: '#ef4444' },
    { name: 'Maintenance', value: sites.filter(s => s.status === 'maintenance').length, color: '#f59e0b' }
  ];

  const handleRegionClick = (data: any) => {
    if (data && data.region) {
      onRegionSelect(selectedRegion === data.region ? 'all' : data.region);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Analyse des Régions</h2>
          </div>
          <div className="text-sm text-gray-500">
            {selectedRegion !== 'all' && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                Filtre: {selectedRegion}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Graphique en barres - Sites par région */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
            <Activity className="w-4 h-4 mr-2" />
            Statut des Sites par Région
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} onClick={handleRegionClick}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="region" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [value, name === 'online' ? 'En ligne' : name === 'offline' ? 'Hors ligne' : 'Maintenance']}
                  labelFormatter={(label) => `Région: ${label}`}
                />
                <Legend 
                  formatter={(value) => value === 'online' ? 'En ligne' : value === 'offline' ? 'Hors ligne' : 'Maintenance'}
                />
                <Bar dataKey="online" stackId="a" fill="#10b981" name="online" />
                <Bar dataKey="offline" stackId="a" fill="#ef4444" name="offline" />
                <Bar dataKey="maintenance" stackId="a" fill="#f59e0b" name="maintenance" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Cliquez sur une barre pour filtrer par région
          </p>
        </div>

        {/* Graphique en secteurs - Répartition globale */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            Répartition Globale des Sites
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tableau récapitulatif */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-4">Récapitulatif par Région</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Région
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Sites
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    En ligne
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hors ligne
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Maintenance
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Alarmes
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Taux Disponibilité
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {chartData.map((region) => {
                  const availability = ((region.online / region.total) * 100).toFixed(1);
                  const isSelected = selectedRegion === region.region;
                  
                  return (
                    <tr 
                      key={region.region}
                      onClick={() => handleRegionClick(region)}
                      className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                    >
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {region.region}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {region.total}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                        {region.online}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                        {region.offline}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-yellow-600 font-medium">
                        {region.maintenance}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-orange-600 font-medium">
                        {region.alarms}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className={`h-2 rounded-full ${
                                parseFloat(availability) >= 90 ? 'bg-green-500' :
                                parseFloat(availability) >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${availability}%` }}
                            />
                          </div>
                          <span className={`text-xs font-medium ${
                            parseFloat(availability) >= 90 ? 'text-green-600' :
                            parseFloat(availability) >= 70 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {availability}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}