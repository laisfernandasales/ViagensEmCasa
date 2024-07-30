import { useState } from 'react';

interface ProductData {
  productName: string;
  description: string;
  price: string;
  category: string;
  image?: File;
  stockQuantity: number;
  weight: string;
  productStatus: string;
}

export const useAddProduct = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const addProduct = async ({
    productName,
    description,
    price,
    category,
    image,
    stockQuantity,
    weight,
    productStatus,
  }: ProductData) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('productName', productName);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('category', category);
      if (image) {
        formData.append('image', image);
      }
      formData.append('stockQuantity', stockQuantity.toString());
      formData.append('weight', weight);
      formData.append('productStatus', productStatus);

      const response = await fetch('/api/seller/[id]/add-product', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro ao adicionar produto');
      }

      console.log('Produto adicionado com sucesso');
    } catch (e) {
      console.error('Erro ao adicionar produto: ', e);
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  };

  return { addProduct, loading, error };
};
