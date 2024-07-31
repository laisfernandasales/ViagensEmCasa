// app/[locale]/cart/page.tsx
'use client';
import React from 'react';
import { useCart } from '@/services/cart/CartContext';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

const CartPage: React.FC = () => {
  const { cart, removeFromCart, clearCart } = useCart();
  const t = useTranslations('Cart');
  const router = useRouter();
  const pathname = usePathname();

  const getLocale = () => {
    const segments = pathname.split('/');
    return segments.length > 1 ? segments[1] : 'en'; // Padrão para 'en' se o locale não for encontrado
  };

  const locale = getLocale();

  return (
    <div className="min-h-screen bg-base-200 p-4">
      <h1 className="text-4xl font-bold mb-6">{t('shopping_cart')}</h1>
      {cart.length === 0 ? (
        <p>{t('cart_empty')}</p>
      ) : (
        <div>
          {cart.map(item => (
            <div key={item.id} className="flex items-center justify-between p-4 mb-4 bg-base-100 shadow-lg rounded-lg">
              <div className="flex items-center">
                <img src={item.image} alt={item.productName} className="w-16 h-16 object-cover rounded-lg mr-4" />
                <div>
                  <h2 className="text-xl font-semibold">{item.productName}</h2>
                  <p className="text-gray-700">${item.price}</p>
                </div>
              </div>
              <button className="btn btn-sm btn-error" onClick={() => removeFromCart(item.id)}>{t('remove')}</button>
            </div>
          ))}
          <div className="mt-6">
            <button className="btn btn-error mr-4" onClick={clearCart}>{t('clear_cart')}</button>
            <button className="btn btn-primary" onClick={() => router.push(`/${locale}/checkout`)}>{t('checkout')}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
