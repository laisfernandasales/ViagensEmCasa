'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from 'next-auth/react';

interface MuseumTicket {
  id: string;
  name: string;
  address: string;
  ticketPrice: number;
  totalTickets: number;
  ticketsSold: number;
  enabled: boolean;
  images: string[]; 
}

export default function ManageMuseumTickets() {
  const [tickets, setTickets] = useState<MuseumTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTicket, setCurrentTicket] = useState<Partial<MuseumTicket>>({
    images: [], 
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const session = await getSession();
      if (!session || session.user?.role !== 'admin') {
        router.push('/'); 
      } else {
        setIsAuthorized(true);
      }
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (isAuthorized) {
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
    }
  }, [isAuthorized]);

  const handleInputChange = (field: keyof MuseumTicket, value: string | number | boolean) => {
    setCurrentTicket({ ...currentTicket, [field]: value });
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setImageFiles(Array.from(files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', currentTicket.name || '');
    formData.append('address', currentTicket.address || '');
    formData.append('ticketPrice', currentTicket.ticketPrice?.toString() || '0');
    formData.append('totalTickets', currentTicket.totalTickets?.toString() || '0');

    imageFiles.forEach((file) => {
      formData.append('images', file);
    });

    const response = await fetch('/api/admin/ticket', {
      method: currentTicket.id ? 'PUT' : 'POST',
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      if (currentTicket.id) {
        setTickets(tickets.map(ticket => (ticket.id === data.id ? data : ticket)));
      } else {
        setTickets([...tickets, data]);
      }

      setCurrentTicket({
        images: [], 
      });
      setImageFiles([]);
      alert('Bilhete salvo com sucesso!');
    } else {
      alert('Falha ao salvar o bilhete');
    }
  };

  const handleEdit = (ticket: MuseumTicket) => {
    setCurrentTicket(ticket);
  };

  if (loading) return <div className="loading loading-spinner loading-lg"></div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return isAuthorized ? (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-6">Gerenciar Bilhetes de Museus</h1>

      <form onSubmit={handleSubmit}>
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
            value={Math.max(0, currentTicket.ticketPrice || 0)}
            onChange={(e) => handleInputChange('ticketPrice', Math.max(0, parseFloat(e.target.value)))}
            className="input input-bordered w-full"
            min="0"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Total de Bilhetes</label>
          <input
            type="number"
            value={Math.max(0, currentTicket.totalTickets || 0)}
            onChange={(e) => handleInputChange('totalTickets', Math.max(0, parseInt(e.target.value)))}
            className="input input-bordered w-full"
            min="0"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Imagens</label>
          <input
            type="file"
            multiple
            onChange={handleImageChange}
            className="file-input file-input-bordered w-full"
          />
        </div>

        <div className="mb-4">
          {imageFiles.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {imageFiles.map((file, index) => (
                <div key={index} className="border rounded-lg p-2">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`preview-${index}`}
                    className="w-full h-32 object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-4">
          <button type="submit" className="btn btn-primary">
            {currentTicket.id ? 'Atualizar' : 'Adicionar'} Bilhete
          </button>
        </div>
      </form>
    </div>
  ) : null;
}