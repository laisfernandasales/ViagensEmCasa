"use client";

import React, { useContext, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useTranslations } from 'next-intl';
import { ThemeContext } from '@/services/themes/ThemeContext';

interface Product {
  id: string;
  productName: string;
  price: string;
  images: string[];
}

const Home: NextPage = () => {
  const t = useTranslations('Home');
  const { theme } = useContext(ThemeContext);
  const backgroundImage = theme === 'dark' ? '/images/castelo_night.png' : '/images/castelo_day.png';

  const [highlightedProducts, setHighlightedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHighlightedProducts = async () => {
      try {
        const response = await fetch('/api/marketplace/highlights');
        const data = await response.json();
        setHighlightedProducts(data.products || []);
      } catch (error) {
        console.error('Error fetching highlighted products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHighlightedProducts();
  }, []);

  const sections = [
    {
      titleKey: 'tourism',
      items: [
        { titleKey: 'natural_beauties', descriptionKey: 'explore_mountains', image: '/images/pic1.jpg' },
        { titleKey: 'historical_routes', descriptionKey: 'know_historical', image: '/images/pic2.jpg' },
      ],
    },
    {
      titleKey: 'gastronomy',
      items: [
        { titleKey: 'typical_dishes', descriptionKey: 'taste_unique', image: '/images/pic3.jpg' },
        { titleKey: 'recommended_restaurants', descriptionKey: 'visit_best_places', image: '/images/pic4.jpg' },
      ],
    },
    {
      titleKey: 'crafts',
      items: [
        { titleKey: 'local_fairs', descriptionKey: 'discover_authentic', image: '/images/pic5.jpg' },
        { titleKey: 'craft_stores', descriptionKey: 'buy_handmade', image: '/images/pic6.jpg' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-base-200 flex flex-col items-center justify-center">
      <section
        className="hero bg-base-100 py-12 flex items-center justify-center"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          height: '400px',
          width: '100%',
        }}
      >
        <div className="text-center p-6 bg-base-100 bg-opacity-70 rounded-lg shadow-lg max-w-lg mx-auto">
          <h1 className="text-5xl font-bold mb-4 text-base-content">{t('discover_best_region')}</h1>
          <p className="mb-6 text-base-content">{t('explore_beauties')}</p>
          <button className="btn btn-primary">{t('learn_more')}</button>
        </div>
      </section>

      {!loading && highlightedProducts.length > 0 && (
        <section className="py-12">
          <h2 className="text-4xl font-bold text-center text-base-content mb-6">{t('highlighted_products')}</h2>
          <div className="carousel w-full max-w-4xl mx-auto">
            {highlightedProducts.map((product, index) => (
              <div key={product.id} className={`carousel-item ${index === 0 ? 'active' : ''} w-full`}>
                <div className="card w-full bg-base-100 shadow-xl">
                  <figure>
                    <img
                      src={(Array.isArray(product.images) && product.images[0]) || 'https://via.placeholder.com/400x300'}
                      alt={product.productName}
                      className="w-full h-64 object-cover"
                      onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/400x300'; }}
                    />
                  </figure>
                  <div className="card-body">
                    <h3 className="card-title text-xl font-semibold mb-2">
                      {product.productName}
                    </h3>
                    <p className="text-gray-700 mb-2">€{product.price}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {sections.map((section) => (
        <section key={section.titleKey} className="py-12">
          <h2 className="text-4xl font-bold text-center text-base-content">{t(section.titleKey)}</h2>
          <div className="flex flex-wrap justify-center gap-6 py-6">
            {section.items.map((item) => (
              <div key={item.titleKey} className="card w-96 bg-base-100 shadow-xl">
                <figure>
                  <img src={item.image} alt={t(item.titleKey)} className="w-full h-64 object-cover" />
                </figure>
                <div className="card-body">
                  <h3 className="card-title">{t(item.titleKey)}</h3>
                  <p>{t(item.descriptionKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default Home;
