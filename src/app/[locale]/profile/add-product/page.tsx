'use client';

import { useState } from 'react';
import { useAddProduct } from '../../../../hooks/useAddProduct';

export default function AddProduct() {
  const [productName, setProductName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [images, setImages] = useState<FileList | null>(null);
  const [stockQuantity, setStockQuantity] = useState<number>(0);
  const [weight, setWeight] = useState<string>('');
  const [unit, setUnit] = useState<string>('kg');
  const [label, setLabel] = useState<string>('Peso'); // Estado para o rótulo
  const [productStatus, setProductStatus] = useState<string>('Disponível');

  const { addProduct, loading, error } = useAddProduct();

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUnit = e.target.value;
    setUnit(selectedUnit);
    setLabel(selectedUnit === 'kg' ? 'Peso' : 'Conteúdo'); // Muda o rótulo conforme a unidade
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await addProduct({
      productName,
      description,
      price: `${price} EUR`,
      category,
      images: images || undefined,
      stockQuantity,
      weight: `${weight} ${unit}`,
      productStatus,
    });
  };

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      return error.message;
    }
    return 'Ocorreu um erro desconhecido.';
  };

  const handleStockQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value >= 0) {
      setStockQuantity(value);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200 p-4">
      <div className="card w-full max-w-lg bg-base-100 shadow-xl rounded-lg p-6">
        <div className="card-body">
          <h1 className="text-2xl font-semibold mb-6 text-center">Adicionar Produto</h1>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Nome do Produto</label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Descrição</label>
              <textarea
                className="textarea textarea-bordered w-full h-24"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Preço (€)</label>
              <input
                type="number"
                className="input input-bordered w-full"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Categoria</label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Quantidade em Estoque</label>
              <input
                type="number"
                className="input input-bordered w-full"
                value={stockQuantity}
                onChange={handleStockQuantityChange}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">{label}</label>
              <div className="flex items-center">
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  required
                />
                <select
                  className="select select-bordered ml-2"
                  value={unit}
                  onChange={handleUnitChange}
                >
                  <option value="kg">kg</option>
                  <option value="litros">litros</option>
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Imagens do Produto</label>
              <input
                type="file"
                className="input input-bordered w-full file:border-0 file:bg-blue-100 file:text-blue-700 file:py-2 file:px-4 file:rounded-l-lg hover:file:bg-blue-200 transition duration-200 ease-in-out"
                onChange={(e) => setImages(e.target.files)}
                multiple
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Status do Produto</label>
              <select
                className="select select-bordered w-full"
                value={productStatus}
                onChange={(e) => setProductStatus(e.target.value)}
                required
              >
                <option value="Disponível">Disponível</option>
                <option value="Indisponível">Indisponível</option>
              </select>
            </div>
            {error && <p className="text-red-500 mb-4 text-sm">{getErrorMessage(error)}</p>}
            <button
              type="submit"
              className="btn btn-primary w-full"
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
