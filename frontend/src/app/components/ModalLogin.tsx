import React from 'react';

interface ModalProps {
  showModal: boolean;
  handleCloseModal: () => void;
  title: string;
}

const ModalLogin: React.FC<ModalProps> = ({ showModal, handleCloseModal, title }) => {
  React.useEffect(() => {
    const modal = document.getElementById('my_modal_2') as HTMLDialogElement;
    if (showModal) {
      modal.showModal();
    } else {
      modal.close();
    }
  }, [showModal]);

  return (
    <dialog id="my_modal_2" className="modal" onClick={(e) => {
      const modal = document.getElementById('my_modal_2') as HTMLDialogElement;
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
        <h3 className="font-bold text-3xl text-center mb-10 text-base-content">Iniciar Sessão</h3>
        <form className="space-y-4" onSubmit={(e) => {
          e.preventDefault();
          handleCloseModal();
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
            Ainda não tem uma conta? <a href="#" className="text-primary">Registe-se aqui</a>
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
