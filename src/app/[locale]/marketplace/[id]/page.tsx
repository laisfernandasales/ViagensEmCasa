'use client';

import React, { useEffect, useState } from 'react';
import { useCart } from '@/services/cart/CartContext';
import { useParams, useRouter } from 'next/navigation';
import { getSession } from 'next-auth/react';
import Image from 'next/image';

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
  userId: string;
  versionId: string;
}

interface Comment {
  id: string;
  userId: string;
  productId: string;
  text: string;
  rating: number;
  userName: string;
  createdAt: string;
  userImage: string;
}

const useProduct = (productId: string | undefined) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

    const fetchProductAndComments = async () => {
      try {
        const response = await fetch(`/api/marketplace/${productId}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data.product);
          setComments(data.comments);
        } else {
          setProduct(null);
          setComments([]);
        }
      } catch {
        setProduct(null);
        setComments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndComments();
  }, [productId]);

  return { product, comments, setComments, loading };
};

const ProductProfile: React.FC = () => {
  const { addToCart } = useCart();
  const { locale, id } = useParams();
  const router = useRouter();

  const productId = Array.isArray(id) ? id[0] : id;
  const { product, comments, setComments, loading } = useProduct(productId);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [rating, setRating] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      const session = await getSession();
      setUserRole(session?.user?.role || null);
      setUserId(session?.user?.id || null);
    };

    fetchUserRole();
  }, []);

  const handleQuantityChange = (delta: number) =>
    setQuantity((q) => Math.max(1, q + delta));

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        id: product.id,
        productName: product.productName,
        price: parseFloat(product.price),
        image: product.images[currentImageIndex],
        quantity,
        userId: product.userId,
        versionId: product.versionId
      });
    }
  };

  const handleImageChange = (delta: number) => {
    if (product && product.images.length > 1) {
      setCurrentImageIndex(
        (idx) => (idx + delta + product.images.length) % product.images.length
      );
    }
  };

  const handleSelectImage = (index: number) => setCurrentImageIndex(index);

  const getWeightLabel = () =>
    product?.weight.includes('litro') ? 'Conteúdo' : 'Peso';

  const handleCommentSubmit = async () => {
    if (!commentText || rating < 1 || !userId || !productId) {
      alert('Por favor, preencha o comentário e selecione uma avaliação.');
      return;
    }

    try {
      const response = await fetch(`/api/marketplace/${productId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: commentText,
          rating,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit comment');
      }

      const newComment = await response.json();
      setComments((prevComments) => [...prevComments, newComment]);
      setCommentText('');
      setRating(0);
    } catch {
      alert('Erro ao enviar o comentário.');
    }
  };

  const calculateAverageRating = () => {
    if (comments.length === 0) return 0;
    const total = comments.reduce((sum, comment) => sum + comment.rating, 0);
    return (total / comments.length).toFixed(1);
  };

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
    <div className="min-h-screen bg-base-200 flex flex-col justify-center items-center p-6">
      <div className="card w-full max-w-6xl bg-base-100 shadow-xl mb-6">
        <div className="card-body flex flex-col md:flex-row gap-8 h-[660px]">
          <div className="w-full md:w-1/2 relative">
            <div className="relative flex justify-center items-center h-96">
              <Image
                src={product.images[currentImageIndex]}
                alt={`${product.productName} - imagem ${currentImageIndex + 1}`}
                width={400}
                height={400}
                className="w-full h-96 object-cover rounded-lg shadow-md transition-opacity duration-200 ease-in-out"
              />
              {product.images.length > 1 && (
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
              )}
            </div>
            <div className="flex mt-4 space-x-2 justify-center">
              {product.images.map((image, index) => (
                <Image
                  key={index}
                  src={image}
                  alt={`${product.productName} - miniatura ${index + 1}`}
                  width={64}
                  height={64}
                  className={`w-16 h-16 object-cover rounded-lg shadow-md cursor-pointer border-2 ${currentImageIndex === index ? 'border-primary' : 'border-transparent'}`}
                  onClick={() => handleSelectImage(index)}
                />
              ))}
            </div>
          </div>
          <div className="w-full md:w-1/2 flex flex-col justify-between">
            <div>
              <h1 className="card-title text-4xl font-bold">
                {product.productName}
              </h1>
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
              <p className="text-sm mb-4 flex items-center">
                <strong>Avaliação Média:</strong> {calculateAverageRating()}{' '}
                <svg
                  className="w-5 h-5 text-yellow-500 ml-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 .587l3.668 7.451 8.215 1.192-5.938 5.788 1.406 8.204L12 18.9l-7.351 3.872 1.406-8.204-5.938-5.788 8.215-1.192L12 .587z" />
                </svg>
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

      <div className="card w-full max-w-3xl bg-base-100 shadow-xl p-6">
        <h2 className="text-2xl font-bold mb-4">Comentários e Avaliações</h2>
        <div className="mb-4">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="textarea textarea-bordered w-full mb-2"
            placeholder="Escreva seu comentário aqui..."
          ></textarea>
          <div className="flex items-center mb-4">
            <span className="mr-2">Avaliação:</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <label key={star} className="cursor-pointer">
                <input
                  type="radio"
                  name="rating"
                  value={star}
                  checked={rating === star}
                  onChange={() => setRating(star)}
                  className="hidden"
                />
                <svg
                  className={`w-6 h-6 ${
                    rating >= star ? 'text-yellow-500' : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 .587l3.668 7.451 8.215 1.192-5.938 5.788 1.406 8.204L12 18.9l-7.351 3.872 1.406-8.204-5.938-5.788 8.215-1.192L12 .587z" />
                </svg>
              </label>
            ))}
          </div>
          <button className="btn btn-primary" onClick={handleCommentSubmit}>
            Enviar Comentário
          </button>
        </div>

        <div>
          {comments.map((comment) => {
            const commentDate = new Date(comment.createdAt);
            return (
              <div key={comment.id} className="border-b border-gray-200 py-4">
                <div className="flex items-center mb-2">
                  <Image
                    src={comment.userImage} // Imagem do usuário
                    alt={`${comment.userName}'s avatar`}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover mr-3"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-bold">{comment.userName}</span>
                      <span className="text-sm text-gray-500">
                        {commentDate.toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-5 h-5 ${
                              comment.rating >= star
                                ? 'text-yellow-500'
                                : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 .587l3.668 7.451 8.215 1.192-5.938 5.788 1.406 8.204L12 18.9l-7.351 3.872 1.406-8.204-5.938-5.788 8.215-1.192L12 .587z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p>{comment.text}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProductProfile;
