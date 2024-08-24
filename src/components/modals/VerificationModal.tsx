import React from 'react';
import { useTranslations } from 'next-intl';

type VerificationModalProps = {
  email: string;
  verificationCode: string;
  setVerificationCode: (code: string) => void;
  onVerify: () => void;
  onClose: () => void;
};

const VerificationModal: React.FC<VerificationModalProps> = ({ email, verificationCode, setVerificationCode, onVerify, onClose }) => {
  const t = useTranslations('VerificationModal');

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{t('verifyYourEmail')}</h2>
        <p className="mb-4">{t('sentCodeToEmail', { email })}</p>
        <input 
          type="text" 
          value={verificationCode} 
          onChange={(e) => setVerificationCode(e.target.value)} 
          className="input input-bordered w-full mb-4" 
        />
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="btn btn-outline btn-secondary">{t('cancel')}</button>
          <button onClick={onVerify} className="btn btn-primary">{t('confirm')}</button>
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;
