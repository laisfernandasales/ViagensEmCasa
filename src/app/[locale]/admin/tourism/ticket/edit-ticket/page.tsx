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
  category: string; 
}

interface Category {
  id: string;
  name: string;
}

export default function EditTicketPage() {
  const t = useTranslations('EditTicketPage');
  const [ticket, setTicket] = useState<Partial<MuseumTicket>>({});
  const [categories, setCategories] = useState<Category[]>([]); // Para armazenar as categorias
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
        if (!response.ok) throw new Error(t('fetchError'));
        const data = await response.json();
        setTicket(data.ticket);
      } catch (error) {
        setError(error instanceof Error ? error.message : t('fetchError'));
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [ticketId, isAuthorized, t]);

  // Função para buscar as categorias da coleção 'categoriesTickets'
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/categoriesTickets');
        if (!response.ok) throw new Error(t('fetchError'));
        const data = await response.json();
        setCategories(data.categories);
      } catch (error) {
        console.error(t('fetchError'), error);
      }
    };

    fetchCategories();
  }, [t]);

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
      alert(t('fillAllFields'));
      return;
    }

    const formData = new FormData();
    formData.append('id', ticketId);
    if (ticket.name) formData.append('name', ticket.name);
    if (ticket.address) formData.append('address', ticket.address);
    formData.append('ticketPrice', ticket.ticketPrice.toString());
    formData.append('totalTickets', ticket.totalTickets.toString());
    if (ticket.category) formData.append('category', ticket.category); // Adicionar a categoria

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
        alert(t('ticketUpdateSuccess'));
        router.push(`/${locale}/admin/tourism/ticket/all-ticket`);
      } else {
        alert(t('ticketUpdateFailure'));
      }
    } catch (error) {
      console.error(t('formSubmissionError'), error);
      alert(t('ticketUpdateError'));
    }
  };

  if (loading) return <div className="loading loading-spinner loading-lg"></div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div className="min-h-screen flex flex-col p-6"> {/* Adicionei espaçamento ao redor */}
      <h1 className="text-4xl font-bold mb-6">{t('editTicket')}</h1>
      <form onSubmit={handleSubmit} className="space-y-6 w-3/4 max-w-xl"> {/* Adicionei espaçamento vertical */}
        <div className="mb-4">
          <label htmlFor="museum-name" className="block text-sm font-medium mb-2">{t('museumName')}</label>
          <input
            id="museum-name"
            type="text"
            value={ticket.name ?? ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="input input-bordered w-full"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="address" className="block text-sm font-medium mb-2">{t('address')}</label>
          <input
            id="address"
            type="text"
            value={ticket.address ?? ''}
            onChange={(e) => handleInputChange('address', e.target.value)}
            className="input input-bordered w-full"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="ticket-price" className="block text-sm font-medium mb-2">{t('ticketPrice')} (€)</label>
          <input
            id="ticket-price"
            type="number"
            value={ticket.ticketPrice ?? 0}
            onChange={(e) => handleInputChange('ticketPrice', Math.max(0, parseFloat(e.target.value)))}
            className="input input-bordered w-full"
            min="0"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="total-tickets" className="block text-sm font-medium mb-2">{t('totalTickets')}</label>
          <input
            id="total-tickets"
            type="number"
            value={ticket.totalTickets ?? 0}
            onChange={(e) => handleInputChange('totalTickets', Math.max(0, parseInt(e.target.value)))}
            className="input input-bordered w-full"
            min="0"
          />
        </div>

        {/* Dropdown de categorias da coleção categoriesTickets */}
        <div className="mb-4">
          <label htmlFor="category" className="block text-sm font-medium mb-2">{t('category')}</label>
          <select
            id="category"
            value={ticket.category ?? ''}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="select select-bordered w-full"
          >
            <option value="">{t('selectCategory')}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="images" className="block text-sm font-medium mb-2">{t('images')}</label>
          <input
            id="images"
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
            {t('updateTicket')}
          </button>
        </div>
      </form>
    </div>
  );
}
