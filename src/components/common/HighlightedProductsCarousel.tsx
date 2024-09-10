'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';
import { useLocale, useTranslations } from 'next-intl';

interface Product {
  id: string;
  productName: string;
  price: string;
  images: string[];
  description: string;
  averageRating: number;
}

const HighlightedProductsCarousel: React.FC = () => {
  const t = useTranslations('HighlightedProductsCarousel');
  const router = useRouter();
  const locale = useLocale();
  const [highlightedProducts, setHighlightedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHighlightedProducts = async () => {
      try {
        const cachedProducts = sessionStorage.getItem('highlightedProducts');
        if (cachedProducts) {
          setHighlightedProducts(JSON.parse(cachedProducts));
        } else {
          const response = await fetch('/api/marketplace/highlights');
          const data = await response.json();
          setHighlightedProducts(data.products || []);
          sessionStorage.setItem('highlightedProducts', JSON.stringify(data.products));
        }
      } catch (error) {
        console.error(t('fetchError'), error);
      } finally {
        setLoading(false);
      }
    };

    fetchHighlightedProducts();
  }, [t]);

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

  if (loading) {
    return <div className="py-12 w-full flex justify-center"><span className="loading loading-spinner loading-lg"></span></div>;
  }

  return (
    <div className="w-full max-w-5xl mx-auto h-64">
      <Swiper
        modules={[Pagination, Navigation, Autoplay]}
        pagination={{ clickable: true }}
        navigation
        autoplay={{ delay: 3000 }}
        loop={highlightedProducts.length > 1}
        slidesPerView={1}
        style={{ zIndex: 10 }}
        className="h-full"
      >
        {highlightedProducts.map((product) => (
          <SwiperSlide key={product.id} className="flex items-center justify-center h-full">
            <button
              className="w-full cursor-pointer bg-transparent border-none p-0 text-left h-full flex justify-center items-center"
              onClick={() => router.push(`/${locale}/marketplace/${product.id}`)}
            >
              <div className="card w-full bg-base-100 shadow-xl flex flex-row rounded-lg overflow-hidden h-full">
                <div className="w-2/5 flex items-center justify-center bg-gray-100 h-full">
                  <Image
                    src={product.images[0] || 'https://via.placeholder.com/400x300'}
                    alt={product.productName}
                    width={400}
                    height={400}
                    className="object-cover w-full h-full"
                    onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/400x300'; }}
                  />
                </div>
                <div className="card-body w-3/5 p-6 flex flex-col justify-center items-center h-full">
                  <h3
                    className="card-title text-3xl font-semibold mb-2 text-center truncate"
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100%', 
                    }}
                  >
                    {product.productName}
                  </h3>
                  <p className="text-3xl font-bold text-green-700 dark:text-green-400 mb-2 text-center">
                    {product.price} €
                  </p>
                  <p
                    className="text-lg text-gray-700 mb-4 text-center line-clamp-3"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      maxHeight: '4.5rem',  
                    }}
                  >
                    {product.description}
                  </p>
                  <div className="flex flex-col items-center mb-2">
                    <p className="text-lg font-medium text-center mb-1">
                      {product.averageRating > 0 ? `${t('rating')}: ${product.averageRating.toFixed(1)}` : t('noReviews')}
                    </p>
                    {product.averageRating > 0 && (
                      <div className="flex justify-center">
                        {renderRatingStars(product.averageRating)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </button>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default HighlightedProductsCarousel;
