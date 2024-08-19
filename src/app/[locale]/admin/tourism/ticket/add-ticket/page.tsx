'use client';

import React, { useState, useEffect } from 'react';

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
      const response = await fetch('/api/admin/ticket', {
        method: currentTicket.id ? 'PUT' : 'POST',
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



  if (loading) return <div className="loading loading-spinner loading-lg"></div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-6">Gerenciar Bilhetes de Museus</h1>

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

      <div className="mb-4">
        <button onClick={handleSubmit} className="btn btn-primary">
          {currentTicket.id ? 'Atualizar' : 'Adicionar'} Bilhete
        </button>
      </div>
    </div>
  );
}
