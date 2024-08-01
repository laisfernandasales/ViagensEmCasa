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
  images: string[]; // Alterado para suportar várias imagens
}

const ProductProfile: React.FC = () => {
  const { addToCart } = useCart();
  const params = useParams();
  const ProductId = params.id;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
        image: product.images[currentImageIndex], // Usa a imagem atual como a principal no carrinho
        quantity,
      });
    }
  };

  const handleNextImage = () => {
    if (product) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % product.images.length);
    }
  };

  const handlePrevImage = () => {
    if (product) {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + product.images.length) % product.images.length);
    }
  };

  const getWeightLabel = () => {
    if (product?.weight.includes('litro')) {
      return 'Conteúdo';
    }
    return 'Peso';
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
          {/* Carousel de Imagens do Produto */}
          <div className="w-full md:w-1/2 relative">
            <img
              src={product.images[currentImageIndex]}
              alt={`${product.productName} - imagem ${currentImageIndex + 1}`}
              className="w-full h-auto object-cover rounded-lg shadow-md"
            />
            <button
              onClick={handlePrevImage}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 btn btn-circle"
              disabled={product.images.length <= 1}
            >
              ❮
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 btn btn-circle"
              disabled={product.images.length <= 1}
            >
              ❯
            </button>
          </div>

          {/* Detalhes do Produto */}
          <div className="w-full md:w-1/2">
            <h1 className="card-title text-4xl font-bold">
              {product.productName}
            </h1>
           
            <p className="text-3xl font-bold text-green-700 dark:text-green-400 mb-4">
              {product.price}
            </p>

            <p className="text-sm mb-4">
              <strong>Categoria:</strong> {product.category}
            </p>

            <p className="text-sm mb-4">
              <strong>Quantidade em Estoque:</strong> {product.stockQuantity}
            </p>

            <p className="text-sm mb-4">
              <strong>{getWeightLabel()}:</strong> {product.weight}
            </p>

            <p className="text-sm mb-4">
              <strong>Status do Produto:</strong> {product.productStatus}
            </p>
            <p className="text-lg mb-4">
              {product.description}
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