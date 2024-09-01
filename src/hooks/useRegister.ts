import { useState } from 'react';
import { useTranslations } from 'next-intl';

export const useRegister = (
  handleCloseModal: () => void,
  switchToLogin: () => void
) => {
  const [message, setMessage] = useState<string>('');
  const t = useTranslations('useRegister');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!username || !email || !password || !confirmPassword) {
      setMessage(t('allFieldsRequired'));
      return;
    }

    if (password !== confirmPassword) {
      setMessage(t('passwordsDoNotMatch'));
      return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(t('userRegisteredSuccessfully'));
        handleCloseModal();
        switchToLogin();
      } else {
        switch (data.errorCode) {
          case 1001:
            setMessage(t('emailAlreadyExists'));
            break;
          case 1002:
            setMessage(t('usernameAlreadyExists'));
            break;
          case 1003:
            setMessage(t('invalidData'));
            break;
          case 1000:
          default:
            setMessage(t('internalServerError'));
            break;
        }
      }
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      setMessage(t('registrationFailed'));
    }
  };

  return { message, handleSubmit };
};
