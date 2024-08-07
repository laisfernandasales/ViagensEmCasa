'use client';

import { useState } from 'react';
import { useAddProduct } from '../../../../hooks/useAddProduct';

export default function AddProduct() {
  const [productData, setProductData] = useState({
    productName: '',
    description: '',
    price: '',
    category: '',
    images: [] as File[],
    imagePreviews: [] as string[],
    stockQuantity: 0,
    weight: '',
    unit: 'kg',
    label: 'Peso',
    productStatus: 'Disponível',
  });

  // Correctly typed error to handle both Error and null
  const { addProduct, loading, error } = useAddProduct();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (name === 'images' && files) {
      const newFiles = Array.from(files);
      if (productData.images.length + newFiles.length > 10) {
        alert('Você só pode adicionar até 10 imagens.');
        return;
      }
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setProductData((prev) => ({
        ...prev,
        images: [...prev.images, ...newFiles],
        imagePreviews: [...prev.imagePreviews, ...newPreviews],
      }));
    } else if (name === 'stockQuantity') {
      const stockValue = Number(value);
      if (stockValue >= 0) setProductData((prev) => ({ ...prev, stockQuantity: stockValue }));
    } else {
      setProductData((prev) => ({
        ...prev,
        [name]: value,
        ...(name === 'unit' && { label: value === 'kg' ? 'Peso' : 'Conteúdo' }),
      }));
    }
  };

  const handleRemoveImage = (index: number) => {
    setProductData((prev) => {
      const updatedImages = prev.images.filter((_, i) => i !== index);
      const updatedPreviews = prev.imagePreviews.filter((_, i) => i !== index);
      return { ...prev, images: updatedImages, imagePreviews: updatedPreviews };
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { images, ...data } = productData;
    await addProduct({
      ...data,
      price: `${data.price} EUR`,
      weight: `${data.weight} ${data.unit}`,
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200 p-4">
      <div className="card w-full max-w-lg bg-base-100 shadow-xl rounded-lg p-6">
        <div className="card-body">
          <h1 className="text-2xl font-semibold mb-6 text-center">Adicionar Produto</h1>
          <form onSubmit={handleSubmit}>
            {[
              { label: 'Nome do Produto', name: 'productName', type: 'text' },
              { label: 'Descrição', name: 'description', type: 'textarea' },
              { label: 'Preço (€)', name: 'price', type: 'number' },
              { label: 'Categoria', name: 'category', type: 'text' },
              { label: 'Quantidade em Estoque', name: 'stockQuantity', type: 'number' },
            ].map(({ label, name, type }) => (
              <div className="mb-4" key={name}>
                <label className="block text-sm font-medium mb-2">{label}</label>
                {type === 'textarea' ? (
                  <textarea
                    className="textarea textarea-bordered w-full h-24"
                    name={name}
                    value={(productData as any)[name]}
                    onChange={handleChange}
                    required
                  ></textarea>
                ) : (
                  <input
                    type={type}
                    name={name}
                    className="input input-bordered w-full"
                    value={(productData as any)[name]}
                    onChange={handleChange}
                    required
                  />
                )}
              </div>
            ))}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">{productData.label}</label>
              <div className="flex items-center">
                <input
                  type="text"
                  name="weight"
                  className="input input-bordered w-full"
                  value={productData.weight}
                  onChange={handleChange}
                  required
                />
                <select
                  name="unit"
                  className="select select-bordered ml-2"
                  value={productData.unit}
                  onChange={handleChange}
                >
                  <option value="kg">kg</option>
                  <option value="litros">litros</option>
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Status do Produto</label>
              <select
                name="productStatus"
                className="select select-bordered w-full"
                value={productData.productStatus}
                onChange={handleChange}
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
                    name="images"
                    className="hidden"
                    onChange={handleChange}
                    multiple
                  />
                </label>
                {productData.images.length > 0 && (
                  <span className="text-sm">
                    {productData.images.length} ficheiro(s) selecionado(s)
                  </span>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {productData.imagePreviews.map((preview, index) => (
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
            {error && (
              <p className="text-red-500 mb-4 text-sm">
                {typeof error === 'string' ? error : 'Ocorreu um erro desconhecido.'}
              </p>
            )}
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? 'Adicionando...' : 'Adicionar Produto'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
