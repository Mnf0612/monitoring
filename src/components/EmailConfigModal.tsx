import React, { useState } from 'react';
import { X, Mail, CheckCircle, Settings, Clock, BarChart3, RefreshCw, XCircle, TestTube } from 'lucide-react';
import { emailService } from '../services/emailService';

interface EmailConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EmailConfigModal({ isOpen, onClose }: EmailConfigModalProps) {
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [isTestingVerification, setIsTestingVerification] = useState(false);
  const [isVerifyingConfig, setIsVerifyingConfig] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testEmail, setTestEmail] = useState('manuelmayi581@gmail.com');

  if (!isOpen) return null;

  const handleTestEmail = async () => {
    setIsTestingEmail(true);
    setTestResult(null);
    
    try {
      const result = await emailService.testEmail('ip');
      setTestResult({
        success: result,
        message: result 
          ? 'Email de test envoyé avec succès!' 
          : 'Échec de l\'envoi de l\'email de test. Vérifiez la console pour plus de détails.'
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Erreur lors de l\'envoi de l\'email de test.'
      });
    } finally {
      setIsTestingEmail(false);
    }
  };

  const handleTestVerification = async () => {
    setIsTestingVerification(true);
    setTestResult(null);
    
    try {
      const result = await emailService.testVerificationCode(testEmail);
      setTestResult({
        success: result,
        message: result 
          ? `Code de vérification envoyé avec succès à ${testEmail}!` 
          : 'Échec de l\'envoi du code de vérification. Vérifiez la console pour plus de détails.'
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Erreur lors de l\'envoi du code de vérification.'
      });
    } finally {
      setIsTestingVerification(false);
    }
  };

  const handleVerifyConfig = async () => {
    setIsVerifyingConfig(true);
    setTestResult(null);
    
    try {
      const result = await emailService.verifyEmailJSConfiguration();
      setTestResult({
        success: result.success,
        message: result.message
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Erreur lors de la vérification de la configuration.'
      });
    } finally {
      setIsVerifyingConfig(false);
    }
  };

  const queueStats = emailService.getQueueStats();
  const sessionStatus = emailService.getSessionStatus();
  const configStatus = emailService.getConfigurationStatus();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <Mail className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">
                Configuration EmailJS - Vos Clés
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
              {/* Statut de la configuration */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Statut de la Configuration
                </h3>
                <p className="text-sm text-blue-800">{configStatus}</p>
              </div>

              {/* Configuration actuelle */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Configuration EmailJS - NOUVELLE API
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Service ID:</span>
                    <span className="font-mono text-blue-600">Alarm_alerte</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Template Tickets:</span>
                    <span className="font-mono text-blue-600">template_bts_ticket</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Template Updates:</span>
                    <span className="font-mono text-blue-600">template_bts_update</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Clé publique:</span>
                    <span className="font-mono text-blue-600">0NftsL5CxGYcqWcNj</span>
                  </div>
                  <div className="flex justify-between">
                    <span>API Version:</span>
                    <span className="font-mono text-green-600">NOUVELLE API</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dashboard:</span>
                    <a href="https://dashboard.emailjs.com/admin" target="_blank" rel="noopener noreferrer" 
                       className="text-blue-600 hover:text-blue-800 underline text-xs">
                      Vérifier sur EmailJS
                    </a>
                  </div>
                </div>
                
                <div className="mt-4">
                  <button
                    onClick={handleVerifyConfig}
                    disabled={isVerifyingConfig}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    {isVerifyingConfig ? 'Vérification...' : 'Vérifier Configuration EmailJS'}
                  </button>
                </div>
              </div>

              {/* Emails des équipes */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Emails des Équipes Configurés
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>📧 Équipe IP:</span>
                    <span className="font-medium text-blue-600">manuelmayi581@gmail.com</span>
                  </div>
                  <div className="flex justify-between">
                    <span>📧 Équipe BSS:</span>
                    <span className="font-medium text-green-600">zambouyvand@yahoo.com</span>
                  </div>
                  <div className="flex justify-between">
                    <span>📧 Équipe Transmission:</span>
                    <span className="font-medium text-blue-600">manuelmayi581@gmail.com</span>
                  </div>
                  <div className="flex justify-between">
                    <span>📧 Équipe Power:</span>
                    <span className="font-medium text-blue-600">manuelmayi581@gmail.com</span>
                  </div>
                </div>
              </div>

              {/* Statistiques de la queue */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Statistiques d'Envoi
                </h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <div className="flex justify-between">
                    <span>Emails en attente:</span>
                    <span className="font-medium">{queueStats.pending}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Traitement en cours:</span>
                    <span className={`font-medium ${queueStats.isProcessing ? 'text-green-600' : 'text-gray-600'}`}>
                      {queueStats.isProcessing ? 'Oui' : 'Non'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dernier envoi:</span>
                    <span className="font-medium">{queueStats.lastEmailTime}</span>
                  </div>
                </div>
              </div>

              {/* Tests d'envoi */}
              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-yellow-900 mb-3 flex items-center">
                  <TestTube className="w-4 h-4 mr-2" />
                  Tests d'Envoi
                </h3>
                
                {/* Test notification ticket */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Test Notification Ticket
                    </label>
                    <button
                      onClick={handleTestEmail}
                      disabled={isTestingEmail}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      {isTestingEmail ? 'Envoi en cours...' : 'Tester Notification Ticket'}
                    </button>
                  </div>

                  {/* Test code de vérification */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Test Code de Vérification
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="email"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        placeholder="Email de test"
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={handleTestVerification}
                        disabled={isTestingVerification}
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        <TestTube className="w-4 h-4 mr-2" />
                        {isTestingVerification ? 'Envoi...' : 'Tester Code'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Résultat du test */}
              {testResult && (
                <div className={`rounded-lg p-4 ${testResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="flex items-center">
                    {testResult.success ? (
                      <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 mr-2 text-red-500" />
                    )}
                    <p className={`text-sm ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
                      {testResult.message}
                    </p>
                  </div>
                  {testResult.success && (
                    <p className="text-xs text-green-600 mt-2">
                      ✅ Vérifiez votre boîte email pour confirmer la réception
                    </p>
                  )}
                </div>
              )}

              {/* Fonctionnalités */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-green-900 mb-2 flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  ✅ Fonctionnalités Activées
                </h3>
                <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
                  <li><strong>Codes de vérification:</strong> Envoi automatique lors de la connexion</li>
                  <li><strong>Notifications tickets:</strong> Email automatique à la création</li>
                  <li><strong>Mises à jour tickets:</strong> Email lors des changements de statut</li>
                  <li><strong>Queue d'envoi:</strong> Retry automatique en cas d'échec</li>
                  <li><strong>Logs détaillés:</strong> Suivi complet dans la console</li>
                  <li><strong>Configuration production:</strong> Utilise vos vraies clés EmailJS</li>
                </ul>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">
                  🔧 Instructions - NOUVELLE API
                </h3>
                <div className="text-sm text-blue-800 space-y-2">
                  <p><strong>✅ Nouvelle API configurée:</strong> Alarm_alerte</p>
                  <p><strong>✅ Templates actifs:</strong> template_bts_ticket + template_bts_update</p>
                  <p><strong>🔐 Double authentification:</strong> Codes de vérification activés</p>
                  <p><strong>🎫 Notifications tickets:</strong> Emails automatiques activés</p>
                  <p><strong>📊 Logs détaillés:</strong> Console (F12) pour debugging</p>
                </div>
              </div>

              {/* Aide pour créer le template */}
              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-yellow-900 mb-2">
                  📝 Templates Configurés - NOUVELLE API
                </h3>
                <div className="text-sm text-yellow-800">
                  <p className="mb-2">Templates configurés :</p>
                  <div className="bg-yellow-100 p-2 rounded font-mono text-xs">
                    <div><strong>template_bts_ticket:</strong> Notifications + Vérification</div>
                    <div><strong>template_bts_update:</strong> Mises à jour tickets</div>
                  </div>
                  <p className="mt-2 text-xs">✅ Templates optimisés selon le type d'email</p>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between">
              <button
                onClick={() => {
                  emailService.resetQuotaFlag();
                  setTestResult({
                    success: true,
                    message: 'Queue d\'emails réinitialisée avec succès'
                  });
                }}
                className="px-4 py-2 text-sm font-medium text-orange-700 bg-orange-100 border border-orange-300 rounded-md hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Réinitialiser Queue
              </button>

              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
              >
                <Settings className="w-4 h-4 mr-2" />
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}