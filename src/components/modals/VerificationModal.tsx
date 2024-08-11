import React from 'react';

type VerificationModalProps = {
  email: string;
  verificationCode: string;
  setVerificationCode: (code: string) => void;
  onVerify: () => void;
  onClose: () => void;
};

const VerificationModal: React.FC<VerificationModalProps> = ({ email, verificationCode, setVerificationCode, onVerify, onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Verifique seu novo email</h2>
        <p className="mb-4">Enviamos um código de verificação para {email}. Por favor, insira o código abaixo:</p>
        <input 
          type="text" 
          value={verificationCode} 
          onChange={(e) => setVerificationCode(e.target.value)} 
          className="input input-bordered w-full mb-4" 
        />
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="btn btn-outline btn-secondary">Cancelar</button>
          <button onClick={onVerify} className="btn btn-primary">Confirmar</button>
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;
