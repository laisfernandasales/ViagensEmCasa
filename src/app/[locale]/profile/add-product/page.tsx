'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useAddProduct } from '@/hooks/useAddProduct';
import Image from 'next/image';

interface Category {
  id: string;
  name: string;
  enabled: true;
}

export default function AddProduct() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [productName, setProductName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [stockQuantity, setStockQuantity] = useState<number>(0);
  const [weight, setWeight] = useState<string>('');
  const [unit, setUnit] = useState<string>('kg');
  const [label, setLabel] = useState<string>('Peso');
  const [productStatus, setProductStatus] = useState<string>('Disponível');

  const { addProduct, loading, error } = useAddProduct();

  useEffect(() => {
    if (status === 'loading') return; // Aguarda o status da sessão ser carregado

    if (status === 'unauthenticated' || session?.user?.role !== 'seller') {
      router.push('/'); // Redireciona para a página de login se não for autenticado ou não for vendedor
    }
  }, [status, session, router]);

  useEffect(() => {
    // Busca as categorias do backend
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(data.categories);
        setCategory(data.categories.length > 0 ? data.categories[0].id : ''); // Define a primeira categoria como selecionada por padrão
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUnit = e.target.value;
    setUnit(selectedUnit);
    setLabel(selectedUnit === 'kg' ? 'Peso' : 'Conteúdo');
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    // Encontra o nome da categoria selecionada
    const selectedCategory = categories.find(cat => cat.id === category);
    const categoryName = selectedCategory ? selectedCategory.name : '';
  
    await addProduct({
      productName,
      description,
      price: `${price} EUR`,
      category: categoryName,  // Envia o nome da categoria ao invés do ID
      images,
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);

      if (images.length + newFiles.length > 10) {
        alert('Você só pode adicionar até 10 imagens.');
        return;
      }

      setImages((prevImages) => [...prevImages, ...newFiles]);

      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(prevPreviews => [...prevPreviews, ...newPreviews]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prevImages) => {
      const updatedImages = [...prevImages];
      updatedImages.splice(index, 1);
      return updatedImages;
    });

    setImagePreviews((prevPreviews) => {
      const updatedPreviews = [...prevPreviews];
      updatedPreviews.splice(index, 1);
      return updatedPreviews;
    });
  };

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

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
              <select
                className="select select-bordered w-full"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                {categories
                  .filter((cat) => cat.enabled) // Filtra as categorias que têm enabled como true
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
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

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Imagens do Produto</label>
              <div className="flex items-center">
                <label className="btn btn-outline mr-2">
                  Escolher Ficheiros
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleImageChange}
                    multiple
                  />
                </label>
                {images.length > 0 && (
                  <span className="text-sm">{images.length} ficheiro(s) selecionado(s)</span>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <Image
                      src={preview}
                      alt={`Imagem ${index + 1}`}
                      width={96}
                      height={96}
                      className="w-24 h-24 object-cover rounded-lg shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-0 right-0 p-1 bg-red-600 text-white rounded-full text-xs"
                      aria-label="Remover imagem"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
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