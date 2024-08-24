import React, { useState, useEffect } from 'react';

interface Category {
  enabled: true;
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
          const response = await fetch('/api/admin/categories');
          if (!response.ok) {
            throw new Error('Failed to fetch categories');
          }
          const data = await response.json();
          const enabledCategories = data.categories.filter((cat: Category) => cat.enabled);

          setCategories(enabledCategories);
          sessionStorage.setItem('categories', JSON.stringify(enabledCategories));
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setLocalFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleApplyFilters = () => {
    onApplyFilters(localFilters);
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
          <h2 className="text-xl font-semibold mb-4">Filtros</h2>
          <input
            type="text"
            name="name"
            placeholder="Nome do produto"
            value={localFilters.name}
            onChange={handleFilterChange}
            className="input input-bordered mb-4 w-full"
          />
          <input
            type="number"
            name="minPrice"
            placeholder="Preço mínimo"
            value={localFilters.minPrice}
            onChange={handleFilterChange}
            className="input input-bordered mb-4 w-full"
          />
          <input
            type="number"
            name="maxPrice"
            placeholder="Preço máximo"
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
            <option value="">Todas as Categorias</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
          <h2 className="text-xl font-semibold mb-4">Ordenar por:</h2>
          <select
            name="sortOrder"
            value={localFilters.sortOrder}
            onChange={handleFilterChange}
            className="select select-bordered w-full mb-4"
          >
            <option value="">Nenhum</option>
            <option value="name-asc">Nome A-Z</option>
            <option value="name-desc">Nome Z-A</option>
            <option value="price-asc">Preço Crescente</option>
            <option value="price-desc">Preço Decrescente</option>
          </select>
          <button className="btn btn-primary w-full" onClick={handleApplyFilters}>
            Aplicar Filtros
          </button>
          <button className="btn btn-outline w-full mt-4" onClick={onClearFilters}>
            Limpar Filtros
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterDrawer;
