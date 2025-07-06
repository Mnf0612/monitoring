import React from 'react';
import { Outage } from '../../types';
import { Clock, AlertTriangle, CheckCircle, Search } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface OutageTimelineProps {
  outages: Outage[];
}

export function OutageTimeline({ outages }: OutageTimelineProps) {
  // Trier les pannes par date de début (plus récentes en premier)
  const sortedOutages = [...outages].sort((a, b) => 
    new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  ).slice(0, 10); // Afficher les 10 dernières

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'major': return 'bg-orange-500';
      case 'minor': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'investigating': return <Search className="w-4 h-4 text-yellow-500" />;
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diffMinutes = Math.floor((end.getTime() - start.getTime()) / 60000);
    
    if (diffMinutes < 60) return `${diffMinutes}min`;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <Clock className="w-5 h-5 text-blue-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Chronologie des Pannes</h2>
        </div>
        <p className="text-sm text-gray-600 mt-1">Historique des 10 dernières pannes détectées</p>
      </div>

      <div className="p-6">
        {sortedOutages.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune panne récente</h3>
            <p className="mt-1 text-sm text-gray-500">
              Aucune panne détectée récemment
            </p>
          </div>
        ) : (
          <div className="flow-root">
            <ul className="-mb-8">
              {sortedOutages.map((outage, index) => (
                <li key={outage.id}>
                  <div className="relative pb-8">
                    {index !== sortedOutages.length - 1 && (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    )}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${getSeverityColor(outage.severity)}`}>
                          {getStatusIcon(outage.status)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              Panne {outage.type} - {outage.title}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {outage.description}
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span>{outage.affectedSites.length} sites impactés</span>
                              <span>Durée: {getDuration(outage.startTime, outage.endTime)}</span>
                              {outage.ticketId && (
                                <span className="text-blue-600">Ticket #{outage.ticketId}</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-900">
                              {format(new Date(outage.startTime), 'HH:mm', { locale: fr })}
                            </p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(outage.startTime), 'dd/MM', { locale: fr })}
                            </p>
                          </div>
                        </div>
                        
                        {/* Régions affectées */}
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-1">
                            {outage.affectedSites
                              .map(site => site.region)
                              .filter((region, index, array) => array.indexOf(region) === index)
                              .map(region => (
                                <span
                                  key={region}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                                >
                                  {region}
                                </span>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}