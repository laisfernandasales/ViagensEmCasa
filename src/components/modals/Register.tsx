import React from 'react';
import { useTranslations } from 'next-intl';

interface RegisterProps {
  open: boolean;
  handleCloseModal: () => void;
  switchToLogin: () => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  message: string;
}

const Register: React.FC<RegisterProps> = ({ open, handleCloseModal, switchToLogin, handleSubmit, message }) => {
  const t = useTranslations('register');

  return (
    <dialog
      id="my_modal"
      className="modal"
      open={open}
      onClick={(e) => {
        const dialog = document.getElementById('my_modal') as HTMLDialogElement;
        if (e.target === dialog) {
          handleCloseModal();
        }
      }}
    >
      <div className="modal-box relative">
        <h3 className="font-bold text-3xl text-center mb-8">{t('register')}</h3>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="form-content">
            <div className="form-user space-y-4">
              <label className="input input-bordered flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="h-4 w-4 opacity-70 text-black">
                  <path
                    fillRule="evenodd"
                    d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3ZM8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                    clipRule="evenodd" />
                </svg>
                <input
                  type="text"
                  name="username"
                  className="grow text-black"
                  placeholder={t('username')}
                  required
                />
              </label>
              
              <label className="input input-bordered flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="h-4 w-4 opacity-70 text-black">
                  <path
                    d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
                  <path
                    d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
                </svg>
                <input
                  type="email"
                  name="email"
                  className="grow text-black"
                  placeholder={t('email')}
                  required
                />
              </label>
              <label className="input input-bordered flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="h-4 w-4 opacity-70 text-black">
                  <path
                    fillRule="evenodd"
                    d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2.293a.5.5 0 0 1-.353-.146l3.955-3.955A4 4 1 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                    clipRule="evenodd" />
                </svg>
                <input
                  type="password"
                  name="password"
                  className="grow text-black"
                  placeholder={t('password')}
                  required
                />
              </label>
              <label className="input input-bordered flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="h-4 w-4 opacity-70 text-black">
                  <path
                    fillRule="evenodd"
                    d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2.293a.5.5 0 0 1-.353-.146l3.955-3.955A4 4 1 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                    clipRule="evenodd" />
                </svg>
                <input
                  type="password"
                  name="confirmPassword"
                  className="grow text-black"
                  placeholder={t('confirmPassword')}
                  required
                />
              </label>
            </div>
          </div>
          <div className="modal-action">
            <button type="submit" className="btn">{t('register')}</button>
            <button type="button" className="btn" onClick={switchToLogin}>{t('back')}</button>
          </div>
          {message && <p className="text-center text-red-500 mt-4">{message}</p>}
        </form>
      </div>
    </dialog>
  );
};

export default Register;
