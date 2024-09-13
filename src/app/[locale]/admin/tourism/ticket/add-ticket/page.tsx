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
  category?: string; // New category field
}

interface Category {
  id: string;
  name: string;
}

export default function AddTicketsPage() {
  const t = useTranslations('AddTicketsPage');
  const [tickets, setTickets] = useState<MuseumTicket[]>([]);
  const [categories, setCategories] = useState<Category[]>([]); // To hold fetched categories
  const [currentTicket, setCurrentTicket] = useState<Partial<MuseumTicket>>({
    images: [],
  });
  const [selectedCategory, setSelectedCategory] = useState<string>(''); // Selected category
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);  
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);  
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);  

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const ticketId = searchParams.get('id');

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
    if (isAuthorized && ticketId) {
      const fetchTicket = async () => {
        try {
          const response = await fetch(`/api/admin/ticket/add-ticket?id=${ticketId}`);
          if (!response.ok) throw new Error(t('fetchError'));
          const data = await response.json();
          setCurrentTicket(data.ticket);
          setSelectedCategory(data.ticket.category); // Pre-select category if editing
        } catch (error) {
          setError(error instanceof Error ? error.message : t('fetchError'));
        } finally {
          setLoading(false);
        }
      };

      fetchTicket();
    } else {
      setLoading(false);
    }
  }, [isAuthorized, ticketId, t]);

  // Fetch categories from the API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/categoriesTickets');
        if (!response.ok) throw new Error(t('fetchCategoriesError'));
        const data = await response.json();
        setCategories(data.categories);
      } catch (error) {
        setError(error instanceof Error ? error.message : t('fetchCategoriesError'));
      }
    };
    fetchCategories();
  }, [t]);

  const handleInputChange = (field: keyof MuseumTicket, value: string | number | boolean) => {
    setCurrentTicket({ ...currentTicket, [field]: value });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setImageFiles(Array.from(files));
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageFiles((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setIsModalOpen(false);

    if (!currentTicket.name || !currentTicket.address || currentTicket.ticketPrice === undefined || currentTicket.totalTickets === undefined) {
      alert(t('fillRequiredFields'));
      return;
    }

    const formData = new FormData();
    formData.append('name', currentTicket.name);
    formData.append('address', currentTicket.address);
    formData.append('ticketPrice', currentTicket.ticketPrice.toString());
    formData.append('totalTickets', currentTicket.totalTickets.toString());
    formData.append('category', selectedCategory); // Append selected category

    if (currentTicket.id) {
      formData.append('id', currentTicket.id);
      currentTicket.images?.forEach(image => formData.append('existingImages', image));
    }

    imageFiles.forEach((file) => {
      formData.append('images', file);
    });

    try {
      const response = await fetch('/api/admin/ticket/add-ticket', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (currentTicket.id) {
          setTickets(tickets.map(ticket => (ticket.id === data.id ? data : ticket)));
        } else {
          setTickets([...tickets, data]);
        }
        setCurrentTicket({ images: [] });
        setImageFiles([]);
        setShowSuccessAlert(true); 
        setIsSuccessModalOpen(true); 
        setTimeout(() => {
          setShowSuccessAlert(false);
          setIsSuccessModalOpen(false);
        }, 9000); 
      } else {
        alert(t('saveFailed'));
      }
    } catch (error) {
      console.error(t('formSubmissionError'), error);
      alert(t('saveError'));
    }
  };

  if (loading) return <div className="loading loading-spinner loading-lg"></div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return isAuthorized ? (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-6">{currentTicket.id ? t('editTicket') : t('addTicket')}</h1>

      {showSuccessAlert && (
        <div className="alert alert-success">
          <span>{t('saveSuccess')}</span>
        </div>
      )}

      <form onSubmit={handleFormSubmit}>
        <div className="mb-4">
          <label htmlFor="museum-name" className="block text-sm font-medium mb-2">{t('museumName')}</label>
          <input
            id="museum-name"
            type="text"
            value={currentTicket.name ?? ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="input input-bordered w-full"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="category" className="block text-sm font-medium mb-2">{t('selectCategory')}</label>
          <select
            id="category"
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="select select-bordered w-full"
          >
            <option value="">{t('chooseCategory')}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="address" className="block text-sm font-medium mb-2">{t('address')}</label>
          <input
            id="address"
            type="text"
            value={currentTicket.address ?? ''}
            onChange={(e) => handleInputChange('address', e.target.value)}
            className="input input-bordered w-full"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="ticket-price" className="block text-sm font-medium mb-2">{t('ticketPrice')} (€)</label>
          <input
            id="ticket-price"
            type="number"
            value={currentTicket.ticketPrice ?? 0}
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
            value={currentTicket.totalTickets ?? 0}
            onChange={(e) => handleInputChange('totalTickets', Math.max(0, parseInt(e.target.value)))}
            className="input input-bordered w-full"
            min="0"
          />
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
            <div className="grid grid-cols-3 gap-4">
              {imageFiles.map((file, index) => (
                <div key={file.name} className="relative w-full h-32 overflow-hidden rounded-lg shadow-sm border border-base-300">
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={`preview-${file.name}`}
                    className="object-contain w-full h-full rounded-lg"
                    layout="fill"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 text-red-500 bg-white rounded-full p-1 shadow-md"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-4">
          <button type="submit" className="btn btn-primary">
            {currentTicket.id ? t('updateTicket') : t('addTicket')}
          </button>
        </div>
      </form>

      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h2 className="text-xl font-bold mb-4">{t('confirmTitle')}</h2>
            <p>{t('confirmMessage')}</p>
            <div className="modal-action">
              <button onClick={handleConfirmSubmit} className="btn btn-primary">
                {t('confirm')}
              </button>
              <button onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {isSuccessModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h2 className="text-xl font-bold mb-4">{t('successTitle')}</h2>
            <p>{t('successMessage')}</p>
            <div className="modal-action">
              <button onClick={() => setIsSuccessModalOpen(false)} className="btn btn-primary">
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  ) : null;
}
