'use client';

import { useState } from 'react';
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
      image: image || undefined,
    });
  };

  // Função para converter o erro em string
  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      return error.message;
    }
    return 'Ocorreu um erro desconhecido.';
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200 p-4">
      <div className="card w-full max-w-lg bg-base-100 shadow-xl rounded-lg border border-primary">
        <div className="card-body">
          <h1 className="text-2xl font-semibold mb-6 text-gray-800">Adicionar Produto </h1>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">Nome do Produto</label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary transition duration-200 ease-in-out"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">Descrição</label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary transition duration-200 ease-in-out"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">Preço</label>
              <input
                type="number"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary transition duration-200 ease-in-out"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">Categoria</label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary transition duration-200 ease-in-out"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">Imagem do Produto</label>
              <input
                type="file"
                className="w-full p-3 border border-gray-300 rounded-lg file:border-0 file:bg-blue-100 file:text-blue-700 file:py-2 file:px-4 file:rounded-l-lg hover:file:bg-blue-200 transition duration-200 ease-in-out"
                onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
              />
            </div>
            {error && <p className="text-red-500 mb-4 text-sm">{getErrorMessage(error)}</p>}
            <button
              type="submit"
              className="w-full bg-primary text-white p-3 rounded-lg hover:bg-primary-focus transition duration-200 ease-in-out"
              disabled={loading}
            >
              {loading ? 'Adicionando...' : 'Adicionar Produto'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
