'use client';
import React, { useState } from 'react';
import { useAddProduct } from '../../../../hooks/useAddProduct';

export default function AddProduct() {
  const [productName, setProductName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [image, setImage] = useState<File | null>(null);

  const { addProduct, loading, error } = useAddProduct();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await addProduct({
      productName,
      description,
      price,
      category,
      image: image || undefined, // Passar a imagem se existir
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Adicionar Produto Regional</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Nome do Produto</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded mt-1"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Descrição</label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded mt-1"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Preço</label>
            <input
              type="number"
              className="w-full p-2 border border-gray-300 rounded mt-1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Categoria</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded mt-1"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Imagem do Produto</label>
            <input
              type="file"
              className="w-full p-2 border border-gray-300 rounded mt-1"
              onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
            />
          </div>
          {error && <p className="text-red-500 mb-4">{error.message}</p>}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? 'Adicionando...' : 'Adicionar Produto'}
          </button>
        </form>
      </div>
    </div>
  );
}