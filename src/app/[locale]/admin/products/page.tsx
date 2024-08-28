'use client';

import React, { useState, useEffect } from 'react';
import { useSession, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

type Product = {
  id: string;
  productName: string;
  description: string;
  price: string;
  images: string[];
  enabled: boolean;
  username: string;
  companyName: string;
};

export default function AdminProductsPage() {
  const t = useTranslations('AdminProductsPage'); 
  const { status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  useEffect(() => {
    const checkAdminRole = async () => {
      const session = await getSession();
      if (!session || session.user?.role !== 'admin') {
        router.push('/');
      }
    };
    checkAdminRole();
  }, [router]);

  useEffect(() => {
    if (status === 'authenticated') {
      const fetchProducts = async () => {
        try {
          const response = await fetch('/api/admin/products');
          if (!response.ok) throw new Error(t('fetchError'));
          const data = await response.json();
          setProducts(data.products);
        } catch (error) {
          setError(error instanceof Error ? error.message : t('fetchError'));
        } finally {
          setLoading(false);
        }
      };
      fetchProducts();
    }
  }, [status, t]);

  const handleToggleEnabled = async (productId: string, currentState: boolean) => {
    const action = currentState ? t('disableAction') : t('enableAction');
    if (window.confirm(t('confirmToggle', { action }))) {
      try {
        const response = await fetch(`/api/admin/products/${productId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enabled: !currentState }),
        });
        if (!response.ok) throw new Error(t('toggleError', { action }));
        setProducts(products.map(product => product.id === productId ? { ...product, enabled: !currentState } : product));
      } catch (error) {
        alert(t('toggleError', { action }));
      }
    }
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / productsPerPage);

  if (loading) return <div className="flex items-center justify-center min-h-screen"><span className="loading loading-spinner loading-lg"></span></div>;
  if (error) return <div className="flex items-center justify-center min-h-screen"><div className="alert alert-error"><span>{error}</span></div></div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-8">{t('manageProducts')}</h1>
      <div className="w-full max-w-4xl">
        <table className="table w-full bg-base-100 shadow-xl rounded-lg">
          <thead>
            <tr>
              <th>{t('images')}</th>
              <th>{t('name')}</th>
              <th>{t('description')}</th>
              <th>{t('price')}</th>
              <th>{t('status')}</th>
              <th>{t('user')}</th>
              <th>{t('company')}</th>
              <th>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {currentProducts.map(product => (
              <tr key={product.id}>
                <td>
                  <div className="flex space-x-2">
                    {product.images && product.images.length > 0 ? (
                      product.images.map((url) => (
                        <Image
                          key={url}
                          src={url}
                          alt={product.productName}
                          width={64}
                          height={64}
                          className="object-cover"
                        />
                      ))
                    ) : (
                      <span>{t('noImage')}</span>
                    )}
                  </div>
                </td>
                <td>{product.productName}</td>
                <td>{product.description}</td>
                <td>{parseFloat(product.price).toFixed(2)} €</td>
                <td>{product.enabled ? t('active') : t('disabled')}</td>
                <td>{product.username}</td>
                <td>{product.companyName}</td>
                <td>
                  <button
                    onClick={() => handleToggleEnabled(product.id, product.enabled)}
                    className={`btn btn-sm ${product.enabled ? 'btn-error' : 'btn-success'}`}
                  >
                    {product.enabled ? t('disable') : t('enable')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end w-full mt-4">
        <div className="join">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              className={`join-item btn ${currentPage === index + 1 ? 'btn-active' : ''}`}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
