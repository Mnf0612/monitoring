import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, Shield, AlertCircle } from 'lucide-react';
import { authService } from '../services/authService';

interface LoginFormProps {
  onLogin: () => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await authService.login(username, password);
      
      if (result.success) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-white rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-white">BTS Monitor</h2>
          <p className="mt-2 text-blue-200">Système de surveillance des sites BTS</p>
          <p className="mt-4 text-sm text-blue-300">
            Surveillance en temps réel • 50 sites • 10 régions du Cameroun
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Connexion Sécurisée</h3>
            <p className="text-sm text-gray-600 mt-1">Accédez au tableau de bord de monitoring</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center text-sm text-gray-600">
              <Shield className="h-4 w-4 mr-2 text-gray-500" />
              <span>Connexion sécurisée avec authentification multi-niveaux</span>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <h3 className="text-white font-medium mb-3">Système BTS Monitor</h3>
          <div className="space-y-2 text-sm text-blue-200">
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
          </div>
        </div>
      </div>
    </div>
  );
}