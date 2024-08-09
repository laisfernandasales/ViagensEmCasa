import React, { useEffect, useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

interface ModalLoginProps {
  open: boolean;
  handleCloseModal: () => void;
  switchToSignup: () => void;
  onLoginSuccess: () => void;
}

const ModalLogin: React.FC<ModalLoginProps> = ({
  open,
  handleCloseModal,
  switchToSignup,
  onLoginSuccess,
}) => {
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('login');

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

      const session = await getSession();

      if (!session || !session.user) {
        setError('Não foi possível obter os detalhes do usuário após o login.');
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
      console.error('Erro ao tentar fazer login:', err);
      setError('Erro ao tentar fazer login. Tente novamente mais tarde.');
    }
  };

  return (
    <dialog
      id="my_modal"
      className="modal"
      onClick={(e) => e.target === e.currentTarget && handleCloseModal()}
    >
      <div className="modal-box relative">
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
          <div className="text-center mt-4 text-sm">
            {t('signup')}{' '}
            <a href="#" onClick={switchToSignup} className="text-primary">
              {t('signup_link')}
            </a>
          </div>
        </form>
      </div>
    </dialog>
  );
};

export default ModalLogin;
