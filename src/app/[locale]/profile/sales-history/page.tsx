'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

interface SalesItem {
  productName: string;
  totalQuantity: number;
  versionId: string;
  price: number;
  totalRevenue: number;
}

const SalesHistoryPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [salesHistory, setSalesHistory] = useState<SalesItem[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('SalesHistoryPage');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.role !== 'seller') {
      router.push('/');
      return;
    }

    const fetchSalesHistory = async () => {
      try {
        const response = await fetch('/api/seller/get-sales-history');
        if (!response.ok) throw new Error(t('fetchError'));
        const data = await response.json();
        setSalesHistory(data.salesHistory);
        setTotalRevenue(data.totalRevenue);
      } catch (error: any) {
        setError(error.message || t('unexpectedError'));
      }
    };

    fetchSalesHistory();
  }, [session, status, router, t]);

  if (status === 'loading') {
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

  if (salesHistory.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-200">
        <div className="bg-base-100 p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-base-content">{t('noSalesRecorded')}</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-base-100 shadow-lg rounded-lg p-8 border border-base-content/20">
        <h1 className="text-3xl font-bold text-center text-primary mb-6">{t('salesHistoryTitle')}</h1>
        <div className="overflow-x-auto">
          <table className="table-auto w-full text-left">
            <thead>
              <tr>
                <th className="px-4 py-2">{t('product')}</th>
                <th className="px-4 py-2">{t('quantitySold')}</th>
                <th className="px-4 py-2">{t('productVersion')}</th>
                <th className="px-4 py-2">{t('unitPrice')}</th>
                <th className="px-4 py-2">{t('totalRevenue')}</th>
              </tr>
            </thead>
            <tbody>
              {salesHistory.map((item) => (
                <tr key={item.versionId}>
                  <td className="border px-4 py-2">{item.productName}</td>
                  <td className="border px-4 py-2">{item.totalQuantity}</td>
                  <td className="border px-4 py-2">{item.versionId}</td>
                  <td className="border px-4 py-2">€{item.price.toFixed(2)}</td>
                  <td className="border px-4 py-2">€{item.totalRevenue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 text-right">
          <h2 className="text-xl font-bold text-base-content">{t('totalStoreRevenue')}: €{totalRevenue.toFixed(2)}</h2>
        </div>
      </div>
    </div>
  );
};

export default SalesHistoryPage;
