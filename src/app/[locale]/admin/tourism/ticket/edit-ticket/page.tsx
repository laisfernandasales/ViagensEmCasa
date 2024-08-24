'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { getSession } from 'next-auth/react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

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

export default function EditTicketPage() {
  const t = useTranslations('edit-ticket-page');
  const [ticket, setTicket] = useState<Partial<MuseumTicket>>({});
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const ticketId = searchParams.get('id');
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
    const fetchTicket = async () => {
      if (!ticketId || !isAuthorized) return;
      try {
        const response = await fetch(`/api/admin/ticket/edit-ticket?id=${ticketId}`);
        if (!response.ok) throw new Error(t('Failed to fetch ticket'));
        const data = await response.json();
        setTicket(data.ticket);
      } catch (error) {
        setError(error instanceof Error ? error.message : t('Failed to fetch ticket'));
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [ticketId, isAuthorized, t]);

  const handleInputChange = (field: keyof MuseumTicket, value: string | number | boolean) => {
    setTicket({ ...ticket, [field]: value });
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setImageFiles(Array.from(files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ticketId || !ticket.name || !ticket.address || ticket.ticketPrice === undefined || ticket.totalTickets === undefined) {
      alert(t('Por favor, preencha todos os campos obrigatórios.'));
      return;
    }

    const formData = new FormData();
    formData.append('id', ticketId);
    formData.append('name', ticket.name);
    formData.append('address', ticket.address);
    formData.append('ticketPrice', ticket.ticketPrice.toString());
    formData.append('totalTickets', ticket.totalTickets.toString());

    ticket.images?.forEach((image) => {
      formData.append('existingImages', image);
    });

    imageFiles.forEach((file) => {
      formData.append('images', file);
    });

    try {
      const response = await fetch('/api/admin/ticket/edit-ticket', {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        alert(t('Bilhete atualizado com sucesso!'));
        router.push(`/${locale}/admin/tourism/ticket/all-ticket`);
      } else {
        alert(t('Falha ao atualizar o bilhete'));
      }
    } catch (error) {
      console.error(t('Erro ao enviar o formulário:'), error);
      alert(t('Erro ao atualizar o bilhete'));
    }
  };

  if (loading) return <div className="loading loading-spinner loading-lg"></div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  if (!ticket) return null;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-6">{t('Editar Bilhete')}</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="nome-museu" className="block text-sm font-medium mb-2">{t('Nome do Museu')}</label>
          <input
            id="nome-museu"
            type="text"
            value={ticket.name ?? ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="input input-bordered w-full"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="endereco" className="block text-sm font-medium mb-2">{t('Endereço')}</label>
          <input
            id="endereco"
            type="text"
            value={ticket.address ?? ''}
            onChange={(e) => handleInputChange('address', e.target.value)}
            className="input input-bordered w-full"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="preco-bilhete" className="block text-sm font-medium mb-2">{t('Preço do Bilhete')} (€)</label>
          <input
            id="preco-bilhete"
            type="number"
            value={ticket.ticketPrice ?? 0}
            onChange={(e) => handleInputChange('ticketPrice', Math.max(0, parseFloat(e.target.value)))}
            className="input input-bordered w-full"
            min="0"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="total-bilhetes" className="block text-sm font-medium mb-2">{t('Total de Bilhetes')}</label>
          <input
            id="total-bilhetes"
            type="number"
            value={ticket.totalTickets ?? 0}
            onChange={(e) => handleInputChange('totalTickets', Math.max(0, parseInt(e.target.value)))}
            className="input input-bordered w-full"
            min="0"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="imagens" className="block text-sm font-medium mb-2">{t('Imagens')}</label>
          <input
            id="imagens"
            type="file"
            multiple
            onChange={handleImageChange}
            className="file-input file-input-bordered w-full"
          />
        </div>

        <div className="mb-4">
          {imageFiles.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {imageFiles.map((file) => (
                <div key={file.name} className="border rounded-lg p-2">
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={`preview-${file.name}`}
                    className="w-full h-32 object-cover"
                    width={150}
                    height={128}
                    layout="responsive"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-4">
          <button type="submit" className="btn btn-primary">
            {t('Atualizar Bilhete')}
          </button>
        </div>
      </form>
    </div>
  );
}
