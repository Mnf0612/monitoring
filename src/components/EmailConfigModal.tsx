import React, { useState } from 'react';
import { X, Mail, Key, Settings, CheckCircle, AlertTriangle } from 'lucide-react';
import { emailService } from '../services/emailService';

interface EmailConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EmailConfigModal({ isOpen, onClose }: EmailConfigModalProps) {
  const [serviceId, setServiceId] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSaveConfig = () => {
    if (serviceId && templateId && publicKey) {
      emailService.updateConfiguration(serviceId, templateId, publicKey);
      setTestResult({ success: true, message: 'Configuration sauvegardée avec succès!' });
    } else {
      setTestResult({ success: false, message: 'Veuillez remplir tous les champs obligatoires.' });
    }
  };

  const handleTestEmail = async () => {
    setIsTestingEmail(true);
    setTestResult(null);
    
    try {
      const result = await emailService.testEmail('ip');
      setTestResult({
        success: result,
        message: result 
          ? 'Email de test envoyé avec succès à manuelmayi581@gmail.com!' 
          : 'Échec de l\'envoi de l\'email de test. Vérifiez votre configuration.'
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

  const configStatus = emailService.checkConfiguration();

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
              {/* Instructions */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">
                  Instructions de configuration
                </h3>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Créez un compte sur <a href="https://www.emailjs.com/" target="_blank" rel="noopener noreferrer" className="underline">EmailJS.com</a></li>
                  <li>Créez un nouveau service email (Gmail, Outlook, etc.)</li>
                  <li>Créez un template d'email avec les variables nécessaires</li>
                  <li>Copiez vos identifiants ci-dessous</li>
                </ol>
              </div>

              {/* Status actuel */}
              <div className={`rounded-lg p-4 ${configStatus.isValid ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex items-center">
                  {configStatus.isValid ? (
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                  )}
                  <h3 className={`text-sm font-medium ${configStatus.isValid ? 'text-green-900' : 'text-red-900'}`}>
                    {configStatus.isValid ? 'Configuration valide' : 'Configuration incomplète'}
                  </h3>
                </div>
                {!configStatus.isValid && (
                  <ul className="mt-2 text-sm text-red-800 list-disc list-inside">
                    {configStatus.issues.map((issue, index) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Formulaire de configuration */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service ID *
                  </label>
                  <input
                    type="text"
                    value={serviceId}
                    onChange={(e) => setServiceId(e.target.value)}
                    placeholder="service_xxxxxxx"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template ID *
                  </label>
                  <input
                    type="text"
                    value={templateId}
                    onChange={(e) => setTemplateId(e.target.value)}
                    placeholder="template_xxxxxxx"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Clé Publique *
                  </label>
                  <input
                    type="text"
                    value={publicKey}
                    onChange={(e) => setPublicKey(e.target.value)}
                    placeholder="Votre clé publique EmailJS"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Email de l'équipe IP */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Email configuré pour l'équipe IP
                </h3>
                <p className="text-sm text-gray-600">
                  📧 manuelmayi581@gmail.com
                </p>
              </div>

              {/* Résultat du test */}
              {testResult && (
                <div className={`rounded-lg p-4 ${testResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="flex items-center">
                    {testResult.success ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                    )}
                    <p className={`text-sm ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
                      {testResult.message}
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-between space-x-3 pt-4 border-t">
                <button
                  onClick={handleTestEmail}
                  disabled={isTestingEmail}
                  className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {isTestingEmail ? 'Test en cours...' : 'Tester l\'email'}
                </button>

                <div className="flex space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSaveConfig}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}