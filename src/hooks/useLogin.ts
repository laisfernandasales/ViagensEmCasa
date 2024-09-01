import { signIn, getSession } from 'next-auth/react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

export const useLogin = (
  handleCloseModal: () => void,
  onLoginSuccess?: () => void
) => {
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('hookLogin');

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

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (!result || result.error) {
        setError(t('invalidCredentials'));
        return;
      }

      const session = await getSession();

      if (!session?.user) {
        setError(t('userDetailsError'));
        return;
      }

      const userId = session.user.id;
      const response = await fetch(`/api/profile?userId=${userId}`);

      if (!response.ok) {
        const data = await response.json();
        setError(data.error);
        return;
      }

      onLoginSuccess?.();
      handleCloseModal();

    } catch (err) {
      console.error(t('loginErrorTryAgain'), err);
      setError(t('loginErrorTryAgain'));
    }
  };

  return { error, handleSubmit };
};
