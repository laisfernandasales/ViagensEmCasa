import React from 'react';
import AddProduct from '../profile/add-product/page'; // Certifique-se de que o caminho está correto

export default function Marketplace() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-6">Marketplace</h1>
      <AddProduct />
    </div>
  );
}
