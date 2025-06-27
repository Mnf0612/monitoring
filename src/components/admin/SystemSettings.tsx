import React, { useState } from 'react';
import { Settings, Save, RefreshCw, Database, Mail, MessageSquare } from 'lucide-react';

export function SystemSettings() {
  const [settings, setSettings] = useState({
    alarmGeneration: {
      enabled: true,
      interval: 180, // seconds
      autoResolve: true,
      resolveInterval: 300
    },
    notifications: {
      emailEnabled: true,
      smsEnabled: true,
      webhookEnabled: false,
      webhookUrl: ''
    },
    system: {
      maxAlarms: 1000,
      maxTickets: 500,
      dataRetention: 30, // days
      autoBackup: true
    }
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Paramètres sauvegardés:', settings);
    setIsSaving(false);
  };

  const handleReset = () => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres ?')) {
      setSettings({
        alarmGeneration: {
          enabled: true,
          interval: 180,
          autoResolve: true,
          resolveInterval: 300
        },
        notifications: {
          emailEnabled: true,
          smsEnabled: true,
          webhookEnabled: false,
          webhookUrl: ''
        },
        system: {
          maxAlarms: 1000,
          maxTickets: 500,
          dataRetention: 30,
          autoBackup: true
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Paramètres Système</h2>
          <p className="text-gray-600">Configuration générale du système de monitoring</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleReset}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Réinitialiser
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alarm Generation Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Génération d'Alarmes
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Génération automatique
              </label>
              <input
                type="checkbox"
                checked={settings.alarmGeneration.enabled}
                onChange={(e) => setSettings({
                  ...settings,
                  alarmGeneration: { ...settings.alarmGeneration, enabled: e.target.checked }
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Intervalle de génération (secondes)
              </label>
              <input
                type="number"
                value={settings.alarmGeneration.interval}
                onChange={(e) => setSettings({
                  ...settings,
                  alarmGeneration: { ...settings.alarmGeneration, interval: parseInt(e.target.value) }
                })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="60"
                max="3600"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Résolution automatique
              </label>
              <input
                type="checkbox"
                checked={settings.alarmGeneration.autoResolve}
                onChange={(e) => setSettings({
                  ...settings,
                  alarmGeneration: { ...settings.alarmGeneration, autoResolve: e.target.checked }
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Intervalle de résolution (secondes)
              </label>
              <input
                type="number"
                value={settings.alarmGeneration.resolveInterval}
                onChange={(e) => setSettings({
                  ...settings,
                  alarmGeneration: { ...settings.alarmGeneration, resolveInterval: parseInt(e.target.value) }
                })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="120"
                max="7200"
              />
            </div>
          </div>
        </div>

        {/* Notifications Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Mail className="w-5 h-5 mr-2" />
            Notifications
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Notifications Email
              </label>
              <input
                type="checkbox"
                checked={settings.notifications.emailEnabled}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, emailEnabled: e.target.checked }
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Notifications SMS
              </label>
              <input
                type="checkbox"
                checked={settings.notifications.smsEnabled}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, smsEnabled: e.target.checked }
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Webhooks
              </label>
              <input
                type="checkbox"
                checked={settings.notifications.webhookEnabled}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, webhookEnabled: e.target.checked }
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            {settings.notifications.webhookEnabled && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Webhook
                </label>
                <input
                  type="url"
                  value={settings.notifications.webhookUrl}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, webhookUrl: e.target.value }
                  })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/webhook"
                />
              </div>
            )}
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Database className="w-5 h-5 mr-2" />
            Système
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre maximum d'alarmes
              </label>
              <input
                type="number"
                value={settings.system.maxAlarms}
                onChange={(e) => setSettings({
                  ...settings,
                  system: { ...settings.system, maxAlarms: parseInt(e.target.value) }
                })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="100"
                max="10000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre maximum de tickets
              </label>
              <input
                type="number"
                value={settings.system.maxTickets}
                onChange={(e) => setSettings({
                  ...settings,
                  system: { ...settings.system, maxTickets: parseInt(e.target.value) }
                })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="50"
                max="5000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rétention des données (jours)
              </label>
              <input
                type="number"
                value={settings.system.dataRetention}
                onChange={(e) => setSettings({
                  ...settings,
                  system: { ...settings.system, dataRetention: parseInt(e.target.value) }
                })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="7"
                max="365"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Sauvegarde automatique
              </label>
              <input
                type="checkbox"
                checked={settings.system.autoBackup}
                onChange={(e) => setSettings({
                  ...settings,
                  system: { ...settings.system, autoBackup: e.target.checked }
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* Status Panel */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            État du Système
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Service d'alarmes</span>
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                Actif
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Service de notifications</span>
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                Actif
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Base de données</span>
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                Connectée
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Dernière sauvegarde</span>
              <span className="text-sm text-gray-500">Il y a 2h</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}