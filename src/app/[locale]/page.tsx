"use client";

import React, { useContext } from 'react';
import { NextPage } from 'next';
import { useTranslations } from 'next-intl';
import { ThemeContext } from '@/services/themes/ThemeContext';

const Home: NextPage = () => {
  const t = useTranslations('Home');
  const { theme } = useContext(ThemeContext);
  const backgroundImage = theme === 'dark' ? '/images/castelo_night.png' : '/images/castelo_day.png';

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

      {sections.map((section, sectionIndex) => (
        <section key={sectionIndex} className="py-12">
          <h2 className="text-4xl font-bold text-center text-base-content">{t(section.titleKey)}</h2>
          <div className="flex flex-wrap justify-center gap-6 py-6">
            {section.items.map((item, index) => (
              <div key={index} className="card w-96 bg-base-100 shadow-xl">
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
