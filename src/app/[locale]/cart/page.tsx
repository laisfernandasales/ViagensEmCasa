'use client';

import React from 'react';
import { useCart } from '@/services/cart/CartContext';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

const CartPage: React.FC = () => {
  const { cart, removeFromCart, clearCart, updateQuantity } = useCart();
  const t = useTranslations('Cart');
  const router = useRouter();
  const locale = usePathname().split('/')[1] || 'en';

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);

  return (
    <div className="min-h-screen bg-base-200 p-8 flex flex-col items-center">
      <div className="w-full max-w-3xl bg-base-300 shadow-lg rounded-lg p-6">
        <h1 className="text-4xl font-bold mb-6 text-center text-base-content">{t('shopping_cart')}</h1>
        {cart.length === 0 ? (
          <p className="text-center text-xl text-base-content">{t('cart_empty')}</p>
        ) : (
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between bg-base-100 p-4 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <img src={item.image} alt={item.productName} className="w-16 h-16 object-cover rounded-lg mr-4" />
                  <div>
                    <h2 className="text-xl font-semibold text-base-content">{item.productName}</h2>
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
                  <button className="btn btn-sm btn-error ml-4" onClick={() => removeFromCart(item.id)}>
                    {t('remove')}
                  </button>
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center mt-4 border-t border-base-300 pt-4">
              <span className="text-2xl font-semibold text-base-content">
                {t('total')}: €{cartTotal}
              </span>
              <div className="space-x-4">
                <button className="btn btn-error" onClick={clearCart}>
                  {t('clear_cart')}
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

export default CartPage;
