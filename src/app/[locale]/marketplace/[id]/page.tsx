'use client';

import React, { useEffect, useState } from "react";
import { useCart } from "@/services/cart/CartContext";
import { useParams, useRouter } from "next/navigation";
import { getSession } from "next-auth/react";

interface Product {
  id: string;
  productName: string;
  description: string;
  price: string;
  category: string;
  stockQuantity: number;
  weight: string;
  productStatus: string;
  images: string[];
}

const useProduct = (productId: string | undefined) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/marketplace/${productId}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data.product);
        } else {
          setProduct(null);
        }
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  return { product, loading };
};

const ProductProfile: React.FC = () => {
  const { addToCart } = useCart();
  const { locale, id } = useParams();
  const router = useRouter();

  const productId = Array.isArray(id) ? id[0] : id;
  const { product, loading } = useProduct(productId);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      const session = await getSession();
      setUserRole(session?.user?.role || null);
    };

    fetchUserRole();
  }, []);

  const handleQuantityChange = (delta: number) => setQuantity(q => Math.max(1, q + delta));

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        id: product.id,
        productName: product.productName,
        price: parseFloat(product.price),
        image: product.images[currentImageIndex],
        quantity,
      });
    }
  };

  const handleImageChange = (delta: number) => {
    if (product) {
      setCurrentImageIndex(idx => (idx + delta + product.images.length) % product.images.length);
    }
  };

  const handleSelectImage = (index: number) => setCurrentImageIndex(index);

  const getWeightLabel = () => product?.weight.includes("litro") ? "Conteúdo" : "Peso";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!product) {
    return <p className="text-center text-red-600">Produto não encontrado</p>;
  }

  return (
    <div className="min-h-screen bg-base-200 flex justify-center items-center p-6">
      <div className="card w-full max-w-6xl bg-base-100 shadow-xl">
        <div className="card-body flex flex-col md:flex-row gap-8 h-[660px]">
          <div className="w-full md:w-1/2 relative">
            <div className="relative flex justify-center items-center h-96">
              <img
                src={product.images[currentImageIndex]}
                alt={`${product.productName} - imagem ${currentImageIndex + 1}`}
                className="w-full h-96 object-cover rounded-lg shadow-md transition-opacity duration-200 ease-in-out"
              />
              <div className="absolute inset-y-1/2 flex justify-between w-full px-3">
                <button
                  onClick={() => handleImageChange(-1)}
                  className="btn btn-circle"
                  aria-label="Imagem anterior"
                >
                  ❮
                </button>
                <button
                  onClick={() => handleImageChange(1)}
                  className="btn btn-circle"
                  aria-label="Próxima imagem"
                >
                  ❯
                </button>
              </div>
            </div>
            <div className="flex mt-4 space-x-2 justify-center">
              {product.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${product.productName} - miniatura ${index + 1}`}
                  className={`w-16 h-16 object-cover rounded-lg shadow-md cursor-pointer border-2 ${
                    currentImageIndex === index ? "border-primary" : "border-transparent"
                  }`}
                  onClick={() => handleSelectImage(index)}
                />
              ))}
            </div>
          </div>
          <div className="w-full md:w-1/2 flex flex-col justify-between">
            <div>
              <h1 className="card-title text-4xl font-bold">{product.productName}</h1>
              <p className="text-3xl font-bold text-green-700 dark:text-green-400 mb-4 mt-2">
                €{product.price}
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
              <p className="text-lg mb-8 max-h-40 overflow-auto">
                {product.description}
              </p>
            </div>
            <div className="flex items-center justify-between mb-4">
              <button
                className="btn btn-outline btn-primary w-44"
                onClick={() => router.push(`/${locale}/marketplace`)}
              >
                Voltar
              </button>
              {userRole !== 'seller' && userRole !== 'admin' && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="btn btn-outline btn-sm"
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
                    onClick={() => handleQuantityChange(1)}
                    className="btn btn-outline btn-sm"
                  >
                    +
                  </button>
                  <button
                    className="btn btn-primary transform transition-transform duration-200 hover:scale-105 w-44"
                    onClick={handleAddToCart}
                  >
                    Adicionar ao Carrinho
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductProfile;
