'use client';

import React, { useEffect, useState } from 'react';
import { IoTicketOutline } from "react-icons/io5";

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

const AboutPage = () => {
  const [tickets, setTickets] = useState<MuseumTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActiveTickets = async () => {
      try {
        const response = await fetch('/api/admin/ticket');
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
                  <button className="btn btn-primary flex items-center">
                    <IoTicketOutline className="mr-2 text-lg" />
                    Comprar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
