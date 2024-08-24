'use client';

import React, { useEffect, useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

interface ModalLoginProps {
  open: boolean;
  handleCloseModal: () => void;
  switchToSignup: () => void;
  onLoginSuccess: () => void;
  locale: string;
}

const ModalLogin: React.FC<ModalLoginProps> = ({
  open,
  handleCloseModal,
  switchToSignup,
  onLoginSuccess,
  locale,
}) => {
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('login');
  const router = useRouter();
  const { executeRecaptcha } = useGoogleReCaptcha();

  useEffect(() => {
    const modal = document.getElementById('my_modal') as HTMLDialogElement;
    open ? modal.showModal() : modal.close();
  }, [open]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      setError(t('fillAllFields'));
      return;
    }

    if (!executeRecaptcha) {
      console.log(t('recaptchaNotAvailable'));
      setError(t('recaptchaError'));
      return;
    }

    const gRecaptchaToken = await executeRecaptcha('login');

    try {
      const response = await axios.post("/api/recaptcha", { gRecaptchaToken }, {
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      });

      if (response?.data?.success === true) {
        const result = await signIn('credentials', {
          redirect: false,
          email,
          password,
        });

        if (!result || result.error) {
          setError(result?.error ?? t('loginError'));
          return;
        }

        const session = await getSession();

        if (!session?.user) {
          setError(t('userDetailsError'));
          return;
        }

        const userId = session.user.id;
        const profileResponse = await fetch(`/api/profile?userId=${userId}`);

        if (!profileResponse.ok) {
          const data = await profileResponse.json();
          setError(data.error);
          return;
        }

        onLoginSuccess?.();
        handleCloseModal();
      } else {
        console.log(t('recaptchaFailure', { score: response?.data?.score }));
        setError(t('recaptchaFailureMessage'));
      }
    } catch (err) {
      console.error(t('recaptchaVerificationError'), err);
      setError(t('recaptchaVerificationErrorMessage'));
    }
  };

  const handlePasswordReset = () => {
    router.push(`/${locale}/profile/reset-password`);
    handleCloseModal();
  };

  return (
    <dialog id="my_modal" className="modal">
      <div className="modal-box relative">
        <button
          onClick={handleCloseModal}
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >
          ✕
        </button>
        <h3 className="font-bold text-3xl text-center mb-10">{t('title')}</h3>
        {error && (
          <div role="alert" className="alert alert-error mb-4 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0 stroke-current mr-2"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label htmlFor="email" className="block text-sm font-medium">
            {t('email')}
          </label>
          <input
            name="email"
            type="email"
            placeholder={t('email')}
            className="input input-bordered w-full"
            required
          />
          <label htmlFor="password" className="block text-sm font-medium">
            {t('password')}
          </label>
          <input
            name="password"
            type="password"
            placeholder={t('password')}
            className="input input-bordered w-full"
            required
          />
          <div className="modal-action flex justify-center">
            <button type="submit" className="btn btn-primary w-full">
              {t('submit')}
            </button>
          </div>
          <div className="text-center mt-4 text-sm space-y-2">
            <div>
              {t('noAccount')}{' '}
              <button type="button" onClick={switchToSignup} className="text-primary font-bold">
                {t('signupLink')}
              </button>
            </div>
            <div>
              {t('forgotPassword')}{' '}
              <button type="button" onClick={handlePasswordReset} className="text-secondary font-bold">
                {t('resetHere')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </dialog>
  );
};

export default ModalLogin;
