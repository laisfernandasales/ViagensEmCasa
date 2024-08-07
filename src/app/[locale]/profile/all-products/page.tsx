'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface Product {
  id: string;
  productName: string;
  description: string;
  price: number | string;
  category: string;
  images: string[];
  stockQuantity: number;
  weight: number;
  productStatus: string;
}

const AllProductsPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const locale = pathname.split('/')[1];

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.role !== 'seller') {
      router.push(`/${locale}`);
      return;
    }

    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/seller/all-products');
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        setProducts(data.products);
      } catch (error: any) {
        setError(error.message || 'An unexpected error occurred');
      }
    };

    fetchProducts();
  }, [session, status, locale, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 p-8 flex flex-col items-center">
      <div className="w-full max-w-5xl bg-base-300 shadow-lg rounded-lg p-6">
        <h1 className="text-4xl font-bold mb-6 text-center text-base-content">Your Products</h1>
        {products.length === 0 ? (
          <p className="text-center text-xl text-base-content">No products found.</p>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="flex items-center justify-between bg-base-100 p-4 rounded-lg shadow-sm">
                <div className="flex items-center w-full">
                  {product.images[0] && (
                    <img
                      src={product.images[0]}
                      alt={product.productName}
                      className="w-20 h-20 object-cover rounded-lg mr-4"
                    />
                  )}
                  <div className="flex-grow">
                    <h2 className="text-xl font-semibold text-base-content">{product.productName}</h2>
                    <p className="text-base-content">
                      Price: €{Number(product.price).toFixed(2)}
                    </p>
                    <p className="text-base-content">Category: {product.category}</p>
                    <p className="text-base-content">Status: {product.productStatus}</p>
                  </div>
                  <button
                    className="btn btn-sm btn-primary ml-4"
                    onClick={() => router.push(`/${locale}/profile/edit-product/${product.id}`)}
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllProductsPage;
