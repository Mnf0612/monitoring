import React from 'react';
import { Outage } from '../../types';
import { format, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';
import { X, AlertTriangle, MapPin, Clock, Users, Ticket, CheckCircle, Search } from 'lucide-react';

interface OutageModalProps {
  outage: Outage;
  isOpen: boolean;
  onClose: () => void;
}

export function OutageModal({ outage, isOpen, onClose }: OutageModalProps) {
  if (!isOpen) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'major': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'minor': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-red-600 bg-red-50';
      case 'investigating': return 'text-yellow-600 bg-yellow-50';
      case 'resolved': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'investigating': return <Search className="w-5 h-5 text-yellow-500" />;
      case 'resolved': return <CheckCircle className="w-5 h-5 text-green-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'investigating': return 'Investigation en cours';
      case 'resolved': return 'Résolue';
      default: return status;
    }
  };

  const getDuration = () => {
    const start = new Date(outage.startTime);
    const end = outage.endTime ? new Date(outage.endTime) : new Date();
    
    if (!isValid(start) || !isValid(end)) return 'N/A';
    
    const diffMinutes = Math.floor((end.getTime() - start.getTime()) / 60000);
    
    if (diffMinutes < 60) return `${diffMinutes}min`;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (!isValid(date)) return 'N/A';
    return format(date, 'dd/MM/yyyy à HH:mm', { locale: fr });
  };

  const affectedRegions = outage.affectedSites 
    ? [...new Set(outage.affectedSites.map(site => site.region))]
    : [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              {getStatusIcon(outage.status)}
              <h2 className="text-lg font-semibold text-gray-900 ml-2">
                Détails de la Panne - {outage.id}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-6 py-4">
            <div className="space-y-6">
              {/* En-tête de la panne */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {outage.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {outage.description}
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Type:</span>
                        <div className="font-medium text-gray-900 uppercase">{outage.type}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Sévérité:</span>
                        <div>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getSeverityColor(outage.severity)}`}>
                            {outage.severity}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Statut:</span>
                        <div>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(outage.status)}`}>
                            {getStatusText(outage.status)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Durée:</span>
                        <div className="font-medium text-gray-900">{getDuration()}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informations temporelles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-red-900 mb-2 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Début de la panne
                  </h4>
                  <p className="text-red-800">{formatDate(outage.startTime)}</p>
                </div>

                {outage.endTime ? (
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-green-900 mb-2 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Fin de la panne
                    </h4>
                    <p className="text-green-800">{formatDate(outage.endTime)}</p>
                  </div>
                ) : outage.estimatedResolutionTime ? (
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-yellow-900 mb-2 flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Résolution estimée
                    </h4>
                    <p className="text-yellow-800">{formatDate(outage.estimatedResolutionTime)}</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Résolution en cours
                    </h4>
                    <p className="text-gray-600">Temps de résolution non estimé</p>
                  </div>
                )}
              </div>

              {/* Sites affectés */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Sites Affectés ({outage.affectedSites?.length || 0})
                </h4>
                
                {/* Résumé par région */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {affectedRegions.map(region => {
                      const regionSiteCount = outage.affectedSites?.filter(site => site.region === region).length || 0;
                      return (
                        <span
                          key={region}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                        >
                          {region} ({regionSiteCount} site{regionSiteCount > 1 ? 's' : ''})
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Liste détaillée des sites */}
                <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {outage.affectedSites?.map((site, index) => (
                      <div
                        key={site.id}
                        className="bg-white rounded-lg p-3 border border-gray-200"
                      >
                        <div className="font-medium text-gray-900 text-sm">{site.name}</div>
                        <div className="text-xs text-gray-500">{site.region}</div>
                      </div>
                    )) || (
                      <div className="col-span-full text-center text-gray-500 py-4">
                        Aucun site affecté
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Ticket associé */}
              {outage.ticketId && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
                    <Ticket className="w-4 h-4 mr-2" />
                    Ticket Associé
                  </h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-800 font-medium">#{outage.ticketId}</p>
                      <p className="text-blue-600 text-sm">Ticket créé automatiquement pour cette panne</p>
                    </div>
                    <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors">
                      Voir le ticket
                    </button>
                  </div>
                </div>
              )}

              {/* Résolution */}
              {outage.resolution && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-green-900 mb-2 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Résolution
                  </h4>
                  <p className="text-green-800">{outage.resolution}</p>
                </div>
              )}

              {/* Statistiques d'impact */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Impact de la Panne
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {outage.affectedSites?.length || 0}
                    </div>
                    <div className="text-xs text-gray-600">Sites impactés</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {affectedRegions.length}
                    </div>
                    <div className="text-xs text-gray-600">Régions touchées</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {outage.type.toUpperCase()}
                    </div>
                    <div className="text-xs text-gray-600">Type de panne</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {getDuration()}
                    </div>
                    <div className="text-xs text-gray-600">Durée totale</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}