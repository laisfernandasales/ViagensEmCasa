"use client";  

import { useCart } from '@/services/cart/CartContext';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface Product {
  id: string;
  productName: string;
  description: string;
  price: string;
  category: string;
  stockQuantity: number;
  weight: string;
  productStatus: string;
  image: string;
}

const ProductProfile: React.FC = () => {
  const { addToCart } = useCart();
  const params = useParams();
  const ProductId = params.id;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (ProductId) {
      const fetchProduct = async () => {
        try {
          const response = await fetch(`/api/marketplace/${ProductId}`);
          if (response.ok) {
            const data = await response.json();
            setProduct(data.product);
          } else {
            console.error('Product not found');
          }
        } catch (error) {
          console.error('Failed to fetch product', error);
        } finally {
          setLoading(false);
        }
      };

      fetchProduct();
    }
  }, [ProductId]);

  const handleIncrease = () => {
    setQuantity((prevQuantity) => prevQuantity + 1);
  };

  const handleDecrease = () => {
    setQuantity((prevQuantity) => (prevQuantity > 1 ? prevQuantity - 1 : 1));
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        id: product.id,
        productName: product.productName,
        price: parseFloat(product.price),
        image: product.image,
        quantity,
      });
    }
  };

  if (loading) {
    return <p className="text-center text-gray-600">Carregando...</p>;
  }

  if (!product) {
    return <p className="text-center text-red-600">Produto não encontrado</p>;
  }

  return (
    <div className="min-h-screen bg-base-200 flex justify-center items-center p-6">
      <div className="card w-full max-w-6xl bg-base-100 shadow-xl">
        <div className="card-body flex flex-col md:flex-row gap-8">
          {/* Imagem do Produto */}
          <div className="w-full md:w-1/2">
            <img
              src={product.image}
              alt={product.productName}
              className="w-full h-auto object-cover rounded-lg shadow-md"
            />
          </div>

          {/* Detalhes do Produto */}
          <div className="w-full md:w-1/2">
            <h1 className="card-title text-4xl font-bold">
              {product.productName}
            </h1>
            <p className="text-lg mb-4">
              {product.description}
            </p>

            <p className="text-3xl font-bold text-green-700 dark:text-green-400 mb-4">
              {product.price}€
            </p>

            <p className="text-sm mb-4">
              <strong>Categoria:</strong> {product.category}
            </p>

            <p className="text-sm mb-4">
              <strong>Quantidade em Estoque:</strong> {product.stockQuantity}
            </p>

            <p className="text-sm mb-4">
              <strong>Peso:</strong> {product.weight} kg
            </p>

            <p className="text-sm mb-4">
              <strong>Status do Produto:</strong> {product.productStatus}
            </p>

            {/* Controle de Quantidade e Botão */}
            <div className="flex items-center mb-4">
              <button
                onClick={handleDecrease}
                className="btn btn-outline btn-sm mr-2"
              >
                -
              </button>
              <input
                type="text"
                value={quantity}
                readOnly
                className="input input-bordered w-12 text-center"
              />
              <button
                onClick={handleIncrease}
                className="btn btn-outline btn-sm ml-2"
              >
                +
              </button>
              <button className="btn btn-primary ml-4" onClick={handleAddToCart}>
                Adicionar ao Carrinho
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductProfile;
