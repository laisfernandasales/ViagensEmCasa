'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/services/cart/CartContext';
import ToggleThemeButton from './ToggleThemeButton';
import ModalLogin from '../modals/Login';
import Register from '../modals/Register';
import { useRegister } from '@/hooks/useRegister';
import type { Session } from 'next-auth';

interface HeaderProps {
  locale: string;
}

const Header = ({ locale }: HeaderProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownStates, setDropdownStates] = useState({
    accountDropdown: false,
    userDropdown: false,
    cartDropdown: false,
  });

  const router = useRouter();
  const { cart } = useCart();
  const accountDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const cartDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const session = await getSession();
      setSession(session);
      setLoading(false);
    };
    fetchSession();
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target as Node)) {
        setDropdownStates(prev => ({ ...prev, accountDropdown: false }));
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setDropdownStates(prev => ({ ...prev, userDropdown: false }));
      }
      if (cartDropdownRef.current && !cartDropdownRef.current.contains(event.target as Node)) {
        setDropdownStates(prev => ({ ...prev, cartDropdown: false }));
      }
    };

    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  const handleCloseModal = () => {
    setLoginOpen(false);
    setSignupOpen(false);
  };

  const switchToLogin = () => {
    setSignupOpen(false);
    setLoginOpen(true);
  };

  const switchToSignup = () => {
    setLoginOpen(false);
    setSignupOpen(true);
  };

  const handleLogout = async () => {
    await signOut();
    setSession(null);
    router.push(`/${locale}`);
  };

  const handleLoginSuccess = async () => {
    const session = await getSession();
    setSession(session);
    setLoginOpen(false);
  };

  const { message, handleSubmit } = useRegister(handleCloseModal, switchToLogin);

  if (loading) return null;

  const isUserLoggedIn = !!session;
  const userAvatar = session?.user?.image || '/images/profile.png';

  const handleLocaleChange = (newLocale: string) => {
    window.location.href = `/${newLocale}`;
  };

  const userRole = session?.user?.role;
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);

  return (
    <>
      <header className="navbar h-16 bg-base-200 shadow-lg flex justify-between items-center p-4">
        <div className="flex-1 flex items-center">
          <Link href="/" locale={locale} className="btn btn-ghost normal-case text-xl header-link">
            VIAGENS EM CASA
          </Link>
          <Link href={`/${locale}/marketplace`} locale={locale} className="btn btn-ghost normal-case text-xl header-link">
            Marketplace
          </Link>
        </div>
        <div className="flex-none flex items-center space-x-4">
          <div className="flex space-x-2">
            <button onClick={() => handleLocaleChange('pt')} className="focus:outline-none">
              <img src="/icons/pt.png" alt="Português" className="w-6 h-6" />
            </button>
            <button onClick={() => handleLocaleChange('es')} className="focus:outline-none">
              <img src="/icons/es.png" alt="Español" className="w-6 h-6" />
            </button>
            <button onClick={() => handleLocaleChange('en')} className="focus:outline-none">
              <img src="/icons/en.png" alt="English" className="w-6 h-6" />
            </button>
          </div>

          {!isUserLoggedIn || (userRole !== 'seller' && userRole !== 'admin') ? (
            <div className="dropdown dropdown-end" ref={cartDropdownRef}>
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle"
                onClick={() => setDropdownStates(prev => ({ ...prev, cartDropdown: !prev.cartDropdown }))}
              >
                <div className="indicator">
                  <span className="icon-[mdi--cart] h-5 w-5 text-base-content"></span>
                  <span className="badge badge-sm indicator-item bg-primary text-white">
                    {cartItemCount}
                  </span>
                </div>
              </div>
              {dropdownStates.cartDropdown && (
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
                        onClick={() => setDropdownStates(prev => ({ ...prev, cartDropdown: false }))}
                      >
                        Ver carrinho
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {isUserLoggedIn && (userRole === 'seller' || userRole === 'admin') && (
            <div className="dropdown dropdown-end" ref={accountDropdownRef}>
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle"
                onClick={() => setDropdownStates(prev => ({ ...prev, accountDropdown: !prev.accountDropdown }))}
              >
                {userRole === 'seller' ? (
                  <span className="icon-[mdi--storefront] h-7 w-7 text-base-content"></span>
                ) : (
                  <span className="icon-[mdi--account-group] h-7 w-7 text-base-content"></span>
                )}
              </div>
              {dropdownStates.accountDropdown && (
                <div
                  tabIndex={0}
                  className="card card-compact dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-56 p-2 shadow-md"
                >
                  <ul className="menu menu-compact">
                    {userRole === 'seller' && (
                      <>
                        <li>
                          <Link
                            href={`/${locale}/profile/all-products`}
                            locale={locale}
                            className="text-sm"
                          >
                            Ver os meus produtos
                          </Link>
                        </li>
                        <li>
                          <Link
                            href={`/${locale}/profile/add-product`}
                            locale={locale}
                            className="text-sm"
                          >
                            Adicionar Produto
                          </Link>
                        </li>
                      </>
                    )}
                    {userRole === 'admin' && (
                      <>
                        <li>
                          <Link
                            href={`/${locale}/admin/request-sellers`}
                            locale={locale}
                            className="text-sm"
                          >
                            Solicitações para Vendedores
                          </Link>
                        </li>
                        <li>
                          <Link
                            href={`/${locale}/admin/users`}
                            locale={locale}
                            className="text-sm"
                          >
                            Gerir Usuários
                          </Link>
                        </li>
                        <li>
                          <Link
                            href={`/${locale}/admin/products`}
                            locale={locale}
                            className="text-sm"
                          >
                            Gerir Produtos
                          </Link>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="dropdown dropdown-end" ref={userDropdownRef}>
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle"
              onClick={() => setDropdownStates(prev => ({ ...prev, userDropdown: !prev.userDropdown }))}
            >
              {isUserLoggedIn ? (
                <img alt="User Avatar" src={userAvatar} className="w-10 h-10 rounded-full" />
              ) : (
                <span className="icon-[mdi--account] h-6 w-6 text-base-content"></span>
              )}
            </div>
            {dropdownStates.userDropdown && (
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-48 p-2 shadow-md text-base-content"
              >
                {isUserLoggedIn ? (
                  <>
                    <li>
                      <Link href={`/${locale}/profile`} locale={locale} className="text-sm">
                        Perfil
                      </Link>
                    </li>
                    <li>
                      <a onClick={handleLogout} className="text-sm">
                        Logout
                      </a>
                    </li>
                    <li className="my-2 border-t border-gray-200"></li>
                  </>
                ) : (
                  <>
                    <li>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setLoginOpen(true);
                        }}
                        className="text-sm"
                      >
                        Iniciar Sessão
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setSignupOpen(true);
                        }}
                        className="text-sm"
                      >
                        Registrar
                      </a>
                    </li>
                    <li className="my-2 border-t border-gray-200"></li>
                  </>
                )}
                <li>
                  <ToggleThemeButton />
                </li>
              </ul>
            )}
          </div>
        </div>
      </header>

      <ModalLogin
        open={loginOpen}
        handleCloseModal={handleCloseModal}
        switchToSignup={switchToSignup}
        onLoginSuccess={handleLoginSuccess}
      />

      <Register
        open={signupOpen}
        handleCloseModal={handleCloseModal}
        switchToLogin={switchToLogin}
        handleSubmit={handleSubmit}
        message={message}
      />
    </>
  );
};

export default Header;
