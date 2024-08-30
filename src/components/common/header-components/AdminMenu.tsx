import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

const AdminMenu = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const accountDropdownRef = useRef<HTMLDivElement>(null);
  const locale = useLocale();
  const t = useTranslations('AdminMenu');

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target as Node)) {
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
    <div className="dropdown dropdown-end" ref={accountDropdownRef}>
      <button
        type="button"
        className="btn btn-ghost btn-circle"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <span className="icon-[mdi--account-group] h-7 w-7 text-base-content"></span>
      </button>
      {dropdownOpen && (
        <div
          className="card card-compact dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-56 p-2 shadow-md"
        >
          <ul className="menu menu-compact">
            <li>
              <Link href={`/${locale}/admin/request-sellers`} locale={locale} className="text-sm">
                {t('requestSellers')}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/admin/users`} locale={locale} className="text-sm">
                {t('manageUsers')}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/admin/products`} locale={locale} className="text-sm">
                {t('manageProducts')}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/admin/categories`} locale={locale} className="text-sm">
                {t('manageCategories')}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/admin/tourism/ticket/all-ticket`} locale={locale} className="text-sm">
                {t('manageTickets')}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/admin/tourism/ticket/get-sales-history-tickets`} locale={locale} className="text-sm">
                {t('ticketSalesHistory')}
              </Link>
            </li>
            <li>
           <Link href={`/${locale}/admin/sales-history-products`} locale={locale} className="text-sm">
                {t('productSalesHistory')}
             </Link>
             </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdminMenu;
