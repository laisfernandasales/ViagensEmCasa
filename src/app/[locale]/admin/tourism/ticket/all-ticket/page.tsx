'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface MuseumTicket {
  id: string;
  name: string;
  address: string;
  ticketPrice: number;
  totalTickets: number;
  ticketsSold: number;
  enabled: boolean;
}

export default function ManageMuseumTickets() {
  const [tickets, setTickets] = useState<MuseumTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTicket, setCurrentTicket] = useState<Partial<MuseumTicket>>({});
  const router = useRouter();
  const pathname = usePathname();

  const locale = pathname.split('/')[1];

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch('/api/admin/ticket');
        if (!response.ok) throw new Error('Failed to fetch museum tickets');
        const data = await response.json();
        setTickets(data.tickets);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch museum tickets');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const handleInputChange = (field: keyof MuseumTicket, value: string | number | boolean) => {
    setCurrentTicket({ ...currentTicket, [field]: value });
  };

  const handleSubmit = async () => {
    try {
      const method = currentTicket.id ? 'PUT' : 'POST';
      const apiUrl = currentTicket.id ? `/api/admin/ticket` : '/api/admin/ticket';

      const response = await fetch(apiUrl, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentTicket),
      });

      if (!response.ok) throw new Error('Failed to save museum ticket');

      const data = await response.json();
      if (currentTicket.id) {
        setTickets(tickets.map(ticket => (ticket.id === data.id ? data : ticket)));
      } else {
        setTickets([...tickets, data]);
      }

      setCurrentTicket({});
      alert('Bilhete salvo com sucesso!');
    } catch (error) {
      console.error('Error saving museum ticket:', error);
      alert('Erro ao salvar o bilhete');
    }
  };

  const handleEdit = (ticket: MuseumTicket) => {
    setCurrentTicket(ticket);
  };

  const handleUpdateStatus = async (ticketId: string, enabled: boolean) => {
    try {
      const response = await fetch('/api/admin/ticket', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ticketId, enabled }),
      });

      if (!response.ok) throw new Error('Failed to update ticket status');

      setTickets(tickets.map(ticket => (ticket.id === ticketId ? { ...ticket, enabled } : ticket)));
    } catch (error) {
      console.error('Error updating ticket status:', error);
      alert('Erro ao atualizar status do bilhete');
    }
  };

  if (loading) return <div className="loading loading-spinner loading-lg"></div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-6">Gerenciar Bilhetes de Museus</h1>

      <button 
        onClick={() => router.push(`/${locale}/admin/tourism/ticket/add-ticket`)}
        className="btn btn-primary mb-6"
      >
        Adicionar Novo Bilhete
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="card bg-base-100 shadow-xl p-4">
            <h2 className="text-2xl font-semibold mb-2">{ticket.name}</h2>
            <p className="text-sm mb-4">{ticket.address}</p>
            <p className="text-lg font-bold">Preço: €{ticket.ticketPrice?.toFixed(2) || 0}</p>
            <p className="text-lg">Bilhetes Disponíveis: {ticket.totalTickets - ticket.ticketsSold || 0}</p>
            <button
              onClick={() => handleEdit(ticket)}
              className="btn btn-secondary mb-2"
            >
              Editar
            </button>
            <button
              onClick={() => handleUpdateStatus(ticket.id, !ticket.enabled)}
              className={`btn ${ticket.enabled ? 'btn-error' : 'btn-success'}`}
            >
              {ticket.enabled ? 'Desabilitar' : 'Habilitar'}
            </button>
          </div>
        ))}
      </div>
      
      {currentTicket.id && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h2 className="text-2xl font-semibold mb-4">Editar Bilhete</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Nome do Museu</label>
              <input
                type="text"
                value={currentTicket.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="input input-bordered w-full"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Endereço</label>
              <input
                type="text"
                value={currentTicket.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="input input-bordered w-full"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Preço do Bilhete (€)</label>
              <input
                type="number"
                value={currentTicket.ticketPrice || ''}
                onChange={(e) => handleInputChange('ticketPrice', parseFloat(e.target.value))}
                className="input input-bordered w-full"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Total de Bilhetes</label>
              <input
                type="number"
                value={currentTicket.totalTickets || ''}
                onChange={(e) => handleInputChange('totalTickets', parseInt(e.target.value))}
                className="input input-bordered w-full"
              />
            </div>

            <div className="modal-action">
              <button
                onClick={handleSubmit}
                className="btn btn-primary"
              >
                Salvar
              </button>
              <button
                onClick={() => setCurrentTicket({})}
                className="btn"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
