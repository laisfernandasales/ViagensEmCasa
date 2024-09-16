'use client';

import React, { useState, useEffect } from 'react';
import { useSession, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function AdminCategoriesProducts() {
  const t = useTranslations('AdminCategoriesPage');
  const [categories, setCategories] = useState<{ id: string, name: string, enabled: boolean }[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const checkAdminRole = async () => {
      const session = await getSession();
      if (session?.user?.role !== 'admin') {
        router.push('/');
      }
    };

    checkAdminRole();
  }, [router]);

  useEffect(() => {
    if (status === 'authenticated') {
      const fetchCategories = async () => {
        try {
          const response = await fetch('/api/admin/categories');
          if (!response.ok) throw new Error(t('fetchError'));
          const data = await response.json();
          setCategories(data.categories);
        } catch (err) {
          setError(err instanceof Error ? err.message : t('unknownError'));
        } finally {
          setLoading(false);
        }
      };
      fetchCategories();
    }
  }, [status, t]);

  const handleAddOrEditCategory = async () => {
    if (!categoryName.trim()) {
      alert(t('categoryNameEmpty'));
      return;
    }

    try {
      const response = await fetch('/api/admin/categories', {
        method: editingCategoryId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingCategoryId,
          name: categoryName.trim(),
        }),
      });

      if (!response.ok) throw new Error(t('addEditError'));

      const newCategory = await response.json();

      if (editingCategoryId) {
        setCategories((prev) =>
          prev.map((cat) => (cat.id === editingCategoryId ? { ...cat, name: newCategory.name } : cat))
        );
      } else {
        setCategories((prev) => [...prev, newCategory]);
      }

      setCategoryName('');
      setEditingCategoryId(null);
    } catch (error) {
      setError(t('addEditCategoryError'));
    }
  };

  const handleEditClick = (category: { id: string, name: string, enabled: boolean }) => {
    setEditingCategoryId(category.id);
    setCategoryName(category.name);
  };

  const handleToggleCategoryStatus = async (categoryId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: categoryId, enabled: !currentStatus }),
      });

      if (!response.ok) throw new Error(t('statusChangeError'));

      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === categoryId ? { ...cat, enabled: !currentStatus } : cat
        )
      );
    } catch (error) {
      setError(t('changeStatusError'));
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><span className="loading loading-spinner loading-lg"></span></div>;
  if (error) return <div className="flex items-center justify-center min-h-screen"><div className="alert alert-error"><span>{error}</span></div></div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-8">{t('manageCategories')}</h1>
      <div className="w-full max-w-4xl bg-base-100 shadow-xl rounded-lg p-6">
        <div className="mb-4">
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder={t('categoryName')}
            className="input input-bordered w-full"
          />
          <button
            onClick={handleAddOrEditCategory}
            className="btn btn-primary mt-2 w-full"
          >
            {editingCategoryId ? t('editCategory') : t('addCategory')}
          </button>
        </div>
        <ul className="list-disc pl-5">
          {categories.map((category) => (
            <li key={category.id} className="mb-2 flex justify-between items-center">
              <span>{category.name}</span>
              <div>
                <button
                  className="btn btn-sm btn-secondary mr-2"
                  onClick={() => handleEditClick(category)}
                >
                  {t('edit')}
                </button>
                <button
                  className={`btn btn-sm ${category.enabled ? 'btn-error' : 'btn-success'}`}
                  onClick={() => handleToggleCategoryStatus(category.id, category.enabled)}
                >
                  {category.enabled ? t('disable') : t('enable')}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
