import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useCart } from '@/services/cart/CartContext';
import { useLocale, useTranslations } from 'next-intl';

const CartMenu = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const cartDropdownRef = useRef<HTMLDivElement>(null);
  const { cart } = useCart();
  const locale = useLocale();
  const t = useTranslations('CartMenu');

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (cartDropdownRef.current && !cartDropdownRef.current.contains(event.target as Node)) {
      setDropdownOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  return (
    <div className="dropdown dropdown-end" ref={cartDropdownRef}>
      <button
        type="button"
        className="btn btn-ghost btn-circle"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <div className="indicator">
          <span className="icon-[mdi--cart] h-5 w-5 text-base-content"></span>
          <span className="badge badge-sm indicator-item bg-primary text-white">
            {cartItemCount}
          </span>
        </div>
      </button>
      {dropdownOpen && (
        <div
          className="card card-compact dropdown-content bg-base-100 z-[1] mt-3 w-52 shadow"
        >
          <div className="card-body">
            <span className="text-lg font-bold text-base-content">
              {cartItemCount} {t('items')}
            </span>
            <span className="text-info">{t('subtotal')}: €{cartTotalPrice}</span>
            <div className="card-actions">
              <Link
                href={`/${locale}/cart`}
                locale={locale}
                className="btn btn-primary btn-block"
                onClick={() => setDropdownOpen(false)}
              >
                {t('viewCart')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartMenu;
