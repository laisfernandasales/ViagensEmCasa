'use client';

import React, { useState } from 'react';
import { useCart } from '@/services/cart/CartContext';
import { useTranslations } from 'next-intl';

const CheckoutPage: React.FC = () => {
  const { cart, clearCart, updateQuantity, removeFromCart } = useCart();
  const t = useTranslations('Checkout');

  const [name, setName] = useState('');
  const [nif, setNif] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');

  const deliveryFee = 5.0;
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  const totalWithDelivery = (parseFloat(cartTotal) + deliveryFee).toFixed(2);

  const handleCheckout = () => {
    clearCart();
    alert(t('order_success'));
  };

  return (
    <div className="min-h-screen bg-base-200 p-8 flex flex-col items-center">
      <div className="w-full max-w-3xl bg-base-300 shadow-lg rounded-lg p-6">
        <h1 className="text-4xl font-bold mb-6 text-center text-base-content">{t('checkout')}</h1>
        {cart.length === 0 ? (
          <p className="text-center text-xl text-base-content">{t('cart_empty')}</p>
        ) : (
          <div>
            <section className="mb-6">
              <h2 className="text-2xl font-semibold mb-4 text-base-content">{t('shipping_details')}</h2>
              {[
                { label: t('name'), value: name, setValue: setName, placeholder: t('name_placeholder') },
                { label: 'NIF', value: nif, setValue: setNif, placeholder: t('nif_placeholder') },
                { label: t('contact_number'), value: contactNumber, setValue: setContactNumber, placeholder: t('contact_placeholder') },
                { label: t('billing_address'), value: billingAddress, setValue: setBillingAddress, placeholder: t('billing_placeholder') },
                { label: t('shipping_address'), value: shippingAddress, setValue: setShippingAddress, placeholder: t('shipping_placeholder') }
              ].map(({ label, value, setValue, placeholder }, index) => (
                <div className="mb-4" key={index}>
                  <label className="block text-base-content mb-1">{label}</label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="input input-bordered w-full"
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </section>
            <section className="mb-6">
              <h2 className="text-2xl font-semibold mb-4 text-base-content">{t('payment_method')}</h2>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="select select-bordered w-full"
              >
                <option value="credit_card">{t('credit_card')}</option>
                <option value="paypal">{t('paypal')}</option>
                <option value="bank_transfer">{t('bank_transfer')}</option>
              </select>
            </section>
            <section className="mb-6">
              <h2 className="text-2xl font-semibold mb-4 text-base-content">{t('order_summary')}</h2>
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 mb-4 bg-base-100 shadow-lg rounded-lg">
                  <div className="flex items-center">
                    <img src={item.image} alt={item.productName} className="w-16 h-16 object-cover rounded-lg mr-4" />
                    <div>
                      <h3 className="text-xl font-semibold text-base-content">{item.productName}</h3>
                      <p className="text-base-content">€{item.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      className="btn btn-circle btn-sm bg-transparent border border-base-content text-base-content hover:bg-base-200"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="text-base-content">{item.quantity}</span>
                    <button
                      className="btn btn-circle btn-sm bg-transparent border border-base-content text-base-content hover:bg-base-200"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                    <button
                      className="btn btn-sm bg-transparent border border-base-content text-base-content rounded-full hover:bg-base-200"
                      onClick={() => removeFromCart(item.id)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </section>
            <div className="text-2xl font-semibold text-base-content mb-4">
              {t('delivery_fee')}: €{deliveryFee.toFixed(2)}
            </div>
            <div className="text-2xl font-semibold text-base-content mb-4">
              {t('total')}: €{totalWithDelivery}
            </div>
            <button className="btn btn-primary w-full" onClick={handleCheckout}>
              {t('place_order')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
