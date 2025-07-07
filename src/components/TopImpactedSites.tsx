import React from 'react';
import { AlertTriangle, MapPin, TrendingUp } from 'lucide-react';

interface TopImpactedSitesProps {
  sites: { site: string; alarmCount: number; region: string }[];
}

export function TopImpactedSites({ sites }: TopImpactedSitesProps) {
  const getImpactColor = (count: number) => {
    if (count >= 5) return 'text-red-600 bg-red-50';
    if (count >= 3) return 'text-orange-600 bg-orange-50';
    if (count >= 2) return 'text-yellow-600 bg-yellow-50';
    return 'text-blue-600 bg-blue-50';
  };

  const getImpactLevel = (count: number) => {
    if (count >= 5) return 'Critique';
    if (count >= 3) return 'Élevé';
    if (count >= 2) return 'Modéré';
    return 'Faible';
  };

  // Afficher les 12 premiers sites au lieu de 10
  const displayedSites = sites.slice(0, 12);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <TrendingUp className="w-5 h-5 text-red-500 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Top 12 Sites Impactés</h2>
        </div>
        <p className="text-sm text-gray-600 mt-1">Sites avec le plus d'alarmes (toutes périodes)</p>
      </div>

      <div className="p-6">
        {displayedSites.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune donnée</h3>
            <p className="mt-1 text-sm text-gray-500">
              Aucun site avec des alarmes pour le moment
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {displayedSites.map((site, index) => (
              <div
                key={site.site}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <span className={`inline-flex items-center justify-center w-7 h-7 text-xs font-bold rounded-full ${
                      index < 3 ? 'bg-red-500 text-white' :
                      index < 6 ? 'bg-orange-500 text-white' :
                      index < 9 ? 'bg-yellow-500 text-white' :
                      'bg-gray-500 text-white'
                    }`}>
                      {index + 1}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {site.site}
                    </h4>
                    <div className="flex items-center text-xs text-gray-500">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span>{site.region}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getImpactColor(site.alarmCount)}`}>
                    {getImpactLevel(site.alarmCount)}
                  </span>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {site.alarmCount}
                    </div>
                    <div className="text-xs text-gray-500">
                      alarme{site.alarmCount > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Statistiques en bas */}
        {displayedSites.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="text-lg font-bold text-red-600">
                  {displayedSites.filter(s => s.alarmCount >= 5).length}
                </div>
                <div className="text-gray-600">Sites critiques</div>
              </div>
              <div>
                <div className="text-lg font-bold text-orange-600">
                  {displayedSites.filter(s => s.alarmCount >= 3 && s.alarmCount < 5).length}
                </div>
                <div className="text-gray-600">Impact élevé</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-600">
                  {displayedSites.reduce((sum, site) => sum + site.alarmCount, 0)}
                </div>
                <div className="text-gray-600">Total alarmes</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}