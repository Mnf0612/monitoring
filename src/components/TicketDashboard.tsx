import React, { useState, useEffect } from 'react';
import { TicketList } from './TicketList';
import { TicketStats } from './TicketStats';
import { TicketFilters } from './TicketFilters';
import { TicketModal } from './TicketModal';
import { ticketService } from '../services/ticketService';
import { Ticket } from '../types';
import { Ticket as TicketIcon, Users, Clock, CheckSquare } from 'lucide-react';

export function TicketDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const allTickets = ticketService.getTickets();
    setTickets(allTickets);
    setFilteredTickets(allTickets);
  }, []);

  useEffect(() => {
    let filtered = tickets;

    if (selectedTeam !== 'all') {
      filtered = filtered.filter(ticket => ticket.team === selectedTeam);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === selectedStatus);
    }

    if (selectedPriority !== 'all') {
      filtered = filtered.filter(ticket => ticket.priority === selectedPriority);
    }

    setFilteredTickets(filtered);
  }, [tickets, selectedTeam, selectedStatus, selectedPriority]);

  const stats = ticketService.getTicketStats();

  const statCards = [
    {
      title: 'Tickets Totaux',
      value: stats.total,
      icon: TicketIcon,
      color: 'bg-blue-500'
    },
    {
      title: 'Tickets Ouverts',
      value: stats.open,
      icon: Clock,
      color: 'bg-orange-500'
    },
    {
      title: 'En Cours',
      value: stats.inProgress,
      icon: Users,
      color: 'bg-yellow-500'
    },
    {
      title: 'Résolus',
      value: stats.resolved,
      icon: CheckSquare,
      color: 'bg-green-500'
    }
  ];

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const handleTicketUpdate = async (ticketId: string, update: string, status?: string) => {
    await ticketService.updateTicket(ticketId, update, status);
    const updatedTickets = ticketService.getTickets();
    setTickets(updatedTickets);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard de Gestion des Tickets
            </h1>
            <p className="mt-2 text-gray-600">
              Suivi et résolution des tickets d'alarmes
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TicketStats cards={statCards} />

        <div className="mt-8">
          <TicketFilters
            selectedTeam={selectedTeam}
            selectedStatus={selectedStatus}
            selectedPriority={selectedPriority}
            onTeamChange={setSelectedTeam}
            onStatusChange={setSelectedStatus}
            onPriorityChange={setSelectedPriority}
            teams={ticketService.getTeams()}
          />
        </div>

        <div className="mt-8">
          <TicketList
            tickets={filteredTickets}
            onTicketClick={handleTicketClick}
          />
        </div>
      </div>

      {selectedTicket && (
        <TicketModal
          ticket={selectedTicket}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onUpdate={handleTicketUpdate}
        />
      )}
    </div>
  );
}