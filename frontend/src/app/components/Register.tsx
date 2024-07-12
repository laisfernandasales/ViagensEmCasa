import React, { useState } from 'react';

interface RegisterProps {
  open: boolean;
  handleCloseModal: () => void;
  switchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ open, handleCloseModal, switchToLogin }) => {
  const [isVendor, setIsVendor] = useState(false);

  const handleCheckboxChange = () => {
    setIsVendor(!isVendor);
  };

  return (
    <dialog id="my_modal" className={`modal ${isVendor ? 'modal-wide' : ''}`} open={open}>
      <div className="modal-box relative">
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
        <h3 className="font-bold text-3xl text-center mb-8">Registrar</h3>
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className={`form-content ${isVendor ? 'form-content-wide' : ''}`}>
            <div className="form-user space-y-4">
              <label className="input input-bordered flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="h-4 w-4 opacity-70 text-black">
                  <path
                    fillRule="evenodd"
                    d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3ZM8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                    clipRule="evenodd" />
                </svg>
                <input type="text" className="grow text-black" placeholder="Nome de Utilizador" />
              </label>
              
              <label className="input input-bordered flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="h-4 w-4 opacity-70 text-black">
                  <path
                    d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
                  <path
                    d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
                </svg>
                <input type="text" className="grow text-black" placeholder="Insira o seu email" />
              </label>
              <label className="input input-bordered flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="h-4 w-4 opacity-70 text-black">
                  <path
                    fillRule="evenodd"
                    d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 1 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                    clipRule="evenodd" />
                </svg>
                <input type="password" className="grow text-black" placeholder="Digite a sua senha pretendida" />
              </label>
              <label className="input input-bordered flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="h-4 w-4 opacity-70 text-black">
                  <path
                    fillRule="evenodd"
                    d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 1 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                    clipRule="evenodd" />
                </svg>
                <input type="password" className="grow text-black" placeholder="Confirme novamente a senha pretendida" />
              </label>
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Deseja fazer o registo como vendedor?</span>
                  <input type="checkbox" checked={isVendor} onChange={handleCheckboxChange} className="checkbox checkbox-primary" />
                </label>
              </div>
            </div>
            {isVendor && (
              <div className="form-vendor space-y-4">
                <input type="text" placeholder="Nome da Loja" className="input input-bordered w-full text-black" />
                <input type="text" placeholder="Número Fiscal" className="input input-bordered w-full text-black" />
                <input type="text" placeholder="Endereço da Loja" className="input input-bordered w-full text-black" />
                <input type="text" placeholder="Telefone de Contacto" className="input input-bordered w-full text-black" />
              </div>
            )}
          </div>
        </form>
        <div className="modal-action">
          <button className="btn">Registrar</button>
          <button className="btn" onClick={switchToLogin}>Voltar</button>
        </div>
      </div>
    </dialog>
  );
};

export default Register;
