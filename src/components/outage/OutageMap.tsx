import React, { useState } from 'react';
import { Outage } from '../../types';
import { MapPin, AlertTriangle, Clock, Users, ZoomIn, ArrowLeft, Zap, WifiOff } from 'lucide-react';
import { alarmService } from '../../services/alarmService';
import { outageService } from '../../services/outageService';

interface OutageMapProps {
  outages: Outage[];
  selectedRegion: string;
  onRegionSelect: (region: string) => void;
  onOutageSelect: (outage: Outage) => void;
}

export function OutageMap({ outages, selectedRegion, onRegionSelect, onOutageSelect }: OutageMapProps) {
  const [zoomedRegion, setZoomedRegion] = useState<string | null>(null);

  const cameroonRegions = [
    { name: 'Adamaoua', coords: { x: 45, y: 35 } },
    { name: 'Centre', coords: { x: 50, y: 55 } },
    { name: 'Est', coords: { x: 75, y: 50 } },
    { name: 'Extrême-Nord', coords: { x: 40, y: 15 } },
    { name: 'Littoral', coords: { x: 35, y: 65 } },
    { name: 'Nord', coords: { x: 45, y: 25 } },
    { name: 'Nord-Ouest', coords: { x: 25, y: 35 } },
    { name: 'Ouest', coords: { x: 35, y: 45 } },
    { name: 'Sud', coords: { x: 50, y: 75 } },
    { name: 'Sud-Ouest', coords: { x: 20, y: 55 } }
  ];

  const getOutagesForRegion = (regionName: string) => {
    return outages.filter(outage => 
      outage.affectedSites.some(site => site.region === regionName) && 
      outage.status === 'active'
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600';
      case 'major': return 'bg-orange-500';
      case 'minor': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  const getRegionOutageLevel = (regionName: string) => {
    const regionOutages = getOutagesForRegion(regionName);
    if (regionOutages.length === 0) return 'none';
    
    const hasCritical = regionOutages.some(o => o.severity === 'critical');
    const hasMajor = regionOutages.some(o => o.severity === 'major');
    
    if (hasCritical) return 'critical';
    if (hasMajor) return 'major';
    return 'minor';
  };

  const handleRegionClick = (regionName: string) => {
    if (zoomedRegion) {
      // Si on est déjà zoomé, sélectionner la région pour filtrage
      onRegionSelect(selectedRegion === regionName ? 'all' : regionName);
    } else {
      // Zoomer sur la région
      setZoomedRegion(regionName);
    }
  };

  const handleBackToCountry = () => {
    setZoomedRegion(null);
  };

  // Générer les sites pour la région zoomée
  const getRegionSites = (regionName: string) => {
    const sites = alarmService.getSites().filter(site => site.region === regionName);
    
    // Générer des positions aléatoires pour les sites dans la région
    return sites.map((site, index) => {
      const angle = (index / sites.length) * 2 * Math.PI;
      const radius = 15 + Math.random() * 25; // Rayon variable
      const centerX = 50;
      const centerY = 50;
      
      return {
        ...site,
        mapCoords: {
          x: centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 10,
          y: centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 10
        }
      };
    });
  };

  const getSiteStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-600';
      case 'maintenance': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const handleForceOutage = async () => {
    console.log('🎯 Génération forcée d\'une panne...');
    await outageService.forceGenerateOutage();
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <MapPin className="w-5 h-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">
              {zoomedRegion ? `Carte Détaillée - ${zoomedRegion}` : 'Carte des Pannes - Cameroun'}
            </h2>
            {zoomedRegion && (
              <button
                onClick={handleBackToCountry}
                className="ml-4 inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Retour au pays
              </button>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleForceOutage}
              className="inline-flex items-center px-3 py-1 text-sm bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
              title="Générer une panne pour démonstration"
            >
              <Zap className="w-4 h-4 mr-1" />
              Simuler Panne
            </button>
            <div className="text-sm text-gray-500">
              {zoomedRegion ? (
                <>
                  {alarmService.getSites().filter(s => s.region === zoomedRegion).length} sites dans {zoomedRegion}
                </>
              ) : (
                <>
                  {outages.filter(o => o.status === 'active').length} panne(s) active(s)
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {!zoomedRegion ? (
          // Vue du pays entier avec animation des pannes
          <div className="relative bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-8 h-96 overflow-hidden">
            {/* Contour simplifié du Cameroun */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
              <path
                d="M20 20 L80 15 L85 25 L90 40 L85 60 L80 75 L70 85 L50 90 L30 85 L15 70 L10 50 L15 30 Z"
                fill="rgba(34, 197, 94, 0.1)"
                stroke="rgba(34, 197, 94, 0.3)"
                strokeWidth="0.5"
              />
            </svg>

            {/* Régions avec indicateurs de pannes animés */}
            {cameroonRegions.map((region) => {
              const outageLevel = getRegionOutageLevel(region.name);
              const regionOutages = getOutagesForRegion(region.name);
              const totalAffectedSites = regionOutages.reduce((sum, outage) => 
                sum + outage.affectedSites.filter(site => site.region === region.name).length, 0
              );

              return (
                <div
                  key={region.name}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                  style={{ left: `${region.coords.x}%`, top: `${region.coords.y}%` }}
                  onClick={() => handleRegionClick(region.name)}
                >
                  {/* Indicateur de panne avec animation */}
                  <div className={`relative ${
                    outageLevel === 'critical' ? 'animate-pulse' : ''
                  }`}>
                    {/* Onde de propagation pour les pannes critiques */}
                    {outageLevel === 'critical' && (
                      <div className="absolute inset-0 w-12 h-12 -translate-x-2 -translate-y-2">
                        <div className="w-full h-full bg-red-500 rounded-full opacity-20 animate-ping"></div>
                      </div>
                    )}
                    
                    <div className={`w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center ${
                      outageLevel === 'critical' ? 'bg-red-600 animate-pulse' :
                      outageLevel === 'major' ? 'bg-orange-500' :
                      outageLevel === 'minor' ? 'bg-yellow-500' :
                      'bg-green-500'
                    } ${selectedRegion === region.name ? 'ring-4 ring-blue-300' : ''} hover:scale-110 transition-transform`}>
                      {regionOutages.length > 0 ? (
                        <WifiOff className="w-4 h-4 text-white" />
                      ) : (
                        <ZoomIn className="w-4 h-4 text-white" />
                      )}
                      
                      {regionOutages.length > 0 && (
                        <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-bounce">
                          {regionOutages.length}
                        </div>
                      )}
                    </div>
                    
                    {/* Tooltip au survol avec plus d'informations */}
                    <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      <div className="font-semibold">{region.name}</div>
                      <div>Pannes actives: {regionOutages.length}</div>
                      <div>Sites impactés: {totalAffectedSites}</div>
                      {regionOutages.length > 0 && (
                        <div className="text-red-300">
                          ⚠️ Niveau: {outageLevel}
                        </div>
                      )}
                      <div className="text-blue-300">🔍 Cliquer pour zoomer</div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>

                  {/* Nom de la région avec indicateur de statut */}
                  <div className="absolute top-10 left-1/2 transform -translate-x-1/2 text-xs font-medium whitespace-nowrap">
                    <span className={`${
                      outageLevel === 'critical' ? 'text-red-700 font-bold' :
                      outageLevel === 'major' ? 'text-orange-700 font-bold' :
                      outageLevel === 'minor' ? 'text-yellow-700 font-bold' :
                      'text-gray-700'
                    }`}>
                      {region.name}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Indicateur de détection automatique */}
            <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                Détection automatique active
              </div>
            </div>
          </div>
        ) : (
          // Vue zoomée d'une région spécifique avec détails des pannes
          <div className="relative bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-8 h-96 overflow-hidden border-2 border-blue-200">
            {/* Fond de la région */}
            <div className="absolute inset-4 bg-white/50 rounded-lg border border-blue-300"></div>
            
            {/* Titre de la région avec statut */}
            <div className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold">
              Région {zoomedRegion}
              {getOutagesForRegion(zoomedRegion).length > 0 && (
                <span className="ml-2 bg-red-500 px-2 py-1 rounded text-xs animate-pulse">
                  {getOutagesForRegion(zoomedRegion).length} PANNE(S)
                </span>
              )}
            </div>

            {/* Sites de la région avec indicateurs de panne */}
            {getRegionSites(zoomedRegion).map((site) => {
              const siteOutages = outages.filter(outage => 
                outage.affectedSites.some(affectedSite => affectedSite.id === site.id) &&
                outage.status === 'active'
              );

              return (
                <div
                  key={site.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                  style={{ 
                    left: `${Math.max(10, Math.min(90, site.mapCoords.x))}%`, 
                    top: `${Math.max(15, Math.min(85, site.mapCoords.y))}%` 
                  }}
                  onClick={() => {
                    if (siteOutages.length > 0) {
                      onOutageSelect(siteOutages[0]);
                    }
                  }}
                >
                  <div className={`relative ${
                    siteOutages.length > 0 ? 'animate-pulse' : ''
                  }`}>
                    {/* Onde de propagation pour les sites en panne */}
                    {siteOutages.length > 0 && (
                      <div className="absolute inset-0 w-8 h-8 -translate-x-2 -translate-y-2">
                        <div className="w-full h-full bg-red-500 rounded-full opacity-30 animate-ping"></div>
                      </div>
                    )}
                    
                    <div className={`w-4 h-4 rounded-full border border-white shadow-md ${getSiteStatusColor(site.status)} ${
                      siteOutages.length > 0 ? 'ring-2 ring-red-300 animate-pulse' : ''
                    } hover:scale-125 transition-transform`}>
                      {siteOutages.length > 0 && (
                        <div className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-3 h-3 flex items-center justify-center font-bold">
                          !
                        </div>
                      )}
                    </div>
                    
                    {/* Tooltip détaillé pour chaque site */}
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      <div className="font-semibold">{site.name}</div>
                      <div>Statut: {site.status === 'online' ? 'En ligne' : site.status === 'offline' ? 'Hors ligne' : 'Maintenance'}</div>
                      {siteOutages.length > 0 && (
                        <>
                          <div className="text-red-300">⚠️ {siteOutages.length} panne(s)</div>
                          <div className="text-red-300">Type: {siteOutages[0].type}</div>
                          <div className="text-red-300">Sévérité: {siteOutages[0].severity}</div>
                        </>
                      )}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Statistiques de la région avec alertes */}
            <div className="absolute bottom-4 right-4 bg-white/90 rounded-lg p-3 text-sm">
              <div className="font-semibold text-gray-900 mb-2">Statistiques {zoomedRegion}</div>
              {(() => {
                const regionSites = alarmService.getSites().filter(s => s.region === zoomedRegion);
                const onlineSites = regionSites.filter(s => s.status === 'online').length;
                const offlineSites = regionSites.filter(s => s.status === 'offline').length;
                const maintenanceSites = regionSites.filter(s => s.status === 'maintenance').length;
                const regionOutages = getOutagesForRegion(zoomedRegion);
                
                return (
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Total:</span>
                      <span className="font-medium">{regionSites.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600">En ligne:</span>
                      <span className="font-medium text-green-600">{onlineSites}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-600">Hors ligne:</span>
                      <span className={`font-medium text-red-600 ${offlineSites > 0 ? 'animate-pulse' : ''}`}>
                        {offlineSites}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-yellow-600">Maintenance:</span>
                      <span className="font-medium text-yellow-600">{maintenanceSites}</span>
                    </div>
                    {regionOutages.length > 0 && (
                      <div className="pt-1 border-t border-gray-300">
                        <div className="flex justify-between">
                          <span className="text-red-600 font-bold">Pannes actives:</span>
                          <span className="font-bold text-red-600 animate-pulse">{regionOutages.length}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Légende améliorée */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {!zoomedRegion ? (
              <>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Aucune panne</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Panne mineure</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Panne majeure</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">Panne critique</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Site en ligne</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">Site en panne</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Site en maintenance</span>
                </div>
              </>
            )}
          </div>
          
          <div className="text-xs text-gray-500">
            {!zoomedRegion ? (
              '🔍 Cliquez sur une région pour zoomer • ⚡ Simuler Panne pour tester'
            ) : (
              '⚠️ Cliquez sur un site en panne pour voir les détails'
            )}
          </div>
        </div>

        {/* Liste des pannes actives pour la vue pays avec plus de détails */}
        {!zoomedRegion && outages.filter(o => o.status === 'active').length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-medium text-gray-900 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 text-red-500 animate-pulse" />
              Pannes Actives Détectées
            </h3>
            <div className="space-y-2">
              {outages
                .filter(o => o.status === 'active')
                .slice(0, 5)
                .map((outage) => (
                  <div
                    key={outage.id}
                    onClick={() => onOutageSelect(outage)}
                    className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200 cursor-pointer hover:bg-red-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getSeverityColor(outage.severity)} animate-pulse`}></div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {outage.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {outage.affectedSites.length} sites • {outage.affectedSites.map(s => s.region).filter((v, i, a) => a.indexOf(v) === i).join(', ')}
                        </div>
                        <div className="text-xs text-red-600 font-medium">
                          Type: {outage.type} • Sévérité: {outage.severity}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {Math.floor((Date.now() - new Date(outage.startTime).getTime()) / 60000)}min
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}