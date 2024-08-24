'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
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

const Ticketplace = () => {
  const t = useTranslations('Ticketplace'); // Hook para tradução
  const [tickets, setTickets] = useState<MuseumTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<MuseumTicket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerNif, setCustomerNif] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cartão');
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const { data: session } = useSession();

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

  const openModal = (ticket: MuseumTicket) => {
    setSelectedTicket(ticket);
    setCustomerEmail(session?.user?.email ?? ''); 
    setIsModalOpen(true);
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

    const formData = new FormData();
    formData.append('customerName', customerName);
    formData.append('customerEmail', customerEmail);
    formData.append('customerNif', customerNif);
    formData.append('paymentMethod', paymentMethod);
    formData.append('ticketQuantity', ticketQuantity.toString());
    formData.append('totalPrice', (selectedTicket.ticketPrice * ticketQuantity).toString());
    formData.append('ticketId', selectedTicket.id);
    formData.append('ticketName', selectedTicket.name);

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

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><span className="loading loading-spinner loading-lg"></span></div>;
  }

  if (error) {
    return <div className="alert alert-error"><span>{error}</span></div>;
  }

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-base-100 shadow-2xl rounded-lg p-8 border border-base-content/20 text-left">
        <h1 className="text-4xl font-extrabold text-primary mb-8 text-center">{t('ticketsForSale')}</h1>
        <div className="space-y-8">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="card-title text-secondary">{ticket.name}</h3>
                    <p className="text-sm text-base-content/70">{ticket.address}</p>
                    <p className="text-lg font-semibold text-gray-800 mt-2">
                      {t('price')}: <span className="text-primary">€{(ticket.ticketPrice ?? 0).toFixed(2)}</span>
                    </p>
                  </div>
                  {ticket.images && ticket.images.length > 0 && (
                    <div className="flex space-x-4 mt-4 md:mt-0">
                      {ticket.images.map((image, index) => (
                        <Image
                          key={`${ticket.id}-${index}`}
                          src={image}
                          alt={`${t('ticketImage')} ${ticket.name} ${index + 1}`}
                          width={96} 
                          height={96} 
                          className="object-cover rounded-lg shadow-sm border border-base-200"
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="card-actions justify-end mt-4">
                  <button className="btn btn-primary flex items-center" onClick={() => openModal(ticket)}>
                    <span className="icon-[mdi--ticket-outline] mr-2 text-lg inline-block"></span>
                    <span>{t('buy')}</span>
                  </button>
                </div>
              </div>
            </div>
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
    </div>
  );
};

export default Ticketplace;
