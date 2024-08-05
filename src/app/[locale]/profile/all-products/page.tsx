"use client";  // Marca o componente como um Client Component

import React, { useEffect, useState } from 'react';
import { auth } from '@/services/auth/auth';  // Importando a autenticação

type Product = {
  id: string;
  productName: string;
  description: string;
  price: string;
  category: string;
  stockQuantity: string;
  weight: string;
  productStatus: string;
  images: string[];
};

export default function UserProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserId() {
      try {
        const session = await auth();
        if (session && session.user) {
          setUserId(session.user.id);
        }
      } catch (error) {
        console.error('Erro ao obter sessão do usuário:', error);
      }
    }

    fetchUserId();
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      if (userId) {
        try {
          const response = await fetch(`/api/seller/${userId}/all-products`);
          if (response.ok) {
            const data = await response.json();
            setProducts(data.products);
          } else {
            console.error('Erro ao buscar produtos:', response.statusText);
          }
        } catch (error) {
          console.error('Erro ao buscar produtos:', error);
        }
      }
    }

    fetchProducts();
  }, [userId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-8">Produtos do Usuário</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {products.map(product => (
          <div key={product.id} className="p-4 border rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold">{product.productName}</h2>
            <p>{product.description}</p>
            <p className="text-xl font-bold">R$ {parseFloat(product.price).toFixed(2)}</p>
            {product.images.length > 0 && (
              <img src={product.images[0]} alt={product.productName} className="w-full h-auto" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
