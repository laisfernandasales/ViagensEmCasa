'use client';

import { useState, useEffect } from 'react';
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

export default function EditProductPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [productName, setProductName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [stockQuantity, setStockQuantity] = useState<number>(0);
  const [weight, setWeight] = useState<string>('');
  const [unit, setUnit] = useState<string>('kg');
  const [label, setLabel] = useState<string>('Peso');
  const [productStatus, setProductStatus] = useState<string>('Disponível');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]); // Track existing images

  const { id } = params;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/seller/edit-product/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }
        const data = await response.json();
        const fetchedProduct = data.product;

        // Set product details to state
        setProductName(fetchedProduct.productName);
        setDescription(fetchedProduct.description);
        setPrice(fetchedProduct.price.toString());
        setCategory(fetchedProduct.category);
        setStockQuantity(fetchedProduct.stockQuantity);
        const [weightValue, weightUnit] = fetchedProduct.weight.split(' ');
        setWeight(weightValue);
        setUnit(weightUnit);
        setLabel(weightUnit === 'kg' ? 'Peso' : 'Conteúdo');
        setProductStatus(fetchedProduct.productStatus);
        setImagePreviews(fetchedProduct.images);
        setExistingImages(fetchedProduct.images); // Store existing images
      } catch (error: any) {
        setError(error.message);
      }
    };

    if (session) {
      fetchProduct();
    }
  }, [session, id]);

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUnit = e.target.value;
    setUnit(selectedUnit);
    setLabel(selectedUnit === 'kg' ? 'Peso' : 'Conteúdo');
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
    // Check if there is only one image left (existing + new)
    if (existingImages.length + images.length <= 1) {
      alert('É obrigatório um produto possuir pelo menos uma imagem.');
      return;
    }

    // Remove from existing images if it's there, otherwise from new images
    if (index < existingImages.length) {
      setExistingImages((prevImages) => {
        const updatedImages = [...prevImages];
        updatedImages.splice(index, 1);
        return updatedImages;
      });
    } else {
      const newIndex = index - existingImages.length;
      setImages((prevImages) => {
        const updatedImages = [...prevImages];
        updatedImages.splice(newIndex, 1);
        return updatedImages;
      });
    }

    setImagePreviews((prevPreviews) => {
      const updatedPreviews = [...prevPreviews];
      updatedPreviews.splice(index, 1);
      return updatedPreviews;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('productName', productName);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('category', category);
      formData.append('stockQuantity', stockQuantity.toString());
      formData.append('weight', `${weight} ${unit}`);
      formData.append('productStatus', productStatus);

      existingImages.forEach((url) => formData.append('existingImages', url));
      images.forEach((image) => formData.append('images', image));

      const response = await fetch(`/api/seller/edit-product/${id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      alert('Product updated successfully!');
      router.back();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200 p-4">
      <div className="card w-full max-w-lg bg-base-100 shadow-xl rounded-lg p-6">
        <div className="card-body">
          <h1 className="text-2xl font-semibold mb-6 text-center">Editar Produto</h1>
          {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
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

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Atualizando...' : 'Atualizar Produto'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
