'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

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
interface EditProductPageProps {
  readonly params: {
    readonly id: string;
  };
}

export default function EditProductPage({ params }: EditProductPageProps) {
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
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const { id } = params;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/seller/edit-product/${id}`);
        if (!response.ok) throw new Error('Failed to fetch product');
        const data = await response.json();
        const fetchedProduct = data.product;

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
        setExistingImages(fetchedProduct.images);
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
    if (value >= 0) setStockQuantity(value);
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
    if (existingImages.length + images.length <= 1) {
      alert('É obrigatório um produto possuir pelo menos uma imagem.');
      return;
    }

    if (index < existingImages.length) {
      setExistingImages(prevImages => prevImages.filter((_, i) => i !== index));
    } else {
      setImages(prevImages => prevImages.filter((_, i) => i !== index - existingImages.length));
    }

    setImagePreviews(prevPreviews => prevPreviews.filter((_, i) => i !== index));
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

      existingImages.forEach(url => formData.append('existingImages', url));
      images.forEach(image => formData.append('images', image));

      const response = await fetch(`/api/seller/edit-product/${id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to update product');
      alert('Produto atualizado com sucesso!');
      router.back();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-base-100 shadow-lg rounded-lg p-8 border border-base-content/20">
        <h2 className="text-3xl font-bold text-center text-primary mb-8">Editar Produto</h2>
        {error && <p className="text-red-500 mb-4 text-sm text-center">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="productName" className="block text-sm font-medium mb-2">Nome do Produto</label>
            <input
              type="text"
              id="productName"
              className="input input-bordered w-full"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium mb-2">Descrição</label>
            <textarea
              id="description"
              className="textarea textarea-bordered w-full h-24"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>
          <div className="mb-4">
            <label htmlFor="price" className="block text-sm font-medium mb-2">Preço (€)</label>
            <input
              type="number"
              id="price"
              className="input input-bordered w-full"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="category" className="block text-sm font-medium mb-2">Categoria</label>
            <input
              type="text"
              id="category"
              className="input input-bordered w-full"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="stockQuantity" className="block text-sm font-medium mb-2">Quantidade em Estoque</label>
            <input
              type="number"
              id="stockQuantity"
              className="input input-bordered w-full"
              value={stockQuantity}
              onChange={handleStockQuantityChange}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="weight" className="block text-sm font-medium mb-2">{label}</label>
            <div className="flex items-center">
              <input
                type="text"
                id="weight"
                className="input input-bordered w-full"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
              />
              <select
                id="unit"
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
            <label htmlFor="productStatus" className="block text-sm font-medium mb-2">Status do Produto</label>
            <select
              id="productStatus"
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
  <label htmlFor="productImages" className="block text-sm font-medium mb-2">Imagens do Produto</label>
  <div className="flex items-center mb-4">
    <label htmlFor="productImages" className="btn btn-outline btn-secondary mr-2">
      Escolher Imagens
    </label>
    <input
      id="productImages"
      type="file"
      accept="image/*"
      multiple
      onChange={handleImageChange}
      className="hidden"
    />
    <div className="flex flex-wrap gap-2">
      {imagePreviews.map((preview, index) => (
        <div key={`${preview}-${index}`} className="relative w-24 h-24">
          <Image 
            src={preview} 
            alt="Imagem do produto" 
            layout="fill" 
            objectFit="cover" 
            className="rounded-lg" 
          />
          <button
            type="button"
            className="absolute top-0 right-0 p-1 bg-red-600 text-white rounded-full"
            onClick={() => handleRemoveImage(index)}
          >
            X
          </button>
        </div>
      ))}
    </div>
  </div>
</div>
<button
  type="submit"
  className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
  disabled={loading}
>
  {loading ? 'Atualizando...' : 'Atualizar Produto'}
</button>
        </form>
      </div>
    </div>
  );
}
