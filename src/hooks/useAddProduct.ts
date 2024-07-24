import { useState } from 'react';

interface ProductData {
  productName: string;
  description: string;
  price: string;
  category: string;
}

export const useAddProduct = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const addProduct = async ({ productName, description, price, category }: ProductData) => {
    setLoading(true);
    setError(null);

    try {
        const response = await fetch('/api/seller/[id]/add-product', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({ productName, description, price, category }),
          });

      if (!response.ok) {
        throw new Error('Erro ao adicionar produto');
      }

      console.log("Produto adicionado com sucesso");
    } catch (e) {
      console.error("Erro ao adicionar produto: ", e);
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  };

  return { addProduct, loading, error };
};
