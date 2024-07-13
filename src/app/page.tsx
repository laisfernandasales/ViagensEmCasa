'use client';

import React from 'react';
import 'daisyui/dist/full.css';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-base-200 p-4">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold mb-4 text-primary">VIAGENS EM CASA</h1>
        <p className="text-xl text-secondary">Descubra destinos incríveis e produtos regionais autênticos</p>
      </div>
      <div className="carousel w-full max-w-3xl mx-auto mb-8">
        <div id="slide1" className="carousel-item relative w-full">
          <img
            src="/images/destino1.jpg"
            className="w-full"
            alt="Destinos turísticos"
          />
          <div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between">
            <a href="#slide3" className="btn btn-circle">❮</a>
            <a href="#slide2" className="btn btn-circle">❯</a>
          </div>
        </div>
        <div id="slide2" className="carousel-item relative w-full">
          <img
            src="/images/produto1.jpg"
            className="w-full"
            alt="Produtos regionais"
          />
          <div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between">
            <a href="#slide1" className="btn btn-circle">❮</a>
            <a href="#slide3" className="btn btn-circle">❯</a>
          </div>
        </div>
        <div id="slide3" className="carousel-item relative w-full">
          <img
            src="/images/artesanato1.jpg"
            className="w-full"
            alt="Artesanato"
          />
          <div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between">
            <a href="#slide2" className="btn btn-circle">❮</a>
            <a href="#slide1" className="btn btn-circle">❯</a>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="card shadow-lg">
          <div className="card-body">
            <h2 className="card-title">Destinos Turísticos</h2>
            <p>Explore os melhores destinos turísticos e viva experiências únicas.</p>
            <div className="card-actions justify-center">
              <button className="btn btn-primary">Ver Destinos</button>
            </div>
          </div>
        </div>
        <div className="card shadow-lg">
          <div className="card-body">
            <h2 className="card-title">Produtos Regionais</h2>
            <p>Descubra produtos regionais biológicos e artesanato autêntico.</p>
            <div className="card-actions justify-center">
              <button className="btn btn-secondary">Ver Produtos</button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex space-x-4">
        <button className="btn btn-accent">Saiba Mais</button>
        <button className="btn btn-warning">Entre em Contato</button>
      </div>
    </div>
  );
}
