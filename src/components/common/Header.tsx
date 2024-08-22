'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { useSession } from 'next-auth/react';
import LanguageSwitcher from './header-components/LanguageSwitcher';
import CartMenu from './header-components/CartMenu';
import SellerMenu from './header-components/SellerMenu';
import AdminMenu from './header-components/AdminMenu';
import UserMenu from './header-components/UserMenu';
import NotificationMenu from './header-components/NotificationMenu';
import ModalLogin from '../modals/Login';
import Register from '../modals/Register';
import { useRegister } from '@/hooks/useRegister';

const Header = () => {
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const locale = useLocale();
  const { update, data: session } = useSession();

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

  const handleLoginSuccess = async () => {
    setLoginOpen(false);
    update();
  };

  const { message, handleSubmit } = useRegister(handleCloseModal, switchToLogin);

  return (
    <>
      <header className="navbar h-16 bg-base-200 p-4 fixed-header flex justify-between">
        <div className="w-1/3 flex items-center justify-start">
          <Link
            href={`/${locale}/`}
            locale={locale}
            className="flex items-center btn btn-ghost normal-case text-2xl header-link"
          >
            <Image src="/icons/home.png" alt="Home" width={24} height={24} />
            <span className="truncate hidden md:block">VIAGENS EM CASA</span>
          </Link>
        </div>
        <div className="w-1/3 flex items-center justify-center">
          <Link
            href={`/${locale}/marketplace`}
            locale={locale}
            className="btn btn-ghost normal-case text-2xl header-link flex items-center"
          >
            <Image
              src="/icons/market.png"
              alt="Market"
              width={24}
              height={24}
              className="block md:hidden"
            />
            <span className="hidden md:block truncate">Mercado</span>
          </Link>
          <Link
            href={`/${locale}/ticketplace`}
            locale={locale}
            className="btn btn-ghost normal-case text-2xl header-link flex items-center"
          >
            <Image
              src="/icons/tourism.png"
              alt="Tourism"
              width={24}
              height={24}
              className="block md:hidden"
            />
            <span className="hidden md:block truncate">Turismo</span>
          </Link>
        </div>
        <div className="w-1/3 flex items-center justify-end space-x-4">
          <LanguageSwitcher />
          <div className="flex items-center">
            {session?.user?.role === 'seller' ? (
              <SellerMenu />
            ) : session?.user?.role === 'admin' ? (
              <AdminMenu />
            ) : (
              <CartMenu />
            )}
          </div>
          <div className="flex items-center">
          <NotificationMenu/>
          </div>
          <div className="flex items-center">
            <UserMenu
              setLoginOpen={setLoginOpen}
              setSignupOpen={setSignupOpen}
              handleLoginSuccess={handleLoginSuccess}
            />
          </div>
        </div>
      </header>

      <ModalLogin
        open={loginOpen}
        locale={locale}
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
