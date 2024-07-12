import React from 'react';

interface ModalLoginProps {
  open: boolean;
  handleCloseModal: () => void;
  switchToSignup: () => void;
}

const ModalLogin: React.FC<ModalLoginProps> = ({ open, handleCloseModal, switchToSignup }) => {
  React.useEffect(() => {
    const modal = document.getElementById('my_modal') as HTMLDialogElement;
    if (open) {
      modal.showModal();
    } else {
      modal.close();
    }
  }, [open]);

  return (
    <dialog id="my_modal" className="modal" onClick={(e) => {
      const modal = document.getElementById('my_modal') as HTMLDialogElement;
      if (e.target === modal) {
        handleCloseModal();
      }
    }}>
      <div className="modal-box glass" style={{ 
        '--glass-blur': '15px', 
        '--glass-opacity': '0.1', 
        '--glass-border-opacity': '0.1', 
        '--glass-reflex-degree': '45deg', 
        '--glass-reflex-opacity': '0.25', 
        '--glass-text-shadow-opacity': '0.1' 
      } as React.CSSProperties}>
        <button className="btn btn-circle absolute right-2 top-2" onClick={handleCloseModal}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 className="font-bold text-3xl text-center mb-10 text-base-content">Iniciar Sessão</h3>
        <form className="space-y-4" onSubmit={(e) => {
          e.preventDefault();
        }}>
          <label htmlFor="email" className="block text-sm font-medium text-base-content">
            Introduza o seu email
          </label>
          <input type="email" placeholder="Email" className="input input-bordered w-full" required />
          <label htmlFor="password" className="block text-sm font-medium text-base-content">
            Introduza a sua senha
          </label>
          <input type="password" placeholder="Senha" className="input input-bordered w-full" required />
          <div className="flex justify-between items-center">
            <label className="flex items-center text-sm text-base-content">
              <input type="checkbox" className="checkbox checkbox-primary" />
              <span className="ml-2">Lembrar-me</span>
            </label>
            <a href="#" className="text-sm text-primary">Esqueceu-se da senha?</a>
          </div>
          <div className="modal-action flex justify-center">
            <button type="submit" className="btn btn-primary w-full">Iniciar Sessão</button>
          </div>
          <div className="text-center mt-4 text-sm">
            Ainda não tem uma conta? <a href="#" onClick={switchToSignup} className="text-primary">Registe-se aqui</a>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={handleCloseModal}>Fechar</button>
      </form>
    </dialog>
  );
};

export default ModalLogin;
