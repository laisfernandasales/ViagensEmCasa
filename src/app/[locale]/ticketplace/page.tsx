'use client';

import React, { useEffect, useState } from 'react';
import { IoTicketOutline } from "react-icons/io5";
import { useSession } from 'next-auth/react';

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
    const fetchActiveTickets = async () => {
      try {
        const response = await fetch('/api/admin/ticket/all-ticket');
        if (!response.ok) throw new Error('Failed to fetch tickets');
        const data = await response.json();
        setTickets(data.tickets.filter((ticket: MuseumTicket) => ticket.enabled));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tickets');
      } finally {
        setLoading(false);
      }
    };

    fetchActiveTickets();
  }, []);

  const openModal = (ticket: MuseumTicket) => {
    setSelectedTicket(ticket);
    setCustomerEmail(session?.user?.email || ''); // Usa o email da sessão se disponível
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
      const response = await fetch('/api/admin/ticket/purchase', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Erro ao processar a compra: ${errorData.error}`);
        return;
      }

      // Mostrar modal de sucesso
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error('Erro ao enviar a compra:', error);
      alert('Erro ao processar a compra');
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
        <h1 className="text-4xl font-extrabold text-primary mb-8 text-center">Bilhetes à Venda</h1>
        <div className="space-y-8">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="card-title text-secondary">{ticket.name}</h3>
                    <p className="text-sm text-base-content/70">{ticket.address}</p>
                    <p className="text-lg font-semibold text-gray-800 mt-2">
                      Preço: <span className="text-primary">€{(ticket.ticketPrice ?? 0).toFixed(2)}</span>
                    </p>
                  </div>
                  {ticket.images && ticket.images.length > 0 && (
                    <div className="flex space-x-4 mt-4 md:mt-0">
                      {ticket.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Imagem do bilhete ${ticket.name} ${index + 1}`}
                          className="w-24 h-24 object-cover rounded-lg shadow-sm border border-base-200"
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="card-actions justify-end mt-4">
                  <button className="btn btn-primary flex items-center" onClick={() => openModal(ticket)}>
                    <IoTicketOutline className="mr-2 text-lg" />
                    Comprar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de compra */}
      {isModalOpen && selectedTicket && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h2 className="text-2xl font-semibold mb-4">Comprar Bilhetes</h2>
            <p className="text-lg mb-2">Você está comprando bilhetes para: <span className="font-bold">{selectedTicket.name}</span></p>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Nome do Cliente</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="input input-bordered w-full"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="input input-bordered w-full"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">NIF</label>
              <input
                type="text"
                value={customerNif}
                onChange={(e) => setCustomerNif(e.target.value)}
                className="input input-bordered w-full"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Forma de Pagamento</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="select select-bordered w-full"
                required
              >
                <option value="Cartão">Cartão</option>
                <option value="MBWay">MBWay</option>
                <option value="PayPal">PayPal</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Quantidade</label>
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
              <p className="text-lg font-semibold">Preço Total: <span className="text-primary">€{(selectedTicket.ticketPrice * ticketQuantity).toFixed(2)}</span></p>
            </div>

            <div className="modal-action">
              <button onClick={handlePurchase} className="btn btn-primary">Confirmar Compra</button>
              <button onClick={closeModal} className="btn">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de sucesso */}
      {isSuccessModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h2 className="text-2xl font-semibold mb-4">Compra Confirmada</h2>
            <p>Obrigado pela sua compra. Seus bilhetes foram adquiridos com sucesso.</p>
            <div className="modal-action">
              <button onClick={handleSuccessModalClose} className="btn btn-primary">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ticketplace;
