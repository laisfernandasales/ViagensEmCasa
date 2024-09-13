'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import bilheteiraImage from '../../../../public/images/Bilheteira/bilheteira.png'; // Importe a imagem aqui

interface MuseumTicket {
  id: string;
  name: string;
  address: string;
  ticketPrice: number;
  totalTickets: number;
  ticketsSold: number;
  enabled: boolean;
  category: string;
  images: string[];
}

interface Category {
  id: string;
  name: string;
}

const Ticketplace = () => {
  const t = useTranslations('Ticketplace');
  const [tickets, setTickets] = useState<MuseumTicket[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(''); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<MuseumTicket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);  
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerNif, setCustomerNif] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cartão');
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const { data: session } = useSession();

  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 5;

  useEffect(() => {
    const fetchAvailableTickets = async () => {
      try {
        const response = await fetch('/api/admin/ticket/ticketplace');
        if (!response.ok) throw new Error(t('fetchError'));
        const data = await response.json();
        setTickets(data.tickets.filter((ticket: MuseumTicket) => ticket.enabled && ticket.totalTickets > 0));
      } catch (err) {
        setError(err instanceof Error ? err.message : t('fetchError'));
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableTickets();
  }, [t]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/categoriesTickets');
        if (!response.ok) throw new Error(t('fetchError'));
        const data = await response.json();
        setCategories(data.categories);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('fetchError'));
      }
    };

    fetchCategories();
  }, [t]);

  const openModal = (ticket: MuseumTicket) => {
    if (!session?.user) {
      setIsLoginModalOpen(true);
    } else {
      setSelectedTicket(ticket);
      setCustomerEmail(session?.user?.email ?? ''); 
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setSelectedTicket(null);
    setIsModalOpen(false);
    setCustomerName('');
    setCustomerEmail('');
    setCustomerNif('');
    setPaymentMethod('Cartão');
    setTicketQuantity(1);
  };

  const handlePurchase = async () => {
    if (!selectedTicket) return;

    if (!session?.user) {
      setIsLoginModalOpen(true); 
      return;
    }

    const formData = new FormData();
    formData.append('customerName', customerName);
    formData.append('customerEmail', customerEmail);
    formData.append('customerNif', customerNif);
    formData.append('paymentMethod', paymentMethod);
    formData.append('ticketQuantity', ticketQuantity.toString());
    formData.append('totalPrice', (selectedTicket.ticketPrice * ticketQuantity).toString());
    formData.append('ticketId', selectedTicket.id);
    formData.append('ticketName', selectedTicket.name);

    if (session?.user?.id) {
      formData.append('userId', session.user.id);
    }

    try {
      const response = await fetch('/api/admin/ticket/ticketplace', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`${t('purchaseError')}: ${errorData.error}`);
        return;
      }

      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error(t('purchaseError'), error);
      alert(t('purchaseError'));
    } finally {
      closeModal();
    }
  };

  const updateQuantity = (change: number) => {
    setTicketQuantity((prev) => Math.max(1, prev + change));
  };

  const handleSuccessModalClose = () => {
    setIsSuccessModalOpen(false);
  };

  const handleLoginModalClose = () => {
    setIsLoginModalOpen(false);
  };

  const totalPages = Math.ceil(tickets.length / ticketsPerPage);
  const currentTickets = tickets
    .filter((ticket) => selectedCategory === '' || ticket.category === selectedCategory)
    .slice((currentPage - 1) * ticketsPerPage, currentPage * ticketsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><span className="loading loading-spinner loading-lg"></span></div>;
  }

  if (error) {
    return <div className="alert alert-error"><span>{error}</span></div>;
  }

  return (
    <div  className="min-h-screen flex flex-col">
      
      <div className="relative w-full h-80 mb-8"> 
        <Image
          src={bilheteiraImage}
          alt="Bilheteira Banner"
          layout="fill"
          objectFit="cover"
          className="w-full h-full rounded-lg shadow-lg"
        />
      </div>

      <h1 className="text-4xl font-extrabold text-primary mb-6 text-center">{t('ticketsForSale')}</h1>

      
      <div className="w-full md:w-1/2 mx-auto mb-6">
        <label htmlFor="categoryFilter" className="block text-lg font-semibold mb-2">{t('filterByCategory')}</label>
        <select
          id="categoryFilter"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="select select-bordered w-full text-lg"
        >
          <option value="">{t('allCategories')}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

     
      <div className="flex flex-col items-center gap-6">
        {currentTickets.map((ticket) => (
          <div key={ticket.id} className="card card-side bg-base-100 shadow-xl w-full max-w-4xl">
            <figure>
              <Image
                src={ticket.images && ticket.images.length > 0 ? ticket.images[0] : '/default-ticket-image.jpg'}
                alt={`Ticket image for ${ticket.name}`}
                width={200}
                height={200}
                className="object-cover"
              />
            </figure>
            <div className="card-body">
              <h2 className="card-title">{ticket.name}</h2>
              <p>{ticket.address}</p>
              <p className="text-lg font-semibold text-gray-800 mt-2">
                {t('price')}: <span className="text-primary">€{(ticket.ticketPrice ?? 0).toFixed(2)}</span>
              </p>
              <div className="card-actions justify-end">
                <button className="btn btn-primary" onClick={() => openModal(ticket)}>
                  {t('buy')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      
      <div className="flex justify-center mt-8">
        <div className="join">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              className={`join-item btn ${currentPage === index + 1 ? 'btn-active' : ''}`}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

     
      {isModalOpen && selectedTicket && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h2 className="text-2xl font-semibold mb-4">{t('buyTickets')}</h2>
            <p className="text-lg mb-2">{t('buyingTicketsFor')} <span className="font-bold">{selectedTicket.name}</span></p>
            
            <div className="mb-4">
              <label htmlFor="customerName" className="block text-sm font-medium mb-2">{t('customerName')}</label>
              <input
                id="customerName"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="input input-bordered w-full"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="customerEmail" className="block text-sm font-medium mb-2">{t('email')}</label>
              <input
                id="customerEmail"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="input input-bordered w-full"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="customerNif" className="block text-sm font-medium mb-2">{t('nif')}</label>
              <input
                id="customerNif"
                type="text"
                value={customerNif}
                onChange={(e) => setCustomerNif(e.target.value)}
                className="input input-bordered w-full"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="paymentMethod" className="block text-sm font-medium mb-2">{t('paymentMethod')}</label>
              <select
                id="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="select select-bordered w-full"
                required
              >
                <option value="Cartão">{t('card')}</option>
                <option value="MBWay">{t('mbway')}</option>
                <option value="PayPal">{t('paypal')}</option>
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="ticketQuantity" className="block text-sm font-medium mb-2">{t('quantity')}</label>
              <div className="flex items-center space-x-2">
                <button
                  className="btn btn-circle btn-sm bg-transparent border border-base-content text-base-content hover:bg-base-200"
                  onClick={() => updateQuantity(-1)}
                  disabled={ticketQuantity <= 1}
                >
                  <span className="icon-[solar--minus-circle-broken] text-xl"></span>
                </button>
                <span className="text-base-content">{ticketQuantity}</span>
                <button
                  className="btn btn-circle btn-sm bg-transparent border border-base-content text-base-content hover:bg-base-200"
                  onClick={() => updateQuantity(1)}
                >
                  <span className="icon-[solar--add-circle-broken] text-xl"></span>
                </button>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-lg font-semibold">{t('totalPrice')}: <span className="text-primary">€{(selectedTicket.ticketPrice * ticketQuantity).toFixed(2)}</span></p>
            </div>

            <div className="modal-action">
              <button onClick={handlePurchase} className="btn btn-primary">{t('confirmPurchase')}</button>
              <button onClick={closeModal} className="btn">{t('cancel')}</button>
            </div>
          </div>
        </div>
      )}

  
      {isSuccessModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h2 className="text-2xl font-semibold mb-4">{t('purchaseConfirmed')}</h2>
            <p>{t('thankYouForPurchase')}</p>
            <div className="modal-action">
              <button onClick={handleSuccessModalClose} className="btn btn-primary">{t('close')}</button>
            </div>
          </div>
        </div>
      )}

     
      {isLoginModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h2 className="text-2xl font-semibold mb-4">{t('loginRequiredTitle')}</h2>
            <p>{t('loginRequiredMessage')}</p>
            <div className="modal-action">
              <button onClick={handleLoginModalClose} className="btn btn-primary">OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ticketplace;
