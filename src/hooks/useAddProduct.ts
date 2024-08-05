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
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const addProduct = async ({
    productName,
    description,
    price,
    category,
    images,
    stockQuantity,
    weight,
    productStatus,
  }: ProductData): Promise<{ success: boolean }> => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('productName', productName);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('category', category);
      formData.append('stockQuantity', stockQuantity.toString());
      formData.append('weight', weight);
      formData.append('productStatus', productStatus);

      if (images) {
        images.forEach((image, index) => {
          formData.append(`image${index}`, image); // Adiciona cada arquivo
        });
      }

      const response = await fetch('/api/seller/[id]/add-product', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro ao adicionar produto');
      }

      console.log('Produto adicionado com sucesso');
      return { success: true }; // Retorna sucesso
    } catch (e) {
      console.error('Erro ao adicionar produto: ', e);
      setError(e as Error);
      return { success: false }; // Retorna falha
    } finally {
      setLoading(false);
    }
  };

  return { addProduct, loading, error };
};
