'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const router = useRouter();
  const t = useTranslations('ResetPasswordPage');
  const locale = 'pt';

  const handleSendCode = async () => {
    setError('');
    setMessage('');

    const response = await fetch('/api/auth/send-reset-password-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (response.ok) {
      setMessage(t('codeSentSuccess'));
      setCodeSent(true);
    } else {
      setError(data.error || t('codeSentError'));
    }
  };

  const handleResetPassword = async () => {
    setError('');
    setMessage('');

    const response = await fetch('/api/auth/confirm-reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code, newPassword, confirmPassword }), 
    });

    const data = await response.json();
    if (response.ok) {
      setResetSuccess(true);
      setMessage(t('passwordResetSuccess'));
    } else {
      setError(data.error || t('passwordResetError'));
    }
  };

  const handleRedirectHome = () => {
    router.push(`/${locale}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-base-100 shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-center">{t('resetPasswordTitle')}</h1>
        
        {message && !resetSuccess && <p className="text-green-500 text-center mt-4">{message}</p>}
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        
        {!codeSent && !resetSuccess && (
          <>
            <div className="mt-4">
              <label htmlFor="email" className="block text-sm font-medium">
                {t('emailLabel')}
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input input-bordered w-full"
              />
            </div>

            <button
              onClick={handleSendCode}
              className="btn btn-primary mt-4 w-full"
            >
              {t('sendCodeButton')}
            </button>
          </>
        )}

        {codeSent && !resetSuccess && (
          <>
            <div className="mt-4">
              <label htmlFor="code" className="block text-sm font-medium">
                {t('verificationCodeLabel')}
              </label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="input input-bordered w-full"
              />
            </div>

            <div className="mt-4">
              <label htmlFor="newPassword" className="block text-sm font-medium">
                {t('newPasswordLabel')}
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input input-bordered w-full"
              />
            </div>

            <div className="mt-4">
              <label htmlFor="confirmPassword" className="block text-sm font-medium">
                {t('confirmPasswordLabel')}
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input input-bordered w-full"
              />
            </div>

            <button
              onClick={handleResetPassword}
              className="btn btn-primary mt-4 w-full"
            >
              {t('resetPasswordButton')}
            </button>
          </>
        )}

        {resetSuccess && (
          <div className="text-center mt-4">
            <p className="text-green-500">{t('passwordResetSuccessMessage')}</p>
            <button
              onClick={handleRedirectHome}
              className="btn btn-primary mt-4"
            >
              {t('okButton')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
