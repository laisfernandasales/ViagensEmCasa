'use client';
import { useCart } from '@/services/cart/CartContext';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface Product {
  id: string;
  productName: string;
  price: string;
  image: string;
}

const Marketplace: React.FC = () => {
  const { addToCart } = useCart();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [nameFilter, setNameFilter] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const router = useRouter();
  const pathname = usePathname();

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

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleFilter = () => {
    let filtered = [...allProducts];

    if (nameFilter) {
      filtered = filtered.filter(product =>
        product.productName.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    if (minPrice) {
      const min = parseFloat(minPrice);
      filtered = filtered.filter(product => parseFloat(product.price) >= min);
    }

    if (maxPrice) {
      const max = parseFloat(maxPrice);
      filtered = filtered.filter(product => parseFloat(product.price) <= max);
    }

    setFilteredProducts(filtered);
  };

  const handleSort = (order: string) => {
    let sorted = [...filteredProducts];
    if (order === 'name-asc') {
      sorted.sort((a, b) => a.productName.localeCompare(b.productName));
    } else if (order === 'name-desc') {
      sorted.sort((a, b) => b.productName.localeCompare(a.productName));
    } else if (order === 'price-asc') {
      sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (order === 'price-desc') {
      sorted.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    }
    setFilteredProducts(sorted);
  };

  const handleClearFilters = () => {
    setNameFilter('');
    setMinPrice('');
    setMaxPrice('');
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
            <p className="text-xl mb-6">O melhor do mercado tradicional no conforto de sua casa</p>
          </div>
        </div>
        <label htmlFor="my-drawer" className="btn btn-primary absolute bottom-0 right-0 m-4 drawer-button">
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
              placeholder="Nome do produto"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="input input-bordered mb-4 w-full"
            />
            <input
              type="number"
              placeholder="Preço mínimo"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="input input-bordered mb-4 w-full"
            />
            <input
              type="number"
              placeholder="Preço máximo"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="input input-bordered mb-4 w-full"
            />
            <h2 className="text-xl font-semibold mb-4">Ordenar por:</h2>
            <button className="btn btn-outline mb-2 w-full" onClick={() => handleSort('name-asc')}>Nome A-Z</button>
            <button className="btn btn-outline mb-2 w-full" onClick={() => handleSort('name-desc')}>Nome Z-A</button>
            <button className="btn btn-outline mb-2 w-full" onClick={() => handleSort('price-asc')}>Preço Crescente</button>
            <button className="btn btn-outline mb-2 w-full" onClick={() => handleSort('price-desc')}>Preço Decrescente</button>
            <button className="btn btn-primary mt-4 w-full" onClick={handleFilter}>Aplicar Filtros</button>
          </div>
        </div>
      </div>
      
      <section className="py-12 flex flex-wrap justify-center gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="card w-72 bg-base-100 shadow-xl relative">
            <div onClick={() => router.push(`${pathname}/${product.id}`)} className="cursor-pointer">
              <figure>
                <img
                  src={product.image || 'https://via.placeholder.com/400x300'}
                  alt={product.productName}
                  className="w-full h-48 object-cover"
                />
              </figure>
              <div className="card-body">
                <h3 className="card-title text-xl font-semibold mb-2">{product.productName}</h3>
                <p className="text-gray-700 mb-2">${product.price}</p>
              </div>
            </div>
            <button 
              className="absolute bottom-4 right-4 w-10 h-10 p-0 border-none bg-transparent"
              onClick={(e) => {
                e.stopPropagation(); // Impede que o clique no botão de adicionar ao carrinho acione a navegação
                addToCart({ id: product.id, productName: product.productName, price: parseFloat(product.price), image: product.image, quantity: 1 });
              }}
            >
              <img src="/icons/add-cart.png" alt="Adicionar ao carrinho" className="w-full h-full" />
            </button>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Marketplace;
