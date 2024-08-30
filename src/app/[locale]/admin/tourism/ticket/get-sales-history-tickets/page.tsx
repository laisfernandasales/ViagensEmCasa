'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

interface Sale {
  id: string;
  customerName: string;
  customerNif: string;
  email: string;
  paymentMethod: string;
  ticketQuantity: number;
  totalPrice: number;
  ticketId: string;
  ticketName: string;
  purchasedAt: Date;
}

const TicketSalesHistoryPage = () => {
  const t = useTranslations('TicketSalesHistoryPage');
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalBalance, setTotalBalance] = useState<number | null>(null);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
      router.push('/');
    } else {
      const fetchSalesHistory = async () => {
        try {
          const response = await fetch('/api/admin/ticket/sales-history-tickets');
          if (!response.ok) throw new Error(t('fetchSalesHistoryError'));
          const data = await response.json();
          setSales(data.sales);
        } catch (err) {
          setError(err instanceof Error ? err.message : t('fetchSalesHistoryError'));
        } finally {
          setLoading(false);
        }
      };

      const fetchTotalBalance = async () => {
        try {
          const response = await fetch('/api/admin/ticket/balance');
          if (!response.ok) throw new Error(t('fetchTotalBalanceError'));
          const data = await response.json();
          setTotalBalance(parseFloat(data.totalBalance));
        } catch (err) {
          setError(err instanceof Error ? err.message : t('fetchTotalBalanceError'));
        }
      };

      fetchSalesHistory();
      fetchTotalBalance();
    }
  }, [status, session, router, t]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error text-center my-8">
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 min-h-screen">
      <h1 className="text-4xl font-bold text-center text-primary mb-8">
        {t('salesHistoryTitle')}
      </h1>

      {totalBalance !== null && (
        <div className="alert alert-success shadow-lg mb-6">
          <div>
            <span className="text-lg font-semibold">
              {t('currentBalance')}: €{totalBalance.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      <div className="overflow-x-auto shadow-lg rounded-lg bg-base-100">
        <table className="table w-full text-left border-collapse">
          <thead>
            <tr className="bg-primary text-white">
              <th className="px-4 py-2">{t('id')}</th>
              <th className="px-4 py-2">{t('ticketName')}</th>
              <th className="px-4 py-2">{t('customerName')}</th>
              <th className="px-4 py-2">{t('nif')}</th>
              <th className="px-4 py-2">{t('email')}</th>
              <th className="px-4 py-2">{t('paymentMethod')}</th>
              <th className="px-4 py-2">{t('ticketQuantity')}</th>
              <th className="px-4 py-2">{t('totalPrice')}</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.id} className="hover:bg-base-200">
                <td className="px-4 py-2">{sale.id}</td>
                <td className="px-4 py-2">{sale.ticketName}</td>
                <td className="px-4 py-2">{sale.customerName}</td>
                <td className="px-4 py-2">{sale.customerNif}</td>
                <td className="px-4 py-2">{sale.email}</td>
                <td className="px-4 py-2">{sale.paymentMethod}</td>
                <td className="px-4 py-2">{sale.ticketQuantity}</td>
                <td className="px-4 py-2">€{sale.totalPrice.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TicketSalesHistoryPage;
