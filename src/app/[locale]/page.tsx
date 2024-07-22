import { NextPage } from 'next';
import {useTranslations} from 'next-intl';

const Home: NextPage = () => {
  const t = useTranslations('Home');
  return (
    <div className="min-h-screen bg-base-200 flex flex-col items-center justify-center">
    <section className="hero bg-base-100 py-12">
      <div className="hero-content text-center">
        <div className="max-w-lg">
          <h1 className="text-5xl font-bold">{t('discover_best_region')}</h1>
          <p className="py-6">{t('explore_beauties')}</p>
          <button className="btn btn-primary">{t('learn_more')}</button>
        </div>
      </div>
    </section>

    <section className="py-12">
      <h2 className="text-4xl font-bold text-center">{t('tourism')}</h2>
      <div className="flex flex-wrap justify-center gap-6 py-6">
        <div className="card w-96 bg-base-100 shadow-xl">
          <figure><img src="https://via.placeholder.com/400x300" alt="Turismo 1" /></figure>
          <div className="card-body">
            <h3 className="card-title">{t('natural_beauties')}</h3>
            <p>{t('explore_mountains')}</p>
          </div>
        </div>
        <div className="card w-96 bg-base-100 shadow-xl">
          <figure><img src="https://via.placeholder.com/400x300" alt="Turismo 2" /></figure>
          <div className="card-body">
            <h3 className="card-title">{t('historical_routes')}</h3>
            <p>{t('know_historical')}</p>
          </div>
        </div>
      </div>
    </section>

    <section className="py-12 bg-base-200">
      <h2 className="text-4xl font-bold text-center">{t('gastronomy')}</h2>
      <div className="flex flex-wrap justify-center gap-6 py-6">
        <div className="card w-96 bg-base-100 shadow-xl">
          <figure><img src="https://via.placeholder.com/400x300" alt="Gastronomia 1" /></figure>
          <div className="card-body">
            <h3 className="card-title">{t('typical_dishes')}</h3>
            <p>{t('taste_unique')}</p>
          </div>
        </div>
        <div className="card w-96 bg-base-100 shadow-xl">
          <figure><img src="https://via.placeholder.com/400x300" alt="Gastronomia 2" /></figure>
          <div className="card-body">
            <h3 className="card-title">{t('recommended_restaurants')}</h3>
            <p>{t('visit_best_places')}</p>
          </div>
        </div>
      </div>
    </section>

    <section className="py-12">
      <h2 className="text-4xl font-bold text-center">{t('crafts')}</h2>
      <div className="flex flex-wrap justify-center gap-6 py-6">
        <div className="card w-96 bg-base-100 shadow-xl">
          <figure><img src="https://via.placeholder.com/400x300" alt="Artesanato 1" /></figure>
          <div className="card-body">
            <h3 className="card-title">{t('local_fairs')}</h3>
            <p>{t('discover_authentic')}</p>
          </div>
        </div>
        <div className="card w-96 bg-base-100 shadow-xl">
          <figure><img src="https://via.placeholder.com/400x300" alt="Artesanato 2" /></figure>
          <div className="card-body">
            <h3 className="card-title">{t('craft_stores')}</h3>
            <p>{t('buy_handmade')}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
  );
};

export default Home;
