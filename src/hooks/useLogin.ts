import { signIn } from 'next-auth/react';
import { useState } from 'react';

export const useLogin = (
  handleCloseModal: () => void,
  onLoginSuccess?: () => void
) => {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError('Credenciais erradas. Tente novamente.');
      } else {
        onLoginSuccess?.(); // Call if defined
        handleCloseModal();
      }
    } catch (err) {
      console.error('Erro ao tentar fazer login:', err);
      setError('Erro ao tentar fazer login. Tente novamente mais tarde.');
    }
  };

  return { error, handleSubmit };
};
