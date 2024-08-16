'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { getSession } from 'next-auth/react';

interface Package {
  id: string;
  packageName: string;
  description: string;
  price: number;
  hotels: { name: string; address: string; pricePerNight: string; availability: string; checkInDate: string; checkOutDate: string; }[];
  restaurants: string[];
  museumTickets: string[];
}

export default function TourPackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

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

  useEffect(() => {
    if (isAuthorized) {
      const fetchPackages = async () => {
        try {
          const response = await fetch('/api/admin/tourism');
          if (!response.ok) throw new Error('Failed to fetch packages');
          const data = await response.json();
          setPackages(data.packages);
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Failed to fetch packages');
        } finally {
          setLoading(false);
        }
      };

      fetchPackages();
    }
  }, [isAuthorized]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return isAuthorized ? (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-6">Lista de Pacotes Turísticos</h1>
      <button 
        onClick={() => router.push(`${pathname}/add-tourism`)}
        className="btn btn-primary mb-6"
      >
        Criar Novo Pacote
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div key={pkg.id} className="card bg-base-100 shadow-xl p-4">
            <h2 className="text-2xl font-semibold mb-2">{pkg.packageName}</h2>
            <p className="text-sm mb-4">{pkg.description}</p>
            <p className="text-lg font-bold">Preço: €{pkg.price.toFixed(2)}</p>
            <h3 className="text-xl font-semibold mt-4">Hotéis:</h3>
            {pkg.hotels.length > 0 ? (
              <ul className="list-disc list-inside">
                {pkg.hotels.map((hotel, index) => (
                  <li key={index}>
                    {hotel.name} - {hotel.address} (Check-in: {hotel.checkInDate}, Check-out: {hotel.checkOutDate})
                  </li>
                ))}
              </ul>
            ) : (
              <p>Sem hotéis incluídos</p>
            )}
            <h3 className="text-xl font-semibold mt-4">Restaurantes:</h3>
            {pkg.restaurants.length > 0 ? (
              <ul className="list-disc list-inside">
                {pkg.restaurants.map((restaurant, index) => (
                  <li key={index}>{restaurant}</li>
                ))}
              </ul>
            ) : (
              <p>Sem restaurantes incluídos</p>
            )}
            <h3 className="text-xl font-semibold mt-4">Bilhetes de Museus:</h3>
            {pkg.museumTickets.length > 0 ? (
              <ul className="list-disc list-inside">
                {pkg.museumTickets.map((ticket, index) => (
                  <li key={index}>{ticket}</li>
                ))}
              </ul>
            ) : (
              <p>Sem bilhetes de museus incluídos</p>
            )}
          </div>
        ))}
      </div>
    </div>
  ) : null;
}
