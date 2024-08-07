'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface Product {
  id: string;
  productName: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stockQuantity: number;
  weight: string;
  productStatus: string;
}

export default function EditProductPage({ params: { id } }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [productData, setProductData] = useState<Product | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/seller/edit-product/${id}`);
        if (!response.ok) throw new Error('Failed to fetch product');
        const data = await response.json();
        const fetchedProduct = data.product;
        setProductData({
          ...fetchedProduct,
          price: fetchedProduct.price.toString(),
          weight: fetchedProduct.weight.split(' ')[0],
        });
        setImagePreviews(fetchedProduct.images);
        setExistingImages(fetchedProduct.images);
      } catch (error: any) {
        setError(error.message || 'Failed to load product data.');
      }
    };

    if (session) fetchProduct();
  }, [session, id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'stockQuantity') {
      setProductData((prev) => prev && { ...prev, [name]: Math.max(0, parseInt(value, 10)) });
    } else if (name === 'weight') {
      setProductData((prev) => prev && { ...prev, weight: value });
    } else {
      setProductData((prev) => prev && { ...prev, [name]: value });
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
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setImagePreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
    }
  };

  const handleRemoveImage = (index: number) => {
    if (existingImages.length + images.length <= 1) {
      alert('É obrigatório um produto possuir pelo menos uma imagem.');
      return;
    }

    if (index < existingImages.length) {
      setExistingImages((prevImages) => prevImages.filter((_, i) => i !== index));
    } else {
      const newIndex = index - existingImages.length;
      setImages((prevImages) => prevImages.filter((_, i) => i !== newIndex));
    }

    setImagePreviews((prevPreviews) => prevPreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!productData) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      Object.entries(productData).forEach(([key, value]) => formData.append(key, value.toString()));
      existingImages.forEach((url) => formData.append('existingImages', url));
      images.forEach((image) => formData.append('images', image));

      const response = await fetch(`/api/seller/edit-product/${id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to update product');

      alert('Product updated successfully!');
      router.back();
    } catch (error: any) {
      setError(error.message || 'An error occurred during product update.');
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please log in to view your products.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!productData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200 p-4">
      <div className="card w-full max-w-lg bg-base-100 shadow-xl rounded-lg p-6">
        <div className="card-body">
          <h1 className="text-2xl font-semibold mb-6 text-center">Editar Produto</h1>
          <form onSubmit={handleSubmit}>
            {[
              { label: 'Nome do Produto', name: 'productName', type: 'text', value: productData.productName },
              { label: 'Descrição', name: 'description', type: 'textarea', value: productData.description },
              { label: 'Preço (€)', name: 'price', type: 'number', value: productData.price },
              { label: 'Categoria', name: 'category', type: 'text', value: productData.category },
              { label: 'Quantidade em Estoque', name: 'stockQuantity', type: 'number', value: productData.stockQuantity },
              { label: 'Peso', name: 'weight', type: 'text', value: productData.weight },
            ].map(({ label, name, type, value }) => (
              <div className="mb-4" key={name}>
                <label className="block text-sm font-medium mb-2">{label}</label>
                {type === 'textarea' ? (
                  <textarea
                    name={name}
                    className="textarea textarea-bordered w-full h-24"
                    value={value}
                    onChange={handleInputChange}
                    required
                  />
                ) : (
                  <input
                    type={type}
                    name={name}
                    className="input input-bordered w-full"
                    value={value}
                    onChange={handleInputChange}
                    required
                  />
                )}
              </div>
            ))}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Unidade</label>
              <select
                name="unit"
                className="select select-bordered w-full"
                value={productData.weight.split(' ')[1]}
                onChange={handleInputChange}
                required
              >
                <option value="kg">kg</option>
                <option value="litros">litros</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Status do Produto</label>
              <select
                name="productStatus"
                className="select select-bordered w-full"
                value={productData.productStatus}
                onChange={handleInputChange}
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
                  <input type="file" className="hidden" onChange={handleImageChange} multiple />
                </label>
                {images.length > 0 && (
                  <span className="text-sm">{images.length} ficheiro(s) selecionado(s)</span>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Imagem ${index + 1}`}
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
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? 'Atualizando...' : 'Atualizar Produto'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
