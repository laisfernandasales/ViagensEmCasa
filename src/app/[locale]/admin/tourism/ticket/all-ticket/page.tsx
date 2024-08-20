'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
    ticketPrice: 0,
    totalTickets: 0,
    images: [],
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const locale = pathname.split('/')[1];

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
    if (typeof value === 'number' && value < 0) {
      return;
    }
    setCurrentTicket({ ...currentTicket, [field]: value });
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setImageFiles((prevFiles) => [...prevFiles, ...Array.from(files)]);
    }
  };

  const handleRemoveExistingImage = (index: number) => {
    if (currentTicket.images) {
      const updatedImages = [...currentTicket.images];
      updatedImages.splice(index, 1);
      setCurrentTicket({ ...currentTicket, images: updatedImages });
    }
  };

  const handleRemoveNewImage = (index: number) => {
    const updatedImageFiles = [...imageFiles];
    updatedImageFiles.splice(index, 1);
    setImageFiles(updatedImageFiles);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('id', currentTicket.id || '');
    formData.append('name', currentTicket.name || '');
    formData.append('address', currentTicket.address || '');
    formData.append('ticketPrice', (currentTicket.ticketPrice || 0).toString());
    formData.append('totalTickets', (currentTicket.totalTickets || 0).toString());

    currentTicket.images?.forEach((image) => {
      formData.append('existingImages', image);
    });

    imageFiles.forEach((file) => {
      formData.append('images', file);
    });

    try {
      const response = await fetch('/api/admin/ticket', {
        method: currentTicket.id ? 'PUT' : 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Bilhete salvo com sucesso!');
        setCurrentTicket({ ticketPrice: 0, totalTickets: 0, images: [] });
        setImageFiles([]);
        setIsModalOpen(false);
        const data = await response.json();
        setTickets((prevTickets) =>
          currentTicket.id
            ? prevTickets.map((ticket) => (ticket.id === data.id ? data : ticket))
            : [...prevTickets, data]
        );
      } else {
        const errorData = await response.json();
        alert(`Erro ao salvar o bilhete: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Erro ao enviar o formulário:', error);
      alert('Erro ao salvar o bilhete');
    }
  };

  const handleEdit = (ticket: MuseumTicket) => {
    setCurrentTicket(ticket);
    setImageFiles([]); 
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (ticketId: string, enabled: boolean) => {
    const ticketToUpdate = tickets.find((ticket) => ticket.id === ticketId);

    if (!ticketToUpdate) return;

    const formData = new FormData();
    formData.append('id', ticketId);
    formData.append('enabled', enabled.toString());
    formData.append('name', ticketToUpdate.name);
    formData.append('address', ticketToUpdate.address);
    formData.append('ticketPrice', ticketToUpdate.ticketPrice.toString());
    formData.append('totalTickets', ticketToUpdate.totalTickets.toString());

    ticketToUpdate.images.forEach((image) => {
      formData.append('existingImages', image);
    });

    try {
      const response = await fetch('/api/admin/ticket', {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to update ticket status');

      setTickets((tickets) =>
        tickets.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, enabled } : ticket
        )
      );
    } catch (error) {
      console.error('Error updating ticket status:', error);
      alert('Erro ao atualizar status do bilhete');
    }
  };

  if (loading) return <div className="loading loading-spinner loading-lg"></div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return isAuthorized ? (
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
            <p className="text-lg font-bold">
              Preço: €{ticket.ticketPrice?.toFixed(2) || 0}
            </p>
            <p className="text-lg">
              Bilhetes Disponíveis:{' '}
              {ticket.totalTickets
                ? ticket.totalTickets - (ticket.ticketsSold || 0)
                : 0}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {ticket.images &&
                ticket.images.map((image, index) => (
                  <div key={index} className="border rounded-lg p-2">
                    <img
                      src={image}
                      alt={`Imagem ${index + 1}`}
                      className="w-full h-32 object-cover"
                    />
                  </div>
                ))}
            </div>
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

      {isModalOpen && currentTicket.id && (
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
                value={currentTicket.ticketPrice || 0}
                onChange={(e) =>
                  handleInputChange(
                    'ticketPrice',
                    Math.max(0, parseFloat(e.target.value))
                  )
                }
                className="input input-bordered w-full"
                min="0"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Total de Bilhetes</label>
              <input
                type="number"
                value={currentTicket.totalTickets || 0}
                onChange={(e) =>
                  handleInputChange(
                    'totalTickets',
                    Math.max(0, parseInt(e.target.value))
                  )
                }
                className="input input-bordered w-full"
                min="0"
              />
            </div>

            {currentTicket.images && currentTicket.images.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Imagens Atuais:</h3>
                <div className="grid grid-cols-3 gap-2">
                  {currentTicket.images.map((image, index) => (
                    <div key={index} className="relative border rounded-lg p-2">
                      <img
                        src={image}
                        alt={`Imagem atual ${index + 1}`}
                        className="w-full h-32 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded"
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Novas Imagens</label>
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
                    <div key={index} className="relative border rounded-lg p-2">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`preview-${index}`}
                        className="w-full h-32 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded"
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-action">
              <button onClick={handleSubmit} className="btn btn-primary">
                Salvar
              </button>
              <button
                onClick={() => {
                  setCurrentTicket({ ticketPrice: 0, totalTickets: 0, images: [] });
                  setIsModalOpen(false);
                }}
                className="btn"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  ) : null;
}
