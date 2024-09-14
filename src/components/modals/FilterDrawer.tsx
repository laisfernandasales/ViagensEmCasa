import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface Category {
  enabled: boolean;
  id: string;
  name: string;
}

interface FilterDrawerProps {
  filters: {
    name: string;
    minPrice: string;
    maxPrice: string;
    sortOrder: string;
    category: string;
  };
  onApplyFilters: (filters: any) => void;
  onClearFilters: () => void;
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({ filters, onApplyFilters, onClearFilters }) => {
  const t = useTranslations('FilterDrawer');
  const [localFilters, setLocalFilters] = useState(filters);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cachedCategories = sessionStorage.getItem('categories');

        if (cachedCategories) {
          setCategories(JSON.parse(cachedCategories));
        } else {
          const response = await fetch('/api/admin/categoriesProducts'); 
          if (!response.ok) {
            throw new Error(t('fetchCategoriesError'));
          }
          const data = await response.json();
          const enabledCategories = data.categories.filter((cat: Category) => cat.enabled);

          setCategories(enabledCategories);
          sessionStorage.setItem('categories', JSON.stringify(enabledCategories));
        }
      } catch (error) {
        console.error(t('errorFetchingCategories'), error);
      }
    };

    fetchCategories();
  }, [t]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setLocalFilters((prev) => ({
      ...prev,
      [name]:
        (name === 'minPrice' || name === 'maxPrice') && value !== ''
          ? Math.max(0, parseFloat(value))
          : value,
    }));
  };

  const handleApplyFilters = () => {
    const updatedFilters = {
      ...localFilters,
      minPrice: localFilters.minPrice ? Math.max(0, parseFloat(localFilters.minPrice)) : 0,
      maxPrice: localFilters.maxPrice ? Math.max(0, parseFloat(localFilters.maxPrice)) : Infinity,
    };
    onApplyFilters(updatedFilters);
  };

  return (
    <div className="drawer drawer-left">
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />
      <div 
        className="drawer-side z-50"
        style={{ top: '64px', transform: 'translateY(0)' }}
      >
        <div className="drawer-overlay"></div>
        <div className="menu p-4 w-80 bg-base-100 text-base-content z-50">
          <h2 className="text-xl font-semibold mb-4">{t('filters')}</h2>
          <input
            type="text"
            name="name"
            placeholder={t('productName')}
            value={localFilters.name}
            onChange={handleFilterChange}
            className="input input-bordered mb-4 w-full"
          />
          <input
            type="number"
            name="minPrice"
            placeholder={t('minPrice')}
            value={localFilters.minPrice}
            onChange={handleFilterChange}
            className="input input-bordered mb-4 w-full"
          />
          <input
            type="number"
            name="maxPrice"
            placeholder={t('maxPrice')}
            value={localFilters.maxPrice}
            onChange={handleFilterChange}
            className="input input-bordered mb-4 w-full"
          />
          <select
            name="category"
            value={localFilters.category}
            onChange={handleFilterChange}
            className="select select-bordered w-full mb-4"
          >
            <option value="">{t('allCategories')}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
          <h2 className="text-xl font-semibold mb-4">{t('sortBy')}</h2>
          <select
            name="sortOrder"
            value={localFilters.sortOrder}
            onChange={handleFilterChange}
            className="select select-bordered w-full mb-4"
          >
            <option value="">{t('none')}</option>
            <option value="name-asc">{t('nameAsc')}</option>
            <option value="name-desc">{t('nameDesc')}</option>
            <option value="price-asc">{t('priceAsc')}</option>
            <option value="price-desc">{t('priceDesc')}</option>
          </select>
          <button className="btn btn-primary w-full" onClick={handleApplyFilters}>
            {t('applyFilters')}
          </button>
          <button className="btn btn-outline w-full mt-4" onClick={onClearFilters}>
            {t('clearFilters')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterDrawer;
