'use client';

import React, { useContext, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useTranslations, useLocale } from 'next-intl';
import { ThemeContext } from '@/services/themes/ThemeContext';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';

interface Product {
  id: string;
  productName: string;
  price: string;
  images: string[];
  description: string;
  averageRating: number;
}

interface Section {
  titleKey: string;
  items: {
    titleKey: string;
    descriptionKey: string;
    image: string;
  }[];
}

const Home: NextPage = () => {
  const t = useTranslations('Home');
  const { theme } = useContext(ThemeContext);
  const backgroundImage = theme === 'dark' ? '/images/castelo_night.png' : '/images/castelo_day.png';
  const router = useRouter();
  const locale = useLocale();

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

  const sections: Section[] = [
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

  const renderRatingStars = (averageRating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg
          key={i}
          className={`w-5 h-5 ${averageRating >= i ? 'text-yellow-500' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 .587l3.668 7.451 8.215 1.192-5.938 5.788 1.406 8.204L12 18.9l-7.351 3.872 1.406-8.204-5.938-5.788 8.215-1.192L12 .587z" />
        </svg>
      );
    }
    return stars;
  };

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
          <button 
            className="btn btn-primary" 
            onClick={() => router.push(`/${locale}/about`)}
          >
            {t('learn_more')}
          </button>
        </div>
      </section>

      {!loading && highlightedProducts.length > 0 && (
        <section className="py-12 w-full">
          <h2 className="text-4xl font-bold text-center text-base-content mb-6">
            {t('highlighted_products')}
          </h2>
          <div className="w-full max-w-5xl mx-auto">
            <Swiper
              modules={[Pagination, Navigation, Autoplay]}
              pagination={{ clickable: true }}
              navigation
              autoplay={{ delay: 3000 }}
              loop={highlightedProducts.length > 1}
              slidesPerView={1}
            >
              {highlightedProducts.map((product) => (
                <SwiperSlide key={product.id}>
                  <button 
                    className="w-full cursor-pointer bg-transparent border-none p-0 text-left" 
                    onClick={() => router.push(`/${locale}/marketplace/${product.id}`)}
                    style={{ all: 'unset' }}
                  >
                    <div className="card w-full bg-base-100 shadow-xl flex flex-row rounded-lg overflow-hidden">
                      <div className="w-2/5 h-72 flex items-center justify-center bg-gray-100">
                        <Image
                          src={product.images[0] || 'https://via.placeholder.com/400x300'}
                          alt={product.productName}
                          width={300}
                          height={300}
                          className="object-cover w-full h-full"
                          onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/400x300'; }}
                        />
                      </div>
                      <div className="card-body w-3/5 p-6 flex flex-col justify-center items-center">
                        <h3 className="card-title text-3xl font-semibold mb-2 text-center">
                          {product.productName}
                        </h3>
                        <p className="text-3xl font-bold text-green-700 dark:text-green-400 mb-2 text-center">
                          €{product.price}
                        </p>
                        <p className="text-lg text-gray-700 mb-4 text-center">
                          {product.description}
                        </p>
                        <div className="flex flex-col items-center mb-2">
                          <p className="text-lg font-medium text-center mb-1">
                            Avaliação: {product.averageRating.toFixed(1)}
                          </p>
                          <div className="flex justify-center">
                            {renderRatingStars(product.averageRating)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>
      )}

      {sections.map((section) => (
        <section key={section.titleKey} className="py-12">
          <h2 className="text-4xl font-bold text-center text-base-content">{t(section.titleKey)}</h2>
          <div className="flex flex-wrap justify-center gap-6 py-6">
            {section.items.map((item) => (
              <div key={item.titleKey} className="card w-96 bg-base-100 shadow-xl rounded-lg overflow-hidden">
                <figure>
                  <Image
                    src={item.image}
                    alt={t(item.titleKey)}
                    width={400}
                    height={300}
                    className="w-full h-64 object-cover"
                  />
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
