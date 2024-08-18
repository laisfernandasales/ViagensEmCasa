import { useState, useRef } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

const AdminMenu = () => {
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
        <span className="icon-[mdi--account-group] h-7 w-7 text-base-content"></span>
      </div>
      {dropdownOpen && (
        <div
          tabIndex={0}
          className="card card-compact dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-56 p-2 shadow-md"
        >
          <ul className="menu menu-compact">
            <li>
              <Link href={`/${locale}/admin/request-sellers`} locale={locale} className="text-sm">
                Solicitações para Vendedores
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/admin/users`} locale={locale} className="text-sm">
                Gerir Usuários
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/admin/products`} locale={locale} className="text-sm">
                Gerir Produtos
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/admin/categories`} locale={locale} className="text-sm">
                Gerir Categorias
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/admin/tourism`} locale={locale} className="text-sm">
                Gerir Turismo
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdminMenu;
