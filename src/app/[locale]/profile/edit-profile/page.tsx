'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

type EditProfilePageProps = {
  readonly params: {
    readonly locale: string;
  };
};

export default function EditProfilePage({ params: { locale } }: EditProfilePageProps) {
  const { data: session, update, status } = useSession();
  const router = useRouter();
  const t = useTranslations('EditProfile');

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    birthDate: '',
    gender: '',
    shippingAddress: '',
    billingAddress: '',
    image: session?.user?.image ?? ''
  });
  const [imagePreview, setImagePreview] = useState<string | ArrayBuffer | null>(session?.user?.image ?? '');
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
      if (status === 'loading') return;

      if (!session?.user) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/profile?userId=${session.user.id}`);
        if (!response.ok) throw new Error('Falha ao buscar dados do usuário');

        const userData = await response.json();
        setFormData((prev) => ({
          ...prev,
          ...userData,
          image: session?.user?.image || userData.image
        }));
        setImagePreview(session?.user?.image || userData.image);
        setLoading(false);
      } catch (error) {
        setError(t('fetchError'));
        setLoading(false);
        setShowErrorModal(true);
      }
    };

    fetchUserData();
  }, [session, status, router,t]);

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

  const handleImageSubmit = async () => {
    if (!selectedFile) {
      setError(t('noImageSelected'));
      setShowErrorModal(true);
      return;
    }
  
    const formData = new FormData();
    formData.append('image', selectedFile);
  
    try {
      const response = await fetch('/api/profile/update-image', {
        method: 'POST',
        headers: {
          'user-id': session?.user.id ?? '',
        },
        body: formData,
      });
  
      if (!response.ok) throw new Error((await response.json()).error || response.statusText);
  
      const updatedUserResponse = await fetch(`/api/profile?userId=${session?.user.id}`);
      if (!updatedUserResponse.ok) throw new Error(t('imageFetchError'));
  
      const updatedUserData = await updatedUserResponse.json();
      await update({ image: updatedUserData.image });
  
      setSuccessMessage(t('imageUpdateSuccess'));
      setShowSuccessModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('imageUpdateError'));
      setShowErrorModal(true);
    }
  };

  const fetchData = async (url: string, method: string, body: any) => {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'user-id': session?.user.id ?? '',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) throw new Error((await response.json()).error || response.statusText);

    return response;
  };

  const handleProfileUpdate = async () => {
    try {
      await fetchData('/api/profile/update', 'POST', {
        name: formData.name,
        phone: formData.phone || null,
        birthDate: formData.birthDate || null,
        gender: formData.gender || null,
        shippingAddress: formData.shippingAddress || null,
        billingAddress: formData.billingAddress || null,
      });

      setSuccessMessage(t('profileUpdateSuccess'));
      setShowSuccessModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('profileUpdateError'));
      setShowErrorModal(true);
    }
  };

  const handlePasswordUpdate = async () => {
    try {
      await fetchData('/api/auth/change-password', 'POST', passwordData);

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordFields(false);
      setSuccessMessage(t('passwordUpdateSuccess'));
      setShowSuccessModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('passwordUpdateError'));
      setShowErrorModal(true);
    }
  };

  const handleEmailChange = async () => {
    if (formData.email === session?.user?.email) {
      setError(t('sameEmailError'));
      setShowErrorModal(true);
      return;
    }

    try {
      await fetchData('/api/auth/send-verification-new-email', 'POST', { email: formData.email });
      setShowVerificationModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('verificationCodeSendError'));
      setShowErrorModal(true);
    }
  };

  const handleVerificationCodeSubmit = async () => {
    try {
      await fetchData('/api/auth/verify-new-email', 'POST', {
        userId: session?.user?.id,
        verificationCode: verificationCode,
      });

      const updatedEmail = formData.email;
      await update({ email: updatedEmail, verifiedEmail: true });

      setShowVerificationModal(false);
      setSuccessMessage(t('emailUpdateSuccess'));
      setShowSuccessModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('verificationCodeError'));
      setShowErrorModal(true);
    }
  };

  const handleSubmit = async () => {
    await handleProfileUpdate();
  };

  if (loading) return <div>{t('loading')}</div>;

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-200">
        <div className="bg-base-100 p-8 rounded-lg shadow-lg max-w-md w-full text-center space-y-4">
          <h1 className="text-3xl font-bold text-primary">{t('sessionNotFound')}</h1>
          <p className="text-base-content">{t('loginToViewProfile')}</p>
          <button onClick={() => router.push('/')} className="btn btn-primary w-full">
            {t('goToHome')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-base-100 shadow-lg rounded-lg p-8 border border-base-content/20">
        <h2 className="text-4xl font-bold text-center text-primary mb-8">{t('editUserProfile')}</h2>
        <form>
          <div className="mb-4">
            <label htmlFor="profileImage" className="block text-sm font-medium mb-2">{t('profileImage')}</label>
            <div className="flex flex-col items-center mb-4">
              {imagePreview && (
                <div className="w-24 h-24 relative rounded-full border border-gray-300">
                  <Image
                    src={imagePreview as string}
                    alt="Preview"
                    layout="fill"
                    objectFit="cover"
                    className="rounded-full"
                  />
                </div>
              )}
              <input 
                type="file" 
                id="profileImage" 
                accept="image/*" 
                onChange={handleImageChange} 
                className="mt-4 file-input file-input-bordered" 
              />
              {selectedFile && <button type="button" onClick={handleImageSubmit} className="btn btn-primary mt-4">{t('changeImage')}</button>}
            </div>
          </div>
          {[
            { label: t('name'), type: 'text', name: 'name', value: formData.name, disabled: false },
            { label: 'Username', type: 'text', name: 'username', value: formData.username, disabled: true },
            { label: 'Email', type: 'email', name: 'email', value: formData.email, disabled: false, autoComplete: 'off' },
          ].map(({ label, type, name, value, disabled, autoComplete }) => (
            <div key={name} className="mb-4">
              <label htmlFor={name} className="block text-sm font-medium mb-2">{label}</label>
              <input 
                type={type} 
                id={name} 
                name={name} 
                value={value} 
                onChange={handleFormChange} 
                className="input input-bordered w-full" 
                disabled={disabled} 
                autoComplete={autoComplete ?? 'off'}
              />
            </div>
          ))}
          {isEmailChanged && (
            <button type="button" onClick={handleEmailChange} className="btn btn-warning mb-4">
              {t('changeEmail')}
            </button>
          )}
          <div className="mb-4">
            <label htmlFor="phone" className="block text-sm font-medium mb-2">{t('phone')}</label>
            <input 
              type="text" 
              id="phone" 
              name="phone" 
              value={formData.phone} 
              onChange={handleFormChange} 
              className="input input-bordered w-full" 
            />
          </div>
          <div className="mb-4">
            <label htmlFor="birthDate" className="block text-sm font-medium mb-2">{t('birthDate')}</label>
            <DatePicker 
              selected={formData.birthDate ? new Date(formData.birthDate) : null}
              onChange={handleDateChange}
              className="input input-bordered w-full"
              dateFormat="dd/MM/yyyy"
              id="birthDate"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="gender" className="block text-sm font-medium mb-2">{t('gender')}</label>
            <select 
              id="gender" 
              name="gender" 
              value={formData.gender} 
              onChange={handleFormChange} 
              className="select select-bordered w-full"
            >
              <option value="">{t('select')}</option>
              <option value="Masculino">{t('male')}</option>
              <option value="Feminino">{t('female')}</option>
              <option value="Não binário">{t('nonBinary')}</option>
            </select>
          </div>
          {[
            { label: t('shippingAddress'), name: 'shippingAddress', value: formData.shippingAddress },
            { label: t('billingAddress'), name: 'billingAddress', value: formData.billingAddress },
          ].map(({ label, name, value }) => (
            <div key={name} className="mb-4">
              <label htmlFor={name} className="block text-sm font-medium mb-2">{label}</label>
              <textarea 
                id={name}
                name={name} 
                value={value} 
                onChange={handleFormChange} 
                className="textarea textarea-bordered w-full h-24" 
              />
            </div>
          ))}
          <button 
            type="button" 
            onClick={() => setShowPasswordFields(!showPasswordFields)} 
            className="btn btn-warning mb-4"
          >
            {t('changePassword')}
          </button>
          {showPasswordFields && (
            <>
              <div className="mb-4">
                <label htmlFor="currentPassword" className="block text-sm font-medium mb-2">{t('currentPassword')}</label>
                <input 
                  type="password" 
                  id="currentPassword" 
                  name="currentPassword" 
                  className="input input-bordered w-full" 
                  autoComplete="new-password" 
                  onChange={handlePasswordChange} 
                />
              </div>
              <div className="mb-4">
                <label htmlFor="newPassword" className="block text-sm font-medium mb-2">{t('newPassword')}</label>
                <input 
                  type="password" 
                  id="newPassword" 
                  name="newPassword" 
                  className="input input-bordered w-full" 
                  autoComplete="new-password" 
                  onChange={handlePasswordChange} 
                />
              </div>
              <div className="mb-4">
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">{t('confirmPassword')}</label>
                <input 
                  type="password" 
                  id="confirmPassword" 
                  name="confirmPassword" 
                  className="input input-bordered w-full" 
                  autoComplete="new-password" 
                  onChange={handlePasswordChange} 
                />
              </div>
              <div className="flex justify-start mb-4">
                <button type="button" onClick={handlePasswordUpdate} className="btn btn-primary">{t('savePassword')}</button>
              </div>
            </>
          )}
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={() => router.push(`/${locale}/profile`)} className="btn btn-outline btn-secondary">{t('cancel')}</button>
            <button type="button" onClick={handleSubmit} className="btn btn-primary">{t('save')}</button>
          </div>
        </form>
      </div>

      {showVerificationModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">{t('verifyEmailTitle')}</h3>
            <p>{t('verifyEmailMessage')}</p>
            <input 
              type="text" 
              value={verificationCode} 
              onChange={(e) => setVerificationCode(e.target.value)} 
              className="input input-bordered w-full mt-4" 
              placeholder={t('verificationCodePlaceholder')} 
            />
            <div className="modal-action">
              <button onClick={handleVerificationCodeSubmit} className="btn btn-primary">{t('verify')}</button>
              <button onClick={() => setShowVerificationModal(false)} className="btn">{t('cancel')}</button>
            </div>
          </div>
        </div>
      )}

      {showErrorModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-error">{t('error')}</h3>
            <p>{error}</p>
            <div className="modal-action">
              <button onClick={() => setShowErrorModal(false)} className="btn">{t('close')}</button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-success">{t('success')}</h3>
            <p>{successMessage}</p>
            <div className="modal-action">
              <button 
                onClick={async () => {
                  setShowSuccessModal(false);
                  await update();
                  router.back();
                }} 
                className="btn btn-primary"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
