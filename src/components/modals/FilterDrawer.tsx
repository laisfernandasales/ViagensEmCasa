import React from 'react';

interface Category {
  enabled: true;
  id: string;
  name: string;
}

interface Filters {
  name: string;
  minPrice: string;
  maxPrice: string;
  sortOrder: string;
  category: string;
}

interface FilterDrawerProps {
  filters: Filters;
  categories: Category[];
  onFilterChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onClearFilters: () => void;
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({
  filters,
  categories,
  onFilterChange,
  onClearFilters,
}) => {
  return (
    <div className="drawer drawer-left">
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-side z-50" style={{ top: '50%', transform: 'translateY(-50%)' }}>
        <div className="drawer-overlay"></div>
        <div className="menu p-4 w-80 bg-base-100 text-base-content z-50">
          <h2 className="text-xl font-semibold mb-4">Filtros</h2>
          <input
            type="text"
            name="name"
            placeholder="Nome do produto"
            value={filters.name}
            onChange={onFilterChange}
            className="input input-bordered mb-4 w-full"
          />
          <input
            type="number"
            name="minPrice"
            placeholder="Preço mínimo"
            value={filters.minPrice}
            onChange={onFilterChange}
            className="input input-bordered mb-4 w-full"
          />
          <input
            type="number"
            name="maxPrice"
            placeholder="Preço máximo"
            value={filters.maxPrice}
            onChange={onFilterChange}
            className="input input-bordered mb-4 w-full"
          />
          <select
            name="category"
            value={filters.category}
            onChange={onFilterChange}
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
            value={filters.sortOrder}
            onChange={onFilterChange}
            className="select select-bordered w-full mb-4"
          >
            <option value="">Nenhum</option>
            <option value="name-asc">Nome A-Z</option>
            <option value="name-desc">Nome Z-A</option>
            <option value="price-asc">Preço Crescente</option>
            <option value="price-desc">Preço Decrescente</option>
          </select>
          <button className="btn btn-primary w-full" onClick={() => {}}>
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
