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