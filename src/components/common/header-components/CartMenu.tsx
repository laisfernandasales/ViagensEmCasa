import { useState, useRef } from 'react';
import Link from 'next/link';
import { useCart } from '@/services/cart/CartContext';
import { useLocale } from 'next-intl';

const CartMenu = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const cartDropdownRef = useRef<HTMLDivElement>(null);
  const { cart } = useCart();
  const locale = useLocale();

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);

  return (
    <div className="dropdown dropdown-end" ref={cartDropdownRef}>
      <div
        tabIndex={0}
        role="button"
        className="btn btn-ghost btn-circle"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <div className="indicator">
          <span className="icon-[mdi--cart] h-5 w-5 text-base-content"></span>
          <span className="badge badge-sm indicator-item bg-primary text-white">
            {cartItemCount}
          </span>
        </div>
      </div>
      {dropdownOpen && (
        <div
          tabIndex={0}
          className="card card-compact dropdown-content bg-base-100 z-[1] mt-3 w-52 shadow"
        >
          <div className="card-body">
            <span className="text-lg font-bold text-base-content">{cartItemCount} Itens</span>
            <span className="text-info">Subtotal: €{cartTotalPrice}</span>
            <div className="card-actions">
              <Link
                href={`/${locale}/cart`}
                locale={locale}
                className="btn btn-primary btn-block"
                onClick={() => setDropdownOpen(false)}
              >
                Ver carrinho
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartMenu;
