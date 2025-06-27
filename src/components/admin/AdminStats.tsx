import React from 'react';
import { Users, Activity, AlertTriangle, Ticket, TrendingUp, Clock } from 'lucide-react';
import { authService } from '../../services/authService';
import { alarmService } from '../../services/alarmService';
import { ticketService } from '../../services/ticketService';

export function AdminStats() {
  const users = authService.getUsers();
  const alarms = alarmService.getAlarms();
  const tickets = ticketService.getTickets();
  const sites = alarmService.getSites();

  const stats = [
    {
      title: 'Utilisateurs Totaux',
      value: users.length,
      icon: Users,
      color: 'bg-blue-500',
      change: '+2 ce mois'
    },
    {
      title: 'Sites Actifs',
      value: sites.filter(s => s.status === 'online').length,
      icon: Activity,
      color: 'bg-green-500',
      change: '98.2% uptime'
    },
    {
      title: 'Alarmes Actives',
      value: alarms.filter(a => a.status === 'active').length,
      icon: AlertTriangle,
      color: 'bg-red-500',
      change: '-5 depuis hier'
    },
    {
      title: 'Tickets Ouverts',
      value: tickets.filter(t => t.status === 'open').length,
      icon: Ticket,
      color: 'bg-orange-500',
      change: '2h temps moyen'
    }
  ];

  const usersByRole = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const alarmsByType = alarms.reduce((acc, alarm) => {
    acc[alarm.type] = (acc[alarm.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`${stat.color} rounded-lg p-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Users by Role */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Répartition des Utilisateurs
          </h3>
          <div className="space-y-3">
            {Object.entries(usersByRole).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 capitalize">{role}</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(count / users.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-900">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alarms by Type */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Alarmes par Type
          </h3>
          <div className="space-y-3">
            {Object.entries(alarmsByType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 uppercase">{type}</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${(count / alarms.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-900">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Activité Récente
        </h3>
        <div className="space-y-4">
          <div className="flex items-center p-3 bg-blue-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Nouvelle alarme créée</p>
              <p className="text-xs text-gray-500">BTS-CEN-101 - Panne d'alimentation</p>
            </div>
            <span className="text-xs text-gray-500">Il y a 5 min</span>
          </div>
          
          <div className="flex items-center p-3 bg-green-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Ticket résolu</p>
              <p className="text-xs text-gray-500">TKT-001 - Problème IP résolu</p>
            </div>
            <span className="text-xs text-gray-500">Il y a 15 min</span>
          </div>
          
          <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Nouvel utilisateur</p>
              <p className="text-xs text-gray-500">tech2 ajouté à l'équipe Power</p>
            </div>
            <span className="text-xs text-gray-500">Il y a 1h</span>
          </div>
        </div>
      </div>
    </div>
  );
}