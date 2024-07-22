import { NextPage } from 'next';

const Home: NextPage = () => {
  return (
    <div className="min-h-screen bg-base-200 flex flex-col items-center justify-center">
      <section className="hero bg-base-100 py-12">
        <div className="hero-content text-center">
          <div className="max-w-lg">
            <h1 className="text-5xl font-bold">Descubra o Melhor da Região</h1>
            <p className="py-6">Explore nossas belezas naturais, a rica gastronomia e o artesanato local.</p>
            <button className="btn btn-primary">Saiba Mais</button>
          </div>
        </div>
      </section>

      <section className="py-12">
        <h2 className="text-4xl font-bold text-center">Turismo</h2>
        <div className="flex flex-wrap justify-center gap-6 py-6">
          <div className="card w-96 bg-base-100 shadow-xl">
            <figure><img src="https://via.placeholder.com/400x300" alt="Turismo 1" /></figure>
            <div className="card-body">
              <h3 className="card-title">Belezas Naturais</h3>
              <p>Explore nossas montanhas, praias e parques.</p>
            </div>
          </div>
          <div className="card w-96 bg-base-100 shadow-xl">
            <figure><img src="https://via.placeholder.com/400x300" alt="Turismo 2" /></figure>
            <div className="card-body">
              <h3 className="card-title">Roteiros Históricos</h3>
              <p>Conheça os locais históricos e culturais.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-base-200">
        <h2 className="text-4xl font-bold text-center">Gastronomia</h2>
        <div className="flex flex-wrap justify-center gap-6 py-6">
          <div className="card w-96 bg-base-100 shadow-xl">
            <figure><img src="https://via.placeholder.com/400x300" alt="Gastronomia 1" /></figure>
            <div className="card-body">
              <h3 className="card-title">Pratos Típicos</h3>
              <p>Deguste os sabores únicos da nossa região.</p>
            </div>
          </div>
          <div className="card w-96 bg-base-100 shadow-xl">
            <figure><img src="https://via.placeholder.com/400x300" alt="Gastronomia 2" /></figure>
            <div className="card-body">
              <h3 className="card-title">Restaurantes Recomendados</h3>
              <p>Visite os melhores lugares para comer.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <h2 className="text-4xl font-bold text-center">Artesanato</h2>
        <div className="flex flex-wrap justify-center gap-6 py-6">
          <div className="card w-96 bg-base-100 shadow-xl">
            <figure><img src="https://via.placeholder.com/400x300" alt="Artesanato 1" /></figure>
            <div className="card-body">
              <h3 className="card-title">Feiras Locais</h3>
              <p>Descubra o artesanato autêntico nas feiras.</p>
            </div>
          </div>
          <div className="card w-96 bg-base-100 shadow-xl">
            <figure><img src="https://via.placeholder.com/400x300" alt="Artesanato 2" /></figure>
            <div className="card-body">
              <h3 className="card-title">Lojas Artesanais</h3>
              <p>Compre produtos feitos à mão.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
