import React, { useEffect } from 'react';
import { useLogin } from '@/hooks/useLogin';

interface ModalLoginProps {
  open: boolean;
  handleCloseModal: () => void;
  switchToSignup: () => void;
  onLoginSuccess: () => void;
}

const ModalLogin: React.FC<ModalLoginProps> = ({ open, handleCloseModal, switchToSignup, onLoginSuccess }) => {
  const { error, handleSubmit } = useLogin(handleCloseModal, onLoginSuccess);

  useEffect(() => {
    const modal = document.getElementById('my_modal') as HTMLDialogElement;
    if (open) {
      modal.showModal();
    } else {
      modal.close();
    }
  }, [open]);

  return (
    <dialog
      id="my_modal"
      className="modal"
      onClick={(e) => {
        const modal = document.getElementById('my_modal') as HTMLDialogElement;
        if (e.target === modal) {
          handleCloseModal();
        }
      }}
    >
      <div className="modal-box relative">
        <h3 className="font-bold text-3xl text-center mb-10">Iniciar Sessão</h3>
        {error && (
          <div role="alert" className="alert alert-error mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0 stroke-current"
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
            Introduza o seu email
          </label>
          <input name="email" type="email" placeholder="Email" className="input input-bordered w-full" required />
          <label htmlFor="password" className="block text-sm font-medium">
            Introduza a sua senha
          </label>
          <input name="password" type="password" placeholder="Senha" className="input input-bordered w-full" required />
          <div className="modal-action flex justify-center">
            <button type="submit" className="btn btn-primary w-full">
              Iniciar Sessão
            </button>
          </div>
          <div className="text-center mt-4 text-sm">
            Ainda não tem uma conta?{' '}
            <a href="#" onClick={switchToSignup} className="text-primary">
              Registe-se aqui
            </a>
          </div>
        </form>
      </div>
    </dialog>
  );
};

export default ModalLogin;
