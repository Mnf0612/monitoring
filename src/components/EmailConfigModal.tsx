import React, { useState } from 'react';
import { X, Mail, CheckCircle, Settings, Clock, BarChart3, RefreshCw, XCircle } from 'lucide-react';
import { emailService } from '../services/emailService';

interface EmailConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EmailConfigModal({ isOpen, onClose }: EmailConfigModalProps) {
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleTestEmail = async () => {
    setIsTestingEmail(true);
    setTestResult(null);
    
    try {
      const result = await emailService.testEmail('ip');
      setTestResult({
        success: result,
        message: result 
          ? 'Email de test envoyé avec succès à manuelmayi581@gmail.com!' 
          : 'Échec de l\'envoi de l\'email de test. Vérifiez votre connexion internet ou attendez quelques minutes (limite de taux EmailJS).'
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Erreur lors de l\'envoi de l\'email de test. Vérifiez votre connexion internet.'
      });
    } finally {
      setIsTestingEmail(false);
    }
  };

  const handleResetQuota = () => {
    emailService.resetQuotaFlag();
    setTestResult({
      success: true,
      message: 'Flag de quota réinitialisé avec succès. Vous pouvez maintenant tenter d\'envoyer des emails.'
    });
  };

  const queueStats = emailService.getQueueStats();
  const sessionStatus = emailService.getSessionStatus();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <Mail className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">
                Configuration EmailJS
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
              {/* Statut de la session avec limitations */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Statut de la Session (Limitations Activées)
                </h3>
                <div className="text-sm text-blue-800 space-y-2">
                  <div className="flex justify-between">
                    <span>Tickets utilisés :</span>
                    <span className="font-bold">{sessionStatus.ticketsUsed}/{sessionStatus.ticketsRemaining + sessionStatus.ticketsUsed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tickets restants :</span>
                    <span className={`font-bold ${sessionStatus.ticketsRemaining > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {sessionStatus.ticketsRemaining}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Prochain ticket :</span>
                    <span className="font-bold uppercase">{sessionStatus.nextTeam}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Peut envoyer maintenant :</span>
                    <span className={`font-bold ${sessionStatus.canSendNow ? 'text-green-600' : 'text-red-600'}`}>
                      {sessionStatus.canSendNow ? 'OUI' : 'NON'}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-blue-200">
                    <div className="text-xs text-blue-600">
                      Session démarrée : {sessionStatus.sessionStartTime}
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      Ordre des tickets : BSS → IP (10min entre chaque)
                    </div>
                  </div>
                </div>
              </div>

              {/* Status de la configuration */}
              <div className={`rounded-lg p-4 ${queueStats.quotaReached ? 'bg-red-50' : 'bg-blue-50'}`}>
                <div className="flex items-center">
                  {queueStats.quotaReached ? (
                    <XCircle className="w-5 h-5 text-red-500 mr-2" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-blue-500 mr-2" />
                  )}
                  <h3 className={`text-sm font-medium ${queueStats.quotaReached ? 'text-red-900' : 'text-blue-900'}`}>
                    {queueStats.quotaReached ? 'Quota EmailJS atteint' : 'Service Email Opérationnel (NOUVELLE CLÉ)'}
                  </h3>
                </div>
                <p className={`mt-2 text-sm ${queueStats.quotaReached ? 'text-red-800' : 'text-blue-800'}`}>
                  {queueStats.quotaReached 
                    ? 'Le quota EmailJS a été atteint. Réinitialisez le quota ou attendez le renouvellement.'
                    : 'Service configuré avec la NOUVELLE CLÉ EmailJS. Limitations : 2 tickets max par session (BSS puis IP), 10min entre chaque.'
                  }
                </p>
              </div>

              {/* Statistiques de la queue */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Statistiques d'envoi
                </h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <div className="flex justify-between">
                    <span>Emails en attente :</span>
                    <span className="font-medium">{queueStats.pending}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Traitement en cours :</span>
                    <span className={`font-medium ${queueStats.isProcessing ? 'text-green-600' : 'text-gray-600'}`}>
                      {queueStats.isProcessing ? 'Oui' : 'Non'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dernier envoi :</span>
                    <span className="font-medium">{queueStats.lastEmailTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quota atteint :</span>
                    <span className={`font-medium ${queueStats.quotaReached ? 'text-red-600' : 'text-green-600'}`}>
                      {queueStats.quotaReached ? 'Oui' : 'Non'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Prochain ticket :</span>
                    <span className="font-medium uppercase">{queueStats.nextTicketTeam}</span>
                  </div>
                  {queueStats.nextAvailableTime && (
                    <div className="flex justify-between">
                      <span>Disponible à :</span>
                      <span className="font-medium text-orange-600">{queueStats.nextAvailableTime}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Informations de configuration */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Configuration du Service
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Mode:</strong> RÉEL avec nouvelle clé EmailJS</p>
                  <p><strong>Clé publique:</strong> 0NftsL5CxGYcqWcNj</p>
                  <p><strong>Limitations:</strong> ✅ 2 tickets max par session</p>
                  <p><strong>Délai tickets:</strong> ✅ 10 minutes minimum</p>
                  <p><strong>Ordre forcé:</strong> ✅ BSS → IP</p>
                  <p><strong>Retry automatique:</strong> ✅ 3 tentatives max</p>
                  <p><strong>Logs détaillés:</strong> ✅ Console complète</p>
                </div>
              </div>

              {/* Emails des équipes */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Emails configurés (NOUVEAUX)
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>📧 Équipe IP:</span>
                    <span className="font-medium">manuelmayi581@gmail.com</span>
                  </div>
                  <div className="flex justify-between">
                    <span>📧 Équipe BSS:</span>
                    <span className="font-medium text-green-600">zambouyvand@yahoo.com</span>
                  </div>
                  <div className="flex justify-between">
                    <span>📧 Équipe Transmission:</span>
                    <span className="font-medium">manuelmayi581@gmail.com</span>
                  </div>
                  <div className="flex justify-between">
                    <span>📧 Équipe Power:</span>
                    <span className="font-medium">manuelmayi581@gmail.com</span>
                  </div>
                </div>
              </div>

              {/* Fonctionnement automatique */}
              <div className="bg-orange-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-orange-900 mb-2 flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  🚀 Fonctionnement avec Limitations
                </h3>
                <ul className="text-sm text-orange-800 space-y-1 list-disc list-inside">
                  <li><strong>LIMITATION:</strong> Maximum 2 tickets par session</li>
                  <li><strong>ORDRE FORCÉ:</strong> 1er ticket = BSS, 2ème ticket = IP</li>
                  <li><strong>DÉLAI:</strong> 10 minutes minimum entre chaque ticket</li>
                  <li><strong>EMAILS RÉELS:</strong> Envoi avec nouvelle clé EmailJS</li>
                  <li><strong>PROTECTION:</strong> Évite le dépassement de quota</li>
                  <li><strong>RESET:</strong> Rechargez la page pour nouvelle session</li>
                  <li><strong>LOGS:</strong> Suivi détaillé dans la console</li>
                </ul>
              </div>

              {/* Résultat du test */}
              {testResult && (
                <div className={`rounded-lg p-4 ${testResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="flex items-center">
                    <CheckCircle className={`w-5 h-5 mr-2 ${testResult.success ? 'text-green-500' : 'text-red-500'}`} />
                    <p className={`text-sm ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
                      {testResult.message}
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-between space-x-3 pt-4 border-t">
                <div className="flex space-x-3">
                  <button
                    onClick={handleTestEmail}
                    disabled={isTestingEmail}
                    className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    {isTestingEmail ? 'Test en cours...' : 'Tester l\'email'}
                  </button>

                  {queueStats.quotaReached && (
                    <button
                      onClick={handleResetQuota}
                      className="px-4 py-2 text-sm font-medium text-orange-700 bg-orange-100 border border-orange-300 rounded-md hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 flex items-center"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Réinitialiser quota
                    </button>
                  )}
                </div>

                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Fermer
                </button>
                
                <button
                  onClick={() => {
                    emailService.resetSession();
                    window.location.reload();
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Nouvelle Session
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}