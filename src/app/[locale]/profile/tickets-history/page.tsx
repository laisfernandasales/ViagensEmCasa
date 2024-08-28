'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface TicketPurchase {
  id: string;
  ticketName: string;
  ticketQuantity: number;
  totalPrice: number;
  purchasedAt: string;
  pdfUrl: string;
}

const TicketHistory: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations('TicketHistory');
  const [ticketPurchases, setTicketPurchases] = useState<TicketPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/');
      return;
    }

    const fetchTicketPurchases = async () => {
      try {
        const response = await fetch('/api/checkout/tickets-history');
        if (!response.ok) throw new Error(t('fetchError'));
        const data = await response.json();
        setTicketPurchases(data.userSales);
        setLoading(false);
      } catch (error: any) {
        setError(error.message || t('unexpectedError'));
        setLoading(false);
      }
    };

    fetchTicketPurchases();
  }, [session, status, router, t]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-200">
        <div className="alert alert-warning shadow-lg">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (ticketPurchases.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-200">
        <div className="bg-base-100 p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-base-content">{t('noPurchases')}</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-base-100 shadow-lg rounded-lg p-8 border border-base-content/20">
        <h1 className="text-3xl font-bold text-center text-primary mb-6">{t('purchaseHistoryTitle')}</h1>
        <div className="space-y-6">
          {ticketPurchases.map((ticketPurchase) => (
            <div key={ticketPurchase.id} className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {t('purchaseDate')}: {new Date(ticketPurchase.purchasedAt).toLocaleDateString()}
              </h2>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-gray-700">{ticketPurchase.ticketName}</p>
                    <p className="text-sm text-gray-600">{t('quantity')}: {ticketPurchase.ticketQuantity}</p>
                    <p className="text-sm text-gray-600">{t('price')}: {Number(ticketPurchase.totalPrice).toFixed(2)} €</p>
                  </div>
                </div>
              </div>
              <div className="text-right mt-4">
                <p className="text-lg font-bold text-gray-800">{t('totalPaid')}: {Number(ticketPurchase.totalPrice).toFixed(2)} €</p>
                {ticketPurchase.pdfUrl && (
                  <a href={ticketPurchase.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                    {t('downloadPdf')}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TicketHistory;