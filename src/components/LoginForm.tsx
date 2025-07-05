import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, Shield, AlertCircle, Mail, Clock, RefreshCw } from 'lucide-react';
import { authService } from '../services/authService';

interface LoginFormProps {
  onLogin: () => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [step, setStep] = useState<'login' | 'verification'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingVerification, setPendingVerification] = useState<{ email: string; expiresAt: number } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await authService.login(username, password);
      
      if (result.success && result.requiresVerification) {
        const verification = authService.getPendingVerification();
        setPendingVerification(verification);
        setStep('verification');
      } else if (result.success) {
        onLogin();
      } else {
        setError(result.error || 'Erreur de connexion');
      }
    } catch (error) {
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await authService.verifyCode(verificationCode);
      
      if (result.success) {
        onLogin();
      } else {
        setError(result.error || 'Code de vérification incorrect');
      }
    } catch (error) {
      setError('Erreur de vérification. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      const result = await authService.resendVerificationCode();
      if (result.success) {
        const verification = authService.getPendingVerification();
        setPendingVerification(verification);
        setError('');
      } else {
        setError(result.error || 'Erreur lors du renvoi du code');
      }
    } catch (error) {
      setError('Erreur lors du renvoi du code');
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeRemaining = () => {
    if (!pendingVerification) return '';
    const remaining = Math.max(0, pendingVerification.expiresAt - Date.now());
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-600 flex items-center justify-center px-4 relative overflow-hidden">
      {/* MTN Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-white rounded-full"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-white rounded-full"></div>
        <div className="absolute bottom-40 right-10 w-28 h-28 bg-white rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white rounded-full opacity-5"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Shield className="h-10 w-10 text-yellow-600" />
          </div>
          <div className="mb-4">
            <h1 className="text-4xl font-bold text-white mb-2">MTN Cameroon</h1>
            <h2 className="text-2xl font-semibold text-yellow-100">BTS Monitor</h2>
          </div>
          <p className="mt-2 text-yellow-100">Système de surveillance des sites BTS</p>
          <p className="mt-4 text-sm text-yellow-200">
            Surveillance en temps réel • 50 sites • 10 régions du Cameroun
          </p>
        </div>

        {/* Login/Verification Form */}
        <div className="bg-white rounded-lg shadow-2xl p-8">
          {step === 'login' ? (
            <>
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Connexion Sécurisée</h3>
                <p className="text-sm text-gray-600 mt-1">Accédez au tableau de bord de monitoring</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-red-700 text-sm">{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom d'utilisateur
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="Entrez votre nom d'utilisateur"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="Entrez votre mot de passe"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-yellow-600 text-white py-3 px-4 rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Connexion...' : 'Se connecter'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <Mail className="mx-auto h-12 w-12 text-yellow-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900">Vérification par Email</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Un code de vérification a été envoyé à
                </p>
                <p className="text-sm font-medium text-yellow-600 mt-1">
                  {pendingVerification?.email}
                </p>
              </div>

              <form onSubmit={handleVerification} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-red-700 text-sm">{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code de vérification
                  </label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-center text-lg font-mono tracking-widest"
                    placeholder="XXXXXX"
                    maxLength={6}
                    required
                  />
                </div>

                {pendingVerification && (
                  <div className="text-center">
                    <div className="flex items-center justify-center text-sm text-gray-500 mb-3">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Expire dans: {getTimeRemaining()}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={isLoading}
                      className="text-yellow-600 hover:text-yellow-700 text-sm font-medium flex items-center mx-auto disabled:opacity-50"
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Renvoyer le code
                    </button>
                  </div>
                )}

                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={isLoading || verificationCode.length !== 6}
                    className="w-full bg-yellow-600 text-white py-3 px-4 rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? 'Vérification...' : 'Vérifier le code'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setStep('login');
                      setError('');
                      setVerificationCode('');
                    }}
                    className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                  >
                    Retour à la connexion
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center text-sm text-gray-600">
              <Shield className="h-4 w-4 mr-2 text-gray-500" />
              <span>Connexion sécurisée avec authentification double facteur</span>
            </div>
          </div>
        </div>

        {/* MTN System Info */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <h3 className="text-white font-medium mb-3">MTN Cameroon BTS Monitor</h3>
          <div className="space-y-2 text-sm text-yellow-100">
            <div className="flex justify-between">
              <span>Sites surveillés :</span>
              <span className="font-medium">50 sites BTS</span>
            </div>
            <div className="flex justify-between">
              <span>Couverture :</span>
              <span className="font-medium">10 régions</span>
            </div>
            <div className="flex justify-between">
              <span>Monitoring :</span>
              <span className="font-medium text-green-300">24/7 en temps réel</span>
            </div>
            <div className="flex justify-between">
              <span>Notifications :</span>
              <span className="font-medium text-green-300">Email + SMS automatiques</span>
            </div>
            <div className="flex justify-between">
              <span>Sécurité :</span>
              <span className="font-medium text-green-300">Double authentification</span>
            </div>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <h4 className="text-white font-medium mb-2 text-sm">Comptes de démonstration :</h4>
          <div className="space-y-1 text-xs text-yellow-100">
            <div>👑 <strong>admin</strong> / admin123 (Administrateur)</div>
            <div>👨‍💼 <strong>operator1</strong> / operator123 (Opérateur IP)</div>
            <div>🔧 <strong>tech1</strong> / tech123 (Technicien Power)</div>
            <div>📡 <strong>tech2</strong> / tech123 (Technicien Transmission)</div>
            <div>💻 <strong>tech3</strong> / tech123 (Technicien BSS)</div>
          </div>
        </div>
      </div>
    </div>
  );
}