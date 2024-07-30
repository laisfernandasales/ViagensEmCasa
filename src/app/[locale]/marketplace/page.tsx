// app/marketplace/page.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

interface Product {
  id: string;
  productName: string;
  price: string;
  image: string;
}

const Marketplace: React.FC = () => {
  const t = useTranslations('Marketplace');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/marketplace');
        const data = await response.json();
        setProducts(data.products);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 flex flex-col items-center justify-center">
      <section className="hero bg-base-100 py-12">
        <div className="hero-content text-center">
          <div className="max-w-lg">
            <h1 className="text-5xl font-bold mb-6">{t('mercado')}</h1>
          </div>
        </div>
      </section>

      <section className="py-12">
        <h2 className="text-4xl font-bold text-center">{t('produtos')}</h2>
        <div className="flex flex-wrap justify-center gap-6 py-6">
          {products.map((product) => (
            <div key={product.id} className="card w-72 bg-base-100 shadow-xl">
              <figure>
                <img
                  src={product.image || 'https://via.placeholder.com/400x300'}
                  alt={product.productName}
                  className="w-full h-48 object-cover"
                />
              </figure>
              <div className="card-body">
                <h3 className="card-title text-xl font-semibold mb-2">{product.productName}</h3>
                <p className="text-gray-700 mb-2">${product.price}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Marketplace;
