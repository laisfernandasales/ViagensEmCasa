'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useLogout } from '@/hooks/useLogout';

type EditProfilePageProps = {
  params: {
    locale: string;
  };
};

export default function EditProfilePage({ params: { locale } }: EditProfilePageProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const { handleLogout, loggingOut } = useLogout({ locale });

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    birthDate: '',
    gender: '',
    shippingAddress: '',
    billingAddress: '',
    image: ''
  });
  const [imagePreview, setImagePreview] = useState<string | ArrayBuffer | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isEmailChanged, setIsEmailChanged] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?.id) {
        router.push('/');
        return;
      }

      try {
        const response = await fetch(`/api/profile?userId=${session.user.id}`);
        if (!response.ok) throw new Error('Falha ao buscar dados do usuário');

        const userData = await response.json();
        setFormData(userData);
        setImagePreview(userData.image);
        setLoading(false);
      } catch (error) {
        setError('Ocorreu um erro ao carregar os dados.');
        setLoading(false);
        setShowErrorModal(true);
      }
    };

    fetchUserData();
  }, [session, router]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'email') setIsEmailChanged(true);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | null) => {
    setFormData((prev) => ({ ...prev, birthDate: date ? date.toISOString().split('T')[0] : '' }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setSelectedFile(file);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(formData.image);
      setSelectedFile(null);
    }
  };

  const handleProfileUpdate = async () => {
    if (!session) {
      setError('No session found');
      setShowErrorModal(true);
      return;
    }

    const data = {
      name: formData.name,
      phone: formData.phone || null,
      birthDate: formData.birthDate || null,
      gender: formData.gender || null,
      shippingAddress: formData.shippingAddress || null,
      billingAddress: formData.billingAddress || null,
    };

    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': session.user.id,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error((await response.json()).error || response.statusText);

      setSuccessMessage('Seu perfil foi atualizado com sucesso.');
      setShowSuccessModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro ao atualizar dados do usuário.');
      setShowErrorModal(true);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!session) {
      setError('No session found');
      setShowErrorModal(true);
      return;
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': session.user.id,
        },
        body: JSON.stringify(passwordData),
      });

      if (!response.ok) throw new Error((await response.json()).error || response.statusText);

      setError(null);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordFields(false);
      setSuccessMessage('Sua senha foi atualizada com sucesso. Faça login novamente com sua nova senha.');
      setShowSuccessModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro ao atualizar a senha.');
      setShowErrorModal(true);
    }
  };

  const handleEmailChange = async () => {
    if (formData.email === session?.user?.email) {
      setError('O email fornecido já é o seu email atual.');
      setShowErrorModal(true);
      return;
    }

    try {
      const response = await fetch('/api/auth/send-verification-new-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      });

      if (!response.ok) throw new Error((await response.json()).error || response.statusText);

      setShowVerificationModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro ao enviar código de verificação.');
      setShowErrorModal(true);
    }
  };

  const handleVerificationCodeSubmit = async () => {
    try {
      const response = await fetch('/api/auth/verify-new-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session?.user?.id,
          verificationCode: verificationCode,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Ocorreu um erro ao verificar o código.');
      setShowVerificationModal(false);
      setSuccessMessage('Seu e-mail foi atualizado com sucesso. Faça login novamente com seu novo e-mail.');
      setShowSuccessModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro ao verificar o código.');
      setShowErrorModal(true);
    }
  };

  const handleSubmit = async () => {
    if (isEmailChanged) {
      await handleEmailChange();
    } else {
      await handleProfileUpdate();
    }
  };

  if (loading || loggingOut) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-base-100 shadow-lg rounded-lg p-8 border border-base-content/20">
        <h2 className="text-4xl font-bold text-center text-primary mb-8">Editar Perfil do Usuário</h2>
        <form>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={() => router.push(`/${locale}/profile`)} className="btn btn-outline btn-secondary">Cancelar</button>
            <button type="button" onClick={handleSubmit} className="btn btn-primary">Salvar</button>
          </div>
        </form>
      </div>

      {showVerificationModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Verifique seu email</h3>
            <p>Insira o código que foi enviado para seu novo email.</p>
            <input 
              type="text" 
              value={verificationCode} 
              onChange={(e) => setVerificationCode(e.target.value)} 
              className="input input-bordered w-full mt-4" 
              placeholder="Código de verificação" 
            />
            <div className="modal-action">
              <button onClick={handleVerificationCodeSubmit} className="btn btn-primary">Verificar</button>
              <button onClick={() => setShowVerificationModal(false)} className="btn">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {showErrorModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-error">Erro</h3>
            <p>{error}</p>
            <div className="modal-action">
              <button onClick={() => setShowErrorModal(false)} className="btn">Fechar</button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-success">Sucesso</h3>
            <p>{successMessage}</p>
            <div className="modal-action">
              <button 
                onClick={() => {
                  setShowSuccessModal(false);
                  handleLogout();
                }} 
                className="btn btn-primary"
              >
                Fazer Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
