'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

interface SaleProduct {
  productName: string;
  price: number;
  quantity: number;
  totalPrice: number;
}

interface Sale {
  id: string;
  username: string;
  email: string;
  products: SaleProduct[];
  totalPaid: number;
  purchaseDate: string | null;
}

const AdminSalesProductPage = () => {
  const t = useTranslations('AdminSalesProductPage');
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
      router.push('/');
    } else {
      const fetchSalesHistory = async () => {
        try {
          const response = await fetch('/api/admin/products/sales-history-products');
          if (!response.ok) throw new Error(t('fetchSalesHistoryError'));
          const data = await response.json();
          setSales(data.sales);
        } catch (err) {
          setError(err instanceof Error ? err.message : t('fetchSalesHistoryError'));
        } finally {
          setLoading(false);
        }
      };

      fetchSalesHistory();
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

      <div className="overflow-x-auto shadow-lg rounded-lg bg-base-100">
        <table className="table w-full text-left border-collapse">
          <thead>
            <tr className="bg-primary text-white">
              <th className="px-4 py-2">{t('id')}</th>
              <th className="px-4 py-2">{t('username')}</th>
              <th className="px-4 py-2">{t('email')}</th>
              <th className="px-4 py-2">{t('productName')}</th>
              <th className="px-4 py-2">{t('quantity')}</th>
              <th className="px-4 py-2">{t('price')}</th>
              <th className="px-4 py-2">{t('totalPrice')}</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) =>
              sale.products.map((product, index) => (
                <tr key={`${sale.id}-${index}`} className="hover:bg-base-200">
                  {index === 0 && (
                    <>
                      <td rowSpan={sale.products.length} className="px-4 py-2 border-b">
                        {sale.id}
                      </td>
                      <td rowSpan={sale.products.length} className="px-4 py-2 border-b">
                        {sale.username}
                      </td>
                      <td rowSpan={sale.products.length} className="px-4 py-2 border-b">
                        {sale.email}
                      </td>
                    </>
                  )}
                  <td className="px-4 py-2 border-b">{product.productName}</td>
                  <td className="px-4 py-2 border-b">{product.quantity}</td>
                  <td className="px-4 py-2 border-b">
                    €{typeof product.price === 'number' ? product.price.toFixed(2) : 'N/A'}
                  </td>
                  <td className="px-4 py-2 border-b">
                    €{typeof product.totalPrice === 'number' ? product.totalPrice.toFixed(2) : 'N/A'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminSalesProductPage;