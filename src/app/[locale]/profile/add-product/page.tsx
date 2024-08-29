'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useAddProduct } from '@/hooks/useAddProduct';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface Category {
  id: string;
  name: string;
  enabled: true;
}

export default function AddProduct() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations('AddProductPage');
  const [productName, setProductName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [stockQuantity, setStockQuantity] = useState<number>(0);
  const [weight, setWeight] = useState<string>('');
  const [unit, setUnit] = useState<string>('kg');
  const [label, setLabel] = useState<string>(t('weight'));
  const [productStatus, setProductStatus] = useState<string>(t('available'));
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [formValid, setFormValid] = useState<boolean>(false);

  const { addProduct, loading, error } = useAddProduct();

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated' || session?.user?.role !== 'seller') {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(data.categories);
        setCategory(data.categories.length > 0 ? data.categories[0].id : '');
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    setFormValid(
      productName.trim() !== '' &&
      description.trim() !== '' &&
      price.trim() !== '' &&
      category !== '' &&
      stockQuantity > 0 &&
      weight.trim() !== ''
    );
  }, [productName, description, price, category, stockQuantity, weight]);

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUnit = e.target.value;
    setUnit(selectedUnit);
    setLabel(selectedUnit === 'kg' ? t('weight') : t('content'));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formValid) {
      setShowConfirmModal(true);
    } else {
      alert(t('pleaseFillAllFields'));
    }
  };

  const confirmAddProduct = async () => {
    setShowConfirmModal(false);

    const selectedCategory = categories.find(cat => cat.id === category);
    const categoryName = selectedCategory ? selectedCategory.name : '';

    await addProduct({
      productName,
      description,
      price: price,
      category: categoryName,
      images,
      stockQuantity,
      weight: `${weight} ${unit}`,
      productStatus,
    });

    setShowSuccessModal(true);
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    resetForm();
  };

  const resetForm = () => {
    setProductName('');
    setDescription('');
    setPrice('');
    setCategory(categories.length > 0 ? categories[0].id : '');
    setImages([]);
    setImagePreviews([]);
    setStockQuantity(0);
    setWeight('');
    setUnit('kg');
    setLabel(t('weight'));
    setProductStatus(t('available'));
  };

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      return error.message;
    }
    return t('unknownError');
  };

  const handleStockQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value >= 0) {
      setStockQuantity(value);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);

      if (images.length + newFiles.length > 10) {
        alert(t('maxImagesError'));
        return;
      }

      setImages((prevImages) => [...prevImages, ...newFiles]);

      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(prevPreviews => [...prevPreviews, ...newPreviews]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prevImages) => {
      const updatedImages = [...prevImages];
      updatedImages.splice(index, 1);
      return updatedImages;
    });

    setImagePreviews((prevPreviews) => {
      const updatedPreviews = [...prevPreviews];
      updatedPreviews.splice(index, 1);
      return updatedPreviews;
    });
  };

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">{t('loading')}</div>;
  }

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-base-100 shadow-lg rounded-lg p-8 border border-base-content/20">
        <h2 className="text-4xl font-bold text-center text-primary mb-8">{t('addProduct')}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" htmlFor="productName">{t('productName')}</label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" htmlFor="description">{t('description')}</label>
            <textarea
              className="textarea textarea-bordered w-full h-24"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" htmlFor="price">{t('price')}</label>
            <input
              type="number"
              className="input input-bordered w-full"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" htmlFor="category">{t('category')}</label>
            <select
              className="select select-bordered w-full"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              {categories
                .filter((cat) => cat.enabled)
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" htmlFor="stockQuantity">{t('stockQuantity')}</label>
            <input
              type="number"
              className="input input-bordered w-full"
              value={stockQuantity}
              onChange={handleStockQuantityChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">{label}</label>
            <div className="flex items-center">
              <input
                type="text"
                className="input input-bordered w-full"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
              />
              <select
                className="select select-bordered ml-2"
                value={unit}
                onChange={handleUnitChange}
              >
                <option value="kg">kg</option>
                <option value="litros">{t('liters')}</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" htmlFor="productStatus">{t('productStatus')}</label>
            <select
              className="select select-bordered w-full"
              value={productStatus}
              onChange={(e) => setProductStatus(e.target.value)}
              required
            >
              <option value={t('available')}>{t('available')}</option>
              <option value={t('unavailable')}>{t('unavailable')}</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" htmlFor="productImages">{t('productImages')}</label>
            <div className="flex flex-col items-center mb-4">
            {imagePreviews.length > 0 && (
              <div className="flex flex-wrap gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={`${preview}-${index}`} className="relative w-24 h-24">
                    <Image
                      src={preview}
                      alt={`${t('image')} ${index + 1}`}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-0 right-0 p-1 bg-red-600 text-white rounded-full text-xs"
                      aria-label={t('removeImage')}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
              <input type="file" accept="image/*" onChange={handleImageChange} className="mt-4 file-input file-input-bordered" multiple />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{getErrorMessage(error)}</p>}

          <button
            type="submit"
            className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? t('adding') : t('addProduct')}
          </button>
        </form>
      </div>

      {showConfirmModal && (
  <div className="modal modal-open">
    <div className="modal-box">
      <h2 className="font-bold text-lg">{t('confirmAddProduct')}</h2>
      <p>{t('confirmAddProductMessage')}</p>
      <div className="modal-action justify-center">
        <button
          className="btn btn-primary w-32 mr-4" 
          onClick={confirmAddProduct}
        >
          {t('yes')}
        </button>
        <button
          className="btn btn-secondary w-32" 
          onClick={() => setShowConfirmModal(false)}
        >
          {t('no')}
        </button>
      </div>
    </div>
  </div>
)}

      {showSuccessModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h2 className="font-bold text-lg">{t('productAdded')}</h2>
            <p>{t('productAddedMessage')}</p>
            <div className="modal-action">
              <button
                className="btn btn-primary"
                onClick={handleSuccessModalClose}
              >
                {t('ok')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
