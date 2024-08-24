import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

const SellerMenu = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const accountDropdownRef = useRef<HTMLDivElement>(null);
  const locale = useLocale();
  const t = useTranslations('SellerMenu');

  const handleClickOutside = (event: MouseEvent) => {
    if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target as Node)) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="dropdown dropdown-end" ref={accountDropdownRef}>
      <button
        className="btn btn-ghost btn-circle"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <span className="icon-[mdi--storefront] h-7 w-7 text-base-content"></span>
      </button>
      {dropdownOpen && (
        <div
          className="card card-compact dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-56 p-2 shadow-md"
        >
          <ul className="menu menu-compact">
            <li>
              <Link href={`/${locale}/profile/all-products`} locale={locale} className="text-sm">
                {t('viewMyProducts')}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/profile/add-product`} locale={locale} className="text-sm">
                {t('addProduct')}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/profile/sales-history`} locale={locale} className="text-sm">
                {t('salesHistory')}
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default SellerMenu;
