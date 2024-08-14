'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';

const VerifyEmail = () => {
  const { data: session, status, update } = useSession();
  const [verificationCode, setVerificationCode] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (status === 'unauthenticated') {
      setMessage('Não existe sessão iniciada.');
      setLoading(false);
    } else if (status === 'authenticated' && session?.user?.verifiedEmail && !showSuccessModal) {
      setMessage('Seu email já está verificado.');
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [status, session, showSuccessModal]);

  const handleSendVerificationEmail = async () => {
    if (status !== 'authenticated' || !session?.user?.email) {
      setMessage('Usuário não autenticado ou e-mail não encontrado.');
      return;
    }

    try {
      const response = await fetch('/api/auth/send-verification-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: session.user.email }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Código de verificação enviado!');
      } else {
        setMessage(data.error || 'Erro ao enviar o código de verificação');
      }
    } catch (error) {
      setMessage('Erro ao enviar o código de verificação');
      console.error(error);
    }
  };

  const handleVerifyCode = async () => {
    if (status !== 'authenticated' || !session?.user?.id) {
      setMessage('Usuário não autenticado.');
      return;
    }

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          verificationCode,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setShowSuccessModal(true);
        await update({ verifiedEmail: true });
      } else {
        setMessage(data.error || 'Erro ao verificar o código');
      }
    } catch (error) {
      setMessage('Erro ao verificar o código');
      console.error(error);
    }
  };

  const handleGoHome = () => {
    const locale = pathname.split('/')[1];
    router.push(`/${locale}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-200">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!showSuccessModal && (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.verifiedEmail))) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-200">
        <div className="bg-base-100 p-8 rounded-lg shadow-lg max-w-md w-full text-center space-y-4">
          <h1 className="text-3xl font-bold text-primary">{message}</h1>
          <button onClick={handleGoHome} className="btn btn-primary w-full">
            Ir para Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200">
      <div className="bg-base-100 p-8 rounded-lg shadow-lg max-w-md w-full text-center space-y-4">
        <h1 className="text-3xl font-bold text-primary">Verifique seu E-mail</h1>
        <p className="text-base-content">
          Clique no botão abaixo para enviar o código de verificação para o seu e-mail.
        </p>
        <button
          onClick={handleSendVerificationEmail}
          className="btn btn-primary w-full"
          disabled={status !== 'authenticated'}
        >
          Enviar E-mail de Verificação
        </button>
        <div className="form-control">
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            className="input input-bordered w-full"
            placeholder="Digite o código de verificação"
          />
        </div>
        <button
          onClick={handleVerifyCode}
          className="btn btn-secondary w-full"
          disabled={status !== 'authenticated'}
        >
          Verificar E-mail
        </button>
        {message && <p className="mt-4 text-info">{message}</p>}

        {showSuccessModal && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg">O seu email foi verificado com sucesso</h3>
              <div className="modal-action">
                <button className="btn btn-primary" onClick={handleGoHome}>OK</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
