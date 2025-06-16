import React, { useState } from 'react';
import { Ticket } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { X, AlertTriangle, User, Clock, Save } from 'lucide-react';

interface TicketModalProps {
  ticket: Ticket;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (ticketId: string, update: string, status?: string) => void;
}

export function TicketModal({ ticket, isOpen, onClose, onUpdate }: TicketModalProps) {
  const [update, setUpdate] = useState('');
  const [status, setStatus] = useState(ticket.status);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!update.trim()) return;

    setIsSubmitting(true);
    await onUpdate(ticket.id, update, status !== ticket.status ? status : undefined);
    setUpdate('');
    setIsSubmitting(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-red-600 bg-red-50';
      case 'in_progress': return 'text-yellow-600 bg-yellow-50';
      case 'resolved': return 'text-green-600 bg-green-50';
      case 'closed': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'major': return 'text-orange-600 bg-orange-50';
      case 'minor': return 'text-yellow-600 bg-yellow-50';
      case 'warning': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Ticket #{ticket.id}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-6 py-4">
            <div className="space-y-6">
              {/* Alarm Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Informations de l'alarme
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Site:</span>
                    <span className="ml-2 font-medium">{ticket.alarm.site}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Type:</span>
                    <span className="ml-2 font-medium uppercase">{ticket.alarm.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Sévérité:</span>
                    <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded ${getSeverityColor(ticket.alarm.severity)}`}>
                      {ticket.alarm.severity}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Région:</span>
                    <span className="ml-2 font-medium">{ticket.alarm.region}</span>
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-gray-600">Message:</span>
                  <p className="mt-1 text-gray-900">{ticket.alarm.message}</p>
                </div>
              </div>

              {/* Ticket Information */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Informations du ticket
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Propriétaire:</span>
                    <span className="ml-2 font-medium">{ticket.owner}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Priorité:</span>
                    <span className="ml-2 font-medium capitalize">{ticket.priority}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Statut actuel:</span>
                    <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Créé le:</span>
                    <span className="ml-2">{format(new Date(ticket.createdAt), 'dd/MM/yyyy à HH:mm', { locale: fr })}</span>
                  </div>
                </div>
              </div>

              {/* Previous Updates */}
              {ticket.update && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Mises à jour précédentes
                  </h3>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm text-blue-800">{ticket.update}</p>
                    <p className="text-xs text-blue-600 mt-2">
                      Mis à jour le {format(new Date(ticket.updatedAt), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                    </p>
                  </div>
                </div>
              )}

              {/* Update Form */}
              <form onSubmit={handleSubmit}>
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Nouvelle mise à jour
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Statut
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="open">Ouvert</option>
                      <option value="in_progress">En cours</option>
                      <option value="resolved">Résolu</option>
                      <option value="closed">Fermé</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Commentaire / Résolution
                    </label>
                    <textarea
                      value={update}
                      onChange={(e) => setUpdate(e.target.value)}
                      rows={4}
                      placeholder="Décrivez les actions entreprises, la cause identifiée et la résolution..."
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={!update.trim() || isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}