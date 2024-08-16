'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from 'next-auth/react';

export default function CreatePackagePage() {
  const [packageName, setPackageName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [hotels, setHotels] = useState([
    { id: '', name: '', address: '', pricePerNight: '', availability: '', checkInDate: '', checkOutDate: '' },
  ]);
  const [restaurants, setRestaurants] = useState<string[]>(['']);
  const [museumTickets, setMuseumTickets] = useState<string[]>(['']);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const router = useRouter();
  
  useEffect(() => {
    const checkAuth = async () => {
      const session = await getSession();
      if (!session || session.user?.role !== 'admin') {
        router.push('/'); // Redirect to an unauthorized page or login
      } else {
        setIsAuthorized(true);
      }
    };
    checkAuth();
  }, [router]);
  
  const handleSubmit = async () => {
    try {
      const packageData = {
        packageName,
        description,
        price: parseFloat(price),
        hotels: hotels.filter((hotel) => hotel.name.trim() !== ''),
        restaurants: restaurants.filter((restaurant) => restaurant.trim() !== ''),
        museumTickets: museumTickets.filter((ticket) => ticket.trim() !== ''),
      };

      const response = await fetch('/api/admin/tourism', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(packageData),
      });

      if (!response.ok) throw new Error('Failed to create package');

      alert('Pacote criado com sucesso!');
      setPackageName('');
      setDescription('');
      setPrice('');
      setHotels([{ id: '', name: '', address: '', pricePerNight: '', availability: '', checkInDate: '', checkOutDate: '' }]);
      setRestaurants(['']);
      setMuseumTickets(['']);
    } catch (error) {
      console.error('Error creating package:', error);
      alert('Erro ao criar pacote');
    }
  };

  const handleHotelInputChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const updatedHotels = [...hotels];
    updatedHotels[index] = { ...updatedHotels[index], [field]: value };
    setHotels(updatedHotels);
  };

  const handleRestaurantChange = (index: number, value: string) => {
    const updatedRestaurants = [...restaurants];
    updatedRestaurants[index] = value;
    setRestaurants(updatedRestaurants);
  };

  const handleMuseumTicketChange = (index: number, value: string) => {
    const updatedMuseumTickets = [...museumTickets];
    updatedMuseumTickets[index] = value;
    setMuseumTickets(updatedMuseumTickets);
  };

  const handleAddHotelField = () => {
    setHotels((prev) => [
      ...prev,
      { id: '', name: '', address: '', pricePerNight: '', availability: '', checkInDate: '', checkOutDate: '' },
    ]);
  };

  const handleRemoveHotelField = (index: number) => {
    setHotels((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddField = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((prev) => [...prev, '']);
  };

  const handleRemoveField = (
    index: number,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-6">Criar Pacote Turístico</h1>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Nome do Pacote</label>
        <input
          type="text"
          value={packageName}
          onChange={(e) => setPackageName(e.target.value)}
          className="input input-bordered w-full"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Descrição</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="textarea textarea-bordered w-full"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Preço</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="input input-bordered w-full"
        />
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Detalhes dos Hotéis (Opcional)</h2>
        {hotels.map((hotel, index) => (
          <div key={index} className="mb-6">
            <div className="flex items-center mb-2">
              <input
                type="text"
                value={hotel.name}
                onChange={(e) => handleHotelInputChange(index, 'name', e.target.value)}
                placeholder="Nome do hotel"
                className="input input-bordered w-full mr-2"
              />
              <button
                type="button"
                onClick={() => handleRemoveHotelField(index)}
                className="btn btn-error"
              >
                Remover
              </button>
            </div>
            <input
              type="text"
              value={hotel.address}
              onChange={(e) => handleHotelInputChange(index, 'address', e.target.value)}
              placeholder="Endereço do hotel"
              className="input input-bordered w-full mb-2"
            />
            <input
              type="number"
              value={hotel.pricePerNight}
              onChange={(e) => handleHotelInputChange(index, 'pricePerNight', e.target.value)}
              placeholder="Preço por noite (€)"
              className="input input-bordered w-full mb-2"
            />
            <input
              type="number"
              value={hotel.availability}
              onChange={(e) => handleHotelInputChange(index, 'availability', e.target.value)}
              placeholder="Disponibilidade de quartos"
              className="input input-bordered w-full mb-2"
            />
            <input
              type="date"
              value={hotel.checkInDate}
              onChange={(e) => handleHotelInputChange(index, 'checkInDate', e.target.value)}
              placeholder="Data de check-in"
              className="input input-bordered w-full mb-2"
            />
            <input
              type="date"
              value={hotel.checkOutDate}
              onChange={(e) => handleHotelInputChange(index, 'checkOutDate', e.target.value)}
              placeholder="Data de check-out"
              className="input input-bordered w-full mb-2"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddHotelField}
          className="btn btn-secondary"
        >
          Adicionar Hotel
        </button>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Restaurantes (Opcional)</h2>
        {restaurants.map((restaurant, index) => (
          <div key={index} className="flex items-center mb-2">
            <input
              type="text"
              value={restaurant}
              onChange={(e) => handleRestaurantChange(index, e.target.value)}
              placeholder="Nome do restaurante"
              className="input input-bordered w-full mr-2"
            />
            <button
              type="button"
              onClick={() => handleRemoveField(index, setRestaurants)}
              className="btn btn-error"
            >
              Remover
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => handleAddField(setRestaurants)}
          className="btn btn-secondary"
        >
          Adicionar Restaurante
        </button>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Bilhetes de Museus (Opcional)</h2>
        {museumTickets.map((ticket, index) => (
          <div key={index} className="flex items-center mb-2">
            <input
              type="text"
              value={ticket}
              onChange={(e) => handleMuseumTicketChange(index, e.target.value)}
              placeholder="Nome do museu"
              className="input input-bordered w-full mr-2"
            />
            <button
              type="button"
              onClick={() => handleRemoveField(index, setMuseumTickets)}
              className="btn btn-error"
            >
              Remover
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => handleAddField(setMuseumTickets)}
          className="btn btn-secondary"
        >
          Adicionar Bilhete de Museu
        </button>
      </div>

      <button onClick={handleSubmit} className="btn btn-primary">
        Criar Pacote
      </button>
    </div>
  );
}
