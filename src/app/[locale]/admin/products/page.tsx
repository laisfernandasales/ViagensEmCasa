'use client';

import React, { useState, useEffect } from 'react';

type Product = {
  id: string;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  enabled: boolean;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/admin/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        setProducts(data.products);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleToggleEnabled = async (productId: string, currentState: boolean) => {
    const action = currentState ? 'desabilitar' : 'habilitar';
    if (window.confirm(`Tem certeza que deseja ${action} este produto?`)) {
      try {
        const response = await fetch(`/api/admin/products/${productId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enabled: !currentState }), // Inverte o estado atual
        });
        if (!response.ok) throw new Error(`Failed to ${action} product`);

        setProducts(products.map(product => product.id === productId ? { ...product, enabled: !currentState } : product));
      } catch (error) {
        alert(`Failed to ${action} product`);
      }
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><span className="loading loading-spinner loading-lg"></span></div>;
  if (error) return <div className="flex items-center justify-center min-h-screen"><div className="alert alert-error"><span>{error}</span></div></div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-8">Gestão de Produtos</h1>
      <div className="w-full max-w-4xl">
        <table className="table w-full bg-base-100 shadow-xl rounded-lg">
          <thead>
            <tr>
              <th>Imagem</th>
              <th>Nome</th>
              <th>Descrição</th>
              <th>Preço</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td><img src={product.imageUrl} alt={product.name} className="w-16 h-16 object-cover" /></td>
                <td>{product.name}</td>
                <td>{product.description}</td>
                <td>€{parseFloat(product.price).toFixed(2)}</td>
                <td>{product.enabled ? 'Ativo' : 'Desabilitado'}</td>
                <td>
                  <button
                    onClick={() => handleToggleEnabled(product.id, product.enabled)}
                    className={`btn btn-sm ${product.enabled ? 'btn-error' : 'btn-success'}`}
                  >
                    {product.enabled ? 'Desabilitar' : 'Habilitar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}