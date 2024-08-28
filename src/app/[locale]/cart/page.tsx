'use client';

import React from 'react';
import { useCart } from '@/services/cart/CartContext';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

const CartPage: React.FC = () => {
  const { cart, removeFromCart, clearCart, updateQuantity } = useCart();
  const t = useTranslations('CartPage'); // Ajuste do título para Pascal Case
  const router = useRouter();
  const locale = usePathname().split('/')[1] || 'en';

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);

  return (
    <div className="min-h-screen bg-base-200 p-8 flex flex-col items-center">
      <div className="w-full max-w-3xl bg-base-100 shadow-lg rounded-lg p-8 border border-base-content/20">
        <h1 className="text-4xl font-bold text-center text-primary mb-8">{t('shoppingCart')}</h1>
        {cart.length === 0 ? (
          <div className="text-center p-8">
            <p className="text-xl text-base-content">{t('cartEmpty')}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {cart.map((item) => (
              <CartItem key={item.id} item={item} removeFromCart={removeFromCart} updateQuantity={updateQuantity} t={t} />
            ))}
            <div className="flex justify-between items-center mt-6 border-t border-base-content/20 pt-6">
              <span className="text-2xl font-semibold text-base-content">
                {t('total')}: {cartTotal} €
              </span>
              <div className="space-x-4">
                <button className="btn btn-error" onClick={() => confirmClearCart(clearCart, t)}>
                  {t('clearCart')}
                </button>
                <button className="btn btn-primary" onClick={() => router.push(`/${locale}/checkout`)}>
                  {t('checkout')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CartItem: React.FC<{ item: any; removeFromCart: Function; updateQuantity: Function; t: Function }> = ({ item, removeFromCart, updateQuantity, t }) => (
  <div className="flex items-center justify-between bg-base-100 p-4 rounded-lg shadow-sm">
    <div className="flex items-center">
      <div className="w-16 h-16 relative rounded-lg overflow-hidden">
        <Image src={item.image} alt={item.productName} layout="fill" objectFit="cover" />
      </div>
      <div className="ml-4">
        <h2 className="text-xl font-semibold text-base-content">{item.productName}</h2>
        <p className="text-base-content">{item.price.toFixed(2)} €</p>
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
      <button className="btn btn-sm btn-error ml-4" onClick={() => removeFromCart(item.id)}>
        {t('remove')}
      </button>
    </div>
  </div>
);

const confirmClearCart = (clearCart: Function, t: Function) => {
  if (confirm(t('confirmClearCart'))) {
    clearCart();
  }
};

export default CartPage;
