'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useLocale, useTranslations } from 'next-intl';
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

interface Pagination {
  currentPage: number;
  hasNextPage: boolean;
}

const AllProductsPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('allProductsPage');
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.role !== 'seller') {
      router.push('/');
      return;
    }

    const fetchProducts = async (page: number) => {
      try {
        const response = await fetch(`/api/seller/get-all-products?page=${page}`);
        if (!response.ok) throw new Error(t('fetchError'));
        const data = await response.json();
        setProducts(data.products);
        setPagination(data.pagination);
      } catch (error: any) {
        setError(error.message || t('unexpectedError'));
      }
    };

    fetchProducts(currentPage);
  }, [session, status, router, currentPage, t]);

  const handleNextPage = () => {
    if (pagination?.hasNextPage) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prevPage => prevPage - 1);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-200">
        <div className="alert alert-warning shadow-lg">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-200">
        <div className="bg-base-100 p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-base-content">{t('emptyList')}</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-base-100 shadow-lg rounded-lg p-8 border border-base-content/20">
        <h1 className="text-3xl font-bold text-center text-primary mb-6">{t('title')}</h1>
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.id} className="flex items-center justify-between bg-base-200 p-4 rounded-lg shadow-sm">
              <div className="flex items-center w-full">
                {product.images[0] && (
                  <Image
                    src={product.images[0]}
                    alt={product.productName}
                    width={80}
                    height={80}
                    className="object-cover rounded-lg mr-4"
                  />
                )}
                <div className="flex-grow">
                  <h2 className="text-xl font-semibold text-base-content">{product.productName}</h2>
                  <p className="text-base-content">
                    {t('productDetails.price')}: {Number(product.price).toFixed(2)} €
                  </p>
                  <p className="text-base-content">{t('productDetails.category')}: {product.category}</p>
                  <p className="text-base-content">{t('productDetails.status')}: {product.productStatus}</p>
                  <p className="text-base-content">{t('productDetails.stock')}: {product.stockQuantity}</p>
                </div>
                <button
                  className="btn btn-sm btn-primary ml-4"
                  onClick={() => router.push(`/${locale}/profile/edit-product/${product.id}`)}
                >
                  {t('productDetails.edit')}
                </button>
              </div>
            </div>
          ))}
          <div className="flex justify-between mt-6">
            <button
              className="btn btn-sm btn-secondary"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              {t('pagination.previous')}
            </button>
            <button
              className="btn btn-sm btn-primary"
              onClick={handleNextPage}
              disabled={!pagination?.hasNextPage}
            >
              {t('pagination.next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllProductsPage;
