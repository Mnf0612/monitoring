import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Alarm } from '../types';

interface AlarmChartProps {
  alarms: Alarm[];
}

export function AlarmChart({ alarms }: AlarmChartProps) {
  const severityData = [
    { name: 'Critique', value: alarms.filter(a => a.severity === 'critical').length, color: '#ef4444' },
    { name: 'Majeure', value: alarms.filter(a => a.severity === 'major').length, color: '#f97316' },
    { name: 'Mineure', value: alarms.filter(a => a.severity === 'minor').length, color: '#eab308' },
    { name: 'Avertissement', value: alarms.filter(a => a.severity === 'warning').length, color: '#3b82f6' }
  ];

  const typeData = [
    { name: 'Power', value: alarms.filter(a => a.type === 'power').length },
    { name: 'IP', value: alarms.filter(a => a.type === 'ip').length },
    { name: 'Transmission', value: alarms.filter(a => a.type === 'transmission').length },
    { name: 'BSS', value: alarms.filter(a => a.type === 'bss').length },
    { name: 'Hardware', value: alarms.filter(a => a.type === 'hardware').length },
    { name: 'Security', value: alarms.filter(a => a.type === 'security').length }
  ];

  // Préparer les données d'alarmes par région
  const alarmsByRegion = alarms.reduce((acc, alarm) => {
    const region = alarm.region;
    if (!acc[region]) {
      acc[region] = 0;
    }
    acc[region]++;
    return acc;
  }, {} as Record<string, number>);

  const regionData = Object.entries(alarmsByRegion)
    .map(([region, count]) => ({
      region: region,
      alarmes: count
    }))
    .sort((a, b) => b.alarmes - a.alarmes)
    .slice(0, 10); // Top 10 des régions avec le plus d'alarmes

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Analyse des Alarmes</h2>
        <p className="text-sm text-gray-600 mt-1">
          {alarms.length} alarme{alarms.length > 1 ? 's' : ''} au total
        </p>
      </div>

      <div className="p-6 space-y-8">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-4">Répartition par Sévérité</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => value > 0 ? `${name}: ${value} (${(percent * 100).toFixed(0)}%)` : ''}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Graphique des alarmes par région */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-4">
              Alarmes par Région (Top 10)
            </h3>
            {regionData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={regionData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                      dataKey="region" 
                      type="category" 
                      width={80}
                      fontSize={11}
                    />
                    <Tooltip 
                      formatter={(value) => [value, 'Alarmes']}
                      labelFormatter={(label) => `Région: ${label}`}
                    />
                    <Bar dataKey="alarmes" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-gray-400 mb-2">📊</div>
                  <p className="text-sm text-gray-500">Aucune alarme par région</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Les données apparaîtront quand des alarmes seront générées
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Graphique par type */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-4">Répartition par Type</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Tableau détaillé des alarmes par région */}
        {regionData.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-4">
              Détail des Alarmes par Région
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rang
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Région
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre d'Alarmes
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pourcentage
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Niveau d'Impact
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {regionData.map((region, index) => {
                    const percentage = ((region.alarmes / alarms.length) * 100).toFixed(1);
                    const impactLevel = region.alarmes >= 10 ? 'Élevé' : 
                                      region.alarmes >= 5 ? 'Modéré' : 'Faible';
                    const impactColor = region.alarmes >= 10 ? 'text-red-600 bg-red-50' : 
                                       region.alarmes >= 5 ? 'text-orange-600 bg-orange-50' : 
                                       'text-green-600 bg-green-50';
                    
                    return (
                      <tr key={region.region} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                            index === 0 ? 'bg-red-500 text-white' :
                            index === 1 ? 'bg-orange-500 text-white' :
                            index === 2 ? 'bg-yellow-500 text-white' :
                            'bg-gray-500 text-white'
                          }`}>
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {region.region}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="font-bold text-lg">{region.alarmes}</span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {percentage}%
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${impactColor}`}>
                            {impactLevel}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Statistiques globales */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Statistiques Globales</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-red-600">
                {alarms.filter(a => a.severity === 'critical').length}
              </div>
              <div className="text-xs text-gray-600">Critiques</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {alarms.filter(a => a.severity === 'major').length}
              </div>
              <div className="text-xs text-gray-600">Majeures</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {alarms.filter(a => a.severity === 'minor').length}
              </div>
              <div className="text-xs text-gray-600">Mineures</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {alarms.filter(a => a.severity === 'warning').length}
              </div>
              <div className="text-xs text-gray-600">Avertissements</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}