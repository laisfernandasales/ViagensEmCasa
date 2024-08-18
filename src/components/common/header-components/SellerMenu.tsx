import { useState, useRef } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

const SellerMenu = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const accountDropdownRef = useRef<HTMLDivElement>(null);
  const locale = useLocale();

  return (
    <div className="dropdown dropdown-end" ref={accountDropdownRef}>
      <div
        tabIndex={0}
        role="button"
        className="btn btn-ghost btn-circle"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <span className="icon-[mdi--storefront] h-7 w-7 text-base-content"></span>
      </div>
      {dropdownOpen && (
        <div
          tabIndex={0}
          className="card card-compact dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-56 p-2 shadow-md"
        >
          <ul className="menu menu-compact">
            <li>
              <Link href={`/${locale}/profile/all-products`} locale={locale} className="text-sm">
                Ver os meus produtos
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/profile/add-product`} locale={locale} className="text-sm">
                Adicionar Produto
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default SellerMenu;
