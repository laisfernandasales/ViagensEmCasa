'use client';
import React, { useState } from 'react';
import { useLocale } from 'next-intl';
import { useSession } from 'next-auth/react';
import LogoButton from './header-components/LogoButton';
import MarketLink from './header-components/MarketLink';
import TourismLink from './header-components/TourismLink';
import LanguageSwitcher from './header-components/LanguageSwitcher';
import CartMenu from './header-components/CartMenu';
import SellerMenu from './header-components/SellerMenu';
import AdminMenu from './header-components/AdminMenu';
import UserMenu from './header-components/UserMenu';
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
      <header className="navbar h-16 bg-base-200 shadow-lg flex justify-between items-center p-4 fixed-header">
        <div className="flex-1 flex items-center">
          <div className="mr-4">
            <LogoButton />
          </div>
        </div>
        <div className="flex-1 flex justify-center space-x-8">
          <div>
            <MarketLink />
          </div>
          <div>
            <TourismLink />
          </div>
        </div>
        <div className="flex-1 flex justify-end space-x-4 items-center">
          <div>
            <LanguageSwitcher />
          </div>
          <div>
            <CartMenu />
          </div>
          {session?.user?.role === 'seller' && (
            <div>
              <SellerMenu />
            </div>
          )}
          {session?.user?.role === 'admin' && (
            <div>
              <AdminMenu />
            </div>
          )}
          <div>
            <UserMenu setLoginOpen={setLoginOpen} setSignupOpen={setSignupOpen} handleLoginSuccess={handleLoginSuccess} />
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
