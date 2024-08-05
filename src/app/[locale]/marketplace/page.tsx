'use client';

import React, { useEffect, useState } from 'react';
import { useCart } from '@/services/cart/CartContext';
import { usePathname, useRouter } from 'next/navigation';
import { getSession } from 'next-auth/react';

interface Product {
  id: string;
  productName: string;
  price: string;
  images: string[];
}

const Marketplace: React.FC = () => {
  const { addToCart } = useCart();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    name: '',
    minPrice: '',
    maxPrice: '',
    sortOrder: '',
  });
  const [userRole, setUserRole] = useState<string | null>(null);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchUserRole = async () => {
      const session = await getSession();
      setUserRole(session?.user?.role || null);
    };

    fetchUserRole();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/marketplace');
        const data = await response.json();
        setAllProducts(data.products);
        setFilteredProducts(data.products);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = allProducts;

    if (filters.name) {
      filtered = filtered.filter((product) =>
        product.productName.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    if (filters.minPrice) {
      filtered = filtered.filter(
        (product) => parseFloat(product.price) >= parseFloat(filters.minPrice)
      );
    }

    if (filters.maxPrice) {
      filtered = filtered.filter(
        (product) => parseFloat(product.price) <= parseFloat(filters.maxPrice)
      );
    }

    if (filters.sortOrder) {
      const [field, order] = filters.sortOrder.split('-');
      filtered.sort((a, b) => {
        if (field === 'price') {
          return order === 'asc'
            ? parseFloat(a.price) - parseFloat(b.price)
            : parseFloat(b.price) - parseFloat(a.price);
        } else {
          return order === 'asc'
            ? a.productName.localeCompare(b.productName)
            : b.productName.localeCompare(a.productName);
        }
      });
    }

    setFilteredProducts(filtered);
  }, [filters, allProducts]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      name: '',
      minPrice: '',
      maxPrice: '',
      sortOrder: '',
    });
    setFilteredProducts(allProducts);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 flex flex-col items-center">
      <section className="w-full bg-base-100 py-12 relative">
        <div className="text-center">
          <div className="max-w-lg mx-auto">
            <h1 className="text-5xl font-bold mb-4">Mercado Regional</h1>
            <p className="text-xl mb-6">
              O melhor do mercado tradicional no conforto de sua casa
            </p>
          </div>
        </div>
        <label
          htmlFor="my-drawer"
          className="btn btn-primary absolute bottom-0 right-0 m-4 drawer-button"
        >
          Filtrar
        </label>
      </section>

      <div className="drawer drawer-left">
        <input id="my-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-side" style={{ marginTop: '64px' }}>
          <label htmlFor="my-drawer" className="drawer-overlay"></label>
          <div className="menu p-4 w-80 bg-base-100 text-base-content">
            <h2 className="text-xl font-semibold mb-4">Filtros</h2>
            <input
              type="text"
              name="name"
              placeholder="Nome do produto"
              value={filters.name}
              onChange={handleFilterChange}
              className="input input-bordered mb-4 w-full"
            />
            <input
              type="number"
              name="minPrice"
              placeholder="Preço mínimo"
              value={filters.minPrice}
              onChange={handleFilterChange}
              className="input input-bordered mb-4 w-full"
            />
            <input
              type="number"
              name="maxPrice"
              placeholder="Preço máximo"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              className="input input-bordered mb-4 w-full"
            />
            <h2 className="text-xl font-semibold mb-4">Ordenar por:</h2>
            <select
              name="sortOrder"
              value={filters.sortOrder}
              onChange={handleFilterChange}
              className="select select-bordered w-full mb-4"
            >
              <option value="">Nenhum</option>
              <option value="name-asc">Nome A-Z</option>
              <option value="name-desc">Nome Z-A</option>
              <option value="price-asc">Preço Crescente</option>
              <option value="price-desc">Preço Decrescente</option>
            </select>
            <button
              className="btn btn-primary w-full"
              onClick={() => setFilters((prev) => ({ ...prev }))}
            >
              Aplicar Filtros
            </button>
            <button
              className="btn btn-outline w-full mt-4"
              onClick={handleClearFilters}
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      <section className="py-12 flex flex-wrap justify-center gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="card w-72 bg-base-100 shadow-xl relative">
            <div
              onClick={() => router.push(`${pathname}/${product.id}`)}
              className="cursor-pointer"
            >
              <figure>
                <img
                  src={product.images[0] || 'https://via.placeholder.com/400x300'}
                  alt={product.productName}
                  className="w-full h-48 object-cover"
                />
              </figure>
              <div className="card-body">
                <h3 className="card-title text-xl font-semibold mb-2">
                  {product.productName}
                </h3>
                <p className="text-gray-700 mb-2">€{product.price}</p>
              </div>
            </div>
            {userRole !== 'seller' && userRole !== 'admin' && (
              <button
                className="absolute bottom-4 right-4 w-10 h-10 p-0 border-none bg-transparent transition-transform transform hover:scale-110 active:scale-95"
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart({
                    id: product.id,
                    productName: product.productName,
                    price: parseFloat(product.price),
                    image: product.images[0],
                    quantity: 1,
                  });
                }}
              >
                <img
                  src="/icons/add-cart.png"
                  alt="Adicionar ao carrinho"
                  className="w-full h-full"
                />
              </button>
            )}
          </div>
        ))}
      </section>
    </div>
  );
};

export default Marketplace;
