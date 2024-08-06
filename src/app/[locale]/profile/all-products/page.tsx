'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface Product {
  id: string;
  productName: string;
  description: string;
  price: number | string; // Permitir string para evitar NaN
  category: string;
  images: string[];
  stockQuantity: number;
  weight: number;
  productStatus: string;
}

const AllProductsPage: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  const getLocale = () => {
    const segments = pathname.split('/');
    return segments.length > 1 ? segments[1] : 'en';
  };

  const locale = getLocale();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/seller/all-products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data.products);
      } catch (error: any) {
        setError(error.message);
      }
    };

    if (session) {
      fetchProducts();
    }
  }, [session]);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please log in to view your products.</p>
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
                  {product.images.length > 0 && (
                    <img
                      src={product.images[0]}
                      alt={product.productName}
                      className="w-20 h-20 object-cover rounded-lg mr-4"
                    />
                  )}
                  <div className="flex-grow">
                    <h2 className="text-xl font-semibold text-base-content">{product.productName}</h2>
                    <p className="text-base-content">
                      Price: €
                      {typeof product.price === 'number'
                        ? product.price.toFixed(2)
                        : Number(product.price).toFixed(2)}
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
