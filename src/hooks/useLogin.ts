import { signIn, getSession } from 'next-auth/react';
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

      if (!result || result.error) {
        setError(result?.error || 'Erro ao tentar fazer login. Tente novamente.');
        return;
      }

      // Obter a sessão atual para acessar os detalhes do usuário
      const session = await getSession();

      if (!session || !session.user) {
        setError('Não foi possível obter os detalhes do usuário após o login.');
        return;
      }

      const userId = session.user.id;
      const response = await fetch(`/api/profile?userId=${userId}`);

      if (!response.ok) {
        const data = await response.json();
        setError(data.error);  // Exibindo exatamente a mensagem de erro retornada pela API
        return;
      }

      // Se a verificação do status da conta passar, prosseguir com o login
      onLoginSuccess?.();
      handleCloseModal();

    } catch (err) {
      console.error('Erro ao tentar fazer login:', err);
      setError('Erro ao tentar fazer login. Tente novamente mais tarde.');
    }
  };

  return { error, handleSubmit };
};
