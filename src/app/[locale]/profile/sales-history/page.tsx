'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

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

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.role !== 'seller') {
      router.push('/');
      return;
    }

    const fetchSalesHistory = async () => {
      try {
        const response = await fetch('/api/seller/get-sales-history');
        if (!response.ok) throw new Error('Failed to fetch sales history');
        const data = await response.json();
        setSalesHistory(data.salesHistory);
        setTotalRevenue(data.totalRevenue);
      } catch (error: any) {
        setError(error.message || 'An unexpected error occurred');
      }
    };

    fetchSalesHistory();
  }, [session, status, router]);

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
          <h1 className="text-2xl font-bold text-base-content">Nenhuma venda registrada.</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-base-100 shadow-lg rounded-lg p-8 border border-base-content/20">
        <h1 className="text-3xl font-bold text-center text-primary mb-6">Histórico de Vendas</h1>
        <div className="overflow-x-auto">
          <table className="table-auto w-full text-left">
            <thead>
              <tr>
                <th className="px-4 py-2">Produto</th>
                <th className="px-4 py-2">Quantidade Vendida</th>
                <th className="px-4 py-2">Versão do Produto</th>
                <th className="px-4 py-2">Preço por Unidade</th>
                <th className="px-4 py-2">Total Arrecadado</th>
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
          <h2 className="text-xl font-bold text-base-content">Total Arrecadado na Loja: €{totalRevenue.toFixed(2)}</h2>
        </div>
      </div>
    </div>
  );
};

export default SalesHistoryPage;
