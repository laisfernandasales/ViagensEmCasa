"use client";

import React, { useContext } from 'react';
import { NextPage } from 'next';
import { useTranslations } from 'next-intl';
import { ThemeContext } from '@/services/themes/ThemeContext';

const Home: NextPage = () => {
  const t = useTranslations('Home');
  const { theme } = useContext(ThemeContext);
  const backgroundImage = theme === 'dark' ? '/images/castelo_night.jpg' : '/images/castelo_day.jpg';

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

      <section className="py-12">
        <h2 className="text-4xl font-bold text-center text-base-content">{t('tourism')}</h2>
        <div className="flex flex-wrap justify-center gap-6 py-6">
          {['natural_beauties', 'historical_routes'].map((titleKey, index) => (
            <div key={index} className="card w-96 bg-base-100 shadow-xl">
              <figure>
                <img src="https://via.placeholder.com/400x300" alt={`Turismo ${index + 1}`} />
              </figure>
              <div className="card-body">
                <h3 className="card-title">{t(titleKey)}</h3>
                <p>{t(index === 0 ? 'explore_mountains' : 'know_historical')}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12 bg-base-200">
        <h2 className="text-4xl font-bold text-center text-base-content">{t('gastronomy')}</h2>
        <div className="flex flex-wrap justify-center gap-6 py-6">
          {['typical_dishes', 'recommended_restaurants'].map((titleKey, index) => (
            <div key={index} className="card w-96 bg-base-100 shadow-xl">
              <figure>
                <img src="https://via.placeholder.com/400x300" alt={`Gastronomia ${index + 1}`} />
              </figure>
              <div className="card-body">
                <h3 className="card-title">{t(titleKey)}</h3>
                <p>{t(index === 0 ? 'taste_unique' : 'visit_best_places')}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12">
        <h2 className="text-4xl font-bold text-center text-base-content">{t('crafts')}</h2>
        <div className="flex flex-wrap justify-center gap-6 py-6">
          {['local_fairs', 'craft_stores'].map((titleKey, index) => (
            <div key={index} className="card w-96 bg-base-100 shadow-xl">
              <figure>
                <img src="https://via.placeholder.com/400x300" alt={`Artesanato ${index + 1}`} />
              </figure>
              <div className="card-body">
                <h3 className="card-title">{t(titleKey)}</h3>
                <p>{t(index === 0 ? 'discover_authentic' : 'buy_handmade')}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
