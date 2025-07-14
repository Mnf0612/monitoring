import React from 'react';
import { Ticket } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AlertTriangle, Clock, CheckCircle, User, ChevronRight } from 'lucide-react';

interface TicketListProps {
  tickets: Ticket[];
  onTicketClick: (ticket: Ticket) => void;
  highlightedTicketId?: string | null;
}

export function TicketList({ tickets, onTicketClick, highlightedTicketId }: TicketListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-red-600 bg-red-50 border-red-200';
      case 'in_progress': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'resolved': return 'text-green-600 bg-green-50 border-green-200';
      case 'closed': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertTriangle className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'Ouvert';
      case 'in_progress': return 'En cours';
      case 'resolved': return 'Résolu';
      case 'closed': return 'Fermé';
      default: return status;
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Haute';
      case 'medium': return 'Moyenne';
      case 'low': return 'Basse';
      default: return priority;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Liste des Tickets ({tickets.length})
        </h2>
      </div>

      <div className="divide-y divide-gray-200">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            onClick={() => onTicketClick(ticket)}
            className={`px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors ${
              highlightedTicketId === ticket.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-mono text-gray-600">#{ticket.id}</span>
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(ticket.status)}`}>
                    {getStatusIcon(ticket.status)}
                    <span className="ml-1">{getStatusText(ticket.status)}</span>
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${getPriorityColor(ticket.priority)}`}>
                    {getPriorityText(ticket.priority)}
                  </span>
                </div>

                <div className="mt-2">
                  <h3 className="text-sm font-medium text-gray-900">
                    {ticket.alarm.site} - {ticket.alarm.message}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Type: <span className="uppercase font-medium">{ticket.alarm.type}</span> • 
                    Sévérité: <span className="capitalize">{ticket.alarm.severity}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="w-4 h-4 mr-1" />
                    <span>{ticket.owner}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Créé le {format(new Date(ticket.createdAt), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                  </div>
                </div>

                {ticket.update && (
                  <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-800">
                    <strong>Dernière mise à jour:</strong> {ticket.update}
                  </div>
                )}
              </div>

              <ChevronRight className="w-5 h-5 text-gray-400 ml-4" />
            </div>
          </div>
        ))}
      </div>

      {tickets.length === 0 && (
        <div className="text-center py-12">
          <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun ticket</h3>
          <p className="mt-1 text-sm text-gray-500">
            Aucun ticket ne correspond aux filtres sélectionnés
          </p>
        </div>
      )}
    </div>
  );
}