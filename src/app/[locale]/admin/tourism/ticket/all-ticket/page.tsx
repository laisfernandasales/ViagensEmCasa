'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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

export default function ManageMuseumTicketsPage() {
  const t = useTranslations('ManageTicketsPage'); 
  const [tickets, setTickets] = useState<MuseumTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
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
          const response = await fetch('/api/admin/ticket/all-ticket');
          if (!response.ok) throw new Error(t('fetchError'));
          const data = await response.json();
          setTickets(data.tickets);
        } catch (error) {
          setError(error instanceof Error ? error.message : t('fetchError'));
        } finally {
          setLoading(false);
        }
      };

      fetchTickets();
    }
  }, [isAuthorized, t]);

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
      const response = await fetch('/api/admin/ticket/all-ticket', {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) throw new Error(t('updateStatusError'));

      setTickets((tickets) =>
        tickets.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, enabled } : ticket
        )
      );
    } catch (error) {
      console.error(t('statusUpdateError'), error);
      alert(t('statusUpdateFailure'));
    }
  };

  const handleEdit = (ticketId: string) => {
    router.push(`/${locale}/admin/tourism/ticket/edit-ticket?id=${ticketId}`);
  };

  if (loading) return <div className="loading loading-spinner loading-lg"></div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return isAuthorized ? (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-6">{t('manageTickets')}</h1>

      <button
        onClick={() => router.push(`/${locale}/admin/tourism/ticket/add-ticket`)}
        className="btn btn-primary mb-6"
      >
        {t('addNewTicket')}
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="card bg-base-100 shadow-xl p-4">
            <h2 className="text-2xl font-semibold mb-2">{ticket.name}</h2>
            <p className="text-sm mb-4">{ticket.address}</p>
            <p className="text-lg font-bold">
              {t('price')}: €{ticket.ticketPrice?.toFixed(2) || 0}
            </p>
            <p className="text-lg">
              {t('availableTickets')}: 
              {ticket.totalTickets
                ? ticket.totalTickets - (ticket.ticketsSold || 0)
                : 0}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {ticket.images?.map((image, index) => (
                <div key={image} className="border rounded-lg p-2">
                  <Image
                    src={image}
                    alt={`${t('image')} ${index + 1}`}
                    className="w-full h-32 object-cover"
                    width={150}
                    height={128}
                    layout="responsive"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={() => handleEdit(ticket.id)}
              className="btn btn-secondary mb-2"
            >
              {t('edit')}
            </button>
            <button
              onClick={() => handleUpdateStatus(ticket.id, !ticket.enabled)}
              className={`btn ${ticket.enabled ? 'btn-error' : 'btn-success'}`}
            >
              {ticket.enabled ? t('disable') : t('enable')}
            </button>
          </div>
        ))}
      </div>
    </div>
  ) : null;
}
