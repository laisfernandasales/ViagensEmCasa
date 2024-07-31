// app/[locale]/checkout/page.tsx
'use client';
import React, { useState } from 'react';
import { useCart } from '@/services/cart/CartContext';
import { useTranslations } from 'next-intl';

const CheckoutPage: React.FC = () => {
  const { cart, clearCart } = useCart();
  const t = useTranslations('Checkout');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');

  const handleCheckout = () => {
    // Aqui você pode adicionar a lógica para processar o pagamento e criar o pedido
    clearCart();
    alert('Compra realizada com sucesso!');
  };

  return (
    <div className="min-h-screen bg-base-200 p-4">
      <h1 className="text-4xl font-bold mb-6">{t('checkout')}</h1>
      {cart.length === 0 ? (
        <p>{t('cart_empty')}</p>
      ) : (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">{t('shipping_details')}</h2>
            <div className="mb-4">
              <label className="block text-gray-700">{t('name')}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input input-bordered w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">{t('address')}</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="input input-bordered w-full"
              />
            </div>
          </div>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">{t('payment_method')}</h2>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="credit_card">{t('credit_card')}</option>
              <option value="paypal">{t('paypal')}</option>
              <option value="bank_transfer">{t('bank_transfer')}</option>
            </select>
          </div>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">{t('order_summary')}</h2>
            {cart.map(item => (
              <div key={item.id} className="flex items-center justify-between p-4 mb-4 bg-base-100 shadow-lg rounded-lg">
                <div className="flex items-center">
                  <img src={item.image} alt={item.productName} className="w-16 h-16 object-cover rounded-lg mr-4" />
                  <div>
                    <h3 className="text-xl font-semibold">{item.productName}</h3>
                    <p className="text-gray-700">${item.price}</p>
                  </div>
                </div>
                <p className="text-xl font-semibold">{item.quantity}</p>
              </div>
            ))}
          </div>
          <button className="btn btn-primary w-full" onClick={handleCheckout}>{t('place_order')}</button>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
