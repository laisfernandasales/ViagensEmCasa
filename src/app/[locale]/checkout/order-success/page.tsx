'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

const OrderSuccessPage: React.FC = () => {
  const t = useTranslations('order-success-page');
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];

  return (
    <div className="min-h-screen bg-base-200 p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-3xl bg-base-300 shadow-lg rounded-lg p-6 text-center">
        <h1 className="text-4xl font-bold mb-6 text-base-content">{t('Order Successful!')}</h1>
        <p className="text-xl text-base-content mb-6">{t('Thank you for your purchase. Your order has been placed successfully.')}</p>
        <button 
          className="btn btn-primary"
          onClick={() => router.push(`/${locale}`)}
        >
          {t('Go to Home')}
        </button>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
