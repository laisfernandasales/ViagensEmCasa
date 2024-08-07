import { useState } from 'react';

interface ProductData {
  productName: string;
  description: string;
  price: string;
  category: string;
  images?: File[];
  stockQuantity: number;
  weight: string;
  productStatus: string;
}

export const useAddProduct = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addProduct = async (productData: ProductData): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      Object.entries(productData).forEach(([key, value]) => {
        if (key === 'images' && value instanceof Array) {
          value.forEach((image, index) => formData.append(`image${index}`, image));
        } else {
          formData.append(key, value.toString());
        }
      });

      const response = await fetch('/api/seller/[id]/add-product', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao adicionar produto');
      }

      console.log('Produto adicionado com sucesso');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('Erro ao adicionar produto:', errorMessage);
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { addProduct, loading, error };
};
