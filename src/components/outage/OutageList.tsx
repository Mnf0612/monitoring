import React from 'react';
import { Outage } from '../../types';
import { AlertTriangle, Clock, MapPin, Users, CheckCircle } from 'lucide-react';
import { format, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';

interface OutageListProps {
  outages: Outage[];
  selectedRegion: string;
  onRegionChange: (region: string) => void;
  regions: string[];
  onOutageSelect: (outage: Outage) => void;
}

export function OutageList({ outages, selectedRegion, onRegionChange, regions, onOutageSelect }: OutageListProps) {
  const filteredOutages = selectedRegion === 'all' 
    ? outages 
    : outages.filter(outage => 
        outage.affectedSites?.some(site => site.region === selectedRegion)
      );

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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'investigating': return 'Investigation';
      case 'resolved': return 'Résolue';
      default: return status;
    }
  };

  const getDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    
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
    return format(date, 'dd/MM/yyyy HH:mm', { locale: fr });
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Pannes Réseau</h2>
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
          {filteredOutages.length} panne{filteredOutages.length > 1 ? 's' : ''} trouvée{filteredOutages.length > 1 ? 's' : ''}
        </p>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {filteredOutages.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune panne</h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedRegion === 'all' 
                ? 'Aucune panne détectée dans le système'
                : `Aucune panne détectée dans la région ${selectedRegion}`
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredOutages.map((outage) => (
              <div
                key={outage.id}
                onClick={() => onOutageSelect(outage)}
                className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getSeverityColor(outage.severity)}`}>
                        {outage.severity}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(outage.status)}`}>
                        {getStatusText(outage.status)}
                      </span>
                    </div>

                    <h3 className="text-sm font-medium text-gray-900 mb-1">
                      Panne {outage.type} - {outage.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {outage.description}
                    </p>

                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span>{outage.affectedSites?.length || 0} sites</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        <span>
                          {outage.affectedSites?.map(s => s.region).filter((v, i, a) => a.indexOf(v) === i).length || 0} région(s)
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>{getDuration(outage.startTime, outage.endTime)}</span>
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-gray-500">
                      Début: {formatDate(outage.startTime)}
                    </div>

                    {outage.ticketId && (
                      <div className="mt-1 text-xs text-blue-600">
                        Ticket: #{outage.ticketId}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}