'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface PurchaseItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  image: string;
}

interface Purchase {
  id: string;
  items: PurchaseItem[];
  createdAt: string;
  totalPaid: number;
}

const PurchaseHistory: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/');
      return;
    }

    const fetchPurchases = async () => {
      try {
        const response = await fetch('/api/checkout/purchase-history');
        if (!response.ok) throw new Error('Failed to fetch purchase history');
        const data = await response.json();
        setPurchases(data.userSales);
        setLoading(false);
      } catch (error: any) {
        setError(error.message || 'An unexpected error occurred');
        setLoading(false);
      }
    };

    fetchPurchases();
  }, [session, status, router]);

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

  if (purchases.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-200">
        <div className="bg-base-100 p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-base-content">Você ainda não fez nenhuma compra.</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-base-100 shadow-lg rounded-lg p-8 border border-base-content/20">
        <h1 className="text-3xl font-bold text-center text-primary mb-6">Histórico de Compras</h1>
        <div className="space-y-6">
          {purchases.map((purchase) => (
            <div key={purchase.id} className="bg-base-200 p-4 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-base-content mb-4">Compra realizada em: {new Date(purchase.createdAt).toLocaleDateString()}</h2>
              <div className="space-y-2">
                {purchase.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Image 
                        src={item.image} 
                        alt={item.productName} 
                        width={64} 
                        height={64} 
                        className="object-cover rounded-lg mr-4" 
                      />
                      <div>
                        <p className="text-lg font-semibold">{item.productName}</p>
                        <p className="text-sm text-base-content">Quantidade: {item.quantity}</p>
                        <p className="text-sm text-base-content">Preço: €{Number(item.price).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-right mt-4">
                <p className="text-lg font-bold text-base-content">Total Pago: €{Number(purchase.totalPaid).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PurchaseHistory;
