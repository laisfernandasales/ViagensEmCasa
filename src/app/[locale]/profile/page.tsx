'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from 'next-auth/react';
import EditProfile from '@/components/modals/EditProfile';

interface User {
  name: string;
  username: string;
  email: string;
  image: string;
  phone: string;
  birthDate: string;
  gender: string;
  shippingAddress: string;
  billingAddress: string;
  accountStatus: string;
}

export default function UserProfile({ params: { locale } }: { params: { locale: string } }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const session = await getSession();
        if (!session?.user) {
          router.push(`/${locale}`);
          return;
        }

        setUserRole(session.user.role);

        const response = await fetch(`/api/profile?userId=${session.user.id}`);
        if (!response.ok) throw new Error('Falha ao buscar dados do usuário');

        const userData = await response.json();
        if (userData.error) throw new Error('Usuário não encontrado');

        setUser(userData);
      } catch {
        setError('Ocorreu um erro ao buscar dados do usuário.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [locale, router]);

  const handleSave = async (formData: Partial<User>) => {
    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Falha ao atualizar dados do usuário');

      const result = await response.json();
      if (result.error) throw new Error(result.error);

      setUser((prevUser) => (prevUser ? { ...prevUser, ...result } : null));
      setIsModalOpen(false);

      const session = await getSession();
      if (session?.user) {
        const updatedUserData = await (await fetch(`/api/profile?userId=${session.user.id}`)).json();
        setUser(updatedUserData);
      }
    } catch {
      setError('Ocorreu um erro ao atualizar dados do usuário.');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;
  if (!user) return <UserNotFoundAlert />;

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl rounded-lg border border-primary">
        <div className="card-body text-left">
          <ProfileAvatar image={user.image} />
          {Object.entries(userDetails(user)).map(([label, value]) => (
            <UserDetail key={label} label={label} value={value} />
          ))}
          <UserActions 
            userRole={userRole} 
            locale={locale} 
            onEditClick={() => setIsModalOpen(true)} 
            router={router} 
          />
        </div>
      </div>
      {isModalOpen && <EditProfile user={user} onClose={() => setIsModalOpen(false)} onSave={handleSave} />}
    </div>
  );
}

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <span className="loading loading-spinner loading-lg"></span>
  </div>
);

const ErrorAlert = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="alert alert-warning shadow-lg">
      <span>{message}</span>
    </div>
  </div>
);

const UserNotFoundAlert = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="alert alert-warning shadow-lg">
      <span>Usuário não encontrado</span>
    </div>
  </div>
);

const ProfileAvatar = ({ image }: { image: string }) => (
  <div className="avatar flex justify-center mb-4">
    <div className="ring-primary ring-offset-base-100 w-24 rounded-full ring ring-offset-2">
      <img src={image} alt="Foto de Perfil" />
    </div>
  </div>
);

const UserDetail = ({ label, value }: { label: string; value: string }) => (
  <div className="mb-2">
    <strong>{label}:</strong> {value}
  </div>
);

const userDetails = (user: User) => ({
  Username: user.username,
  Nome: user.name,
  Email: user.email,
  Telefone: user.phone || 'Não informado',
  'Data de Nascimento': user.birthDate || 'Não informado',
  Gênero: user.gender || 'Não informado',
  'Endereço de Envio': user.shippingAddress || 'Não informado',
  'Endereço de Faturamento': user.billingAddress || 'Não informado',
  'Status da Conta': user.accountStatus === 'healthy' ? 'Saudável' : user.accountStatus || 'Não informado',
});

const UserActions = ({ userRole, locale, onEditClick, router }: { 
  userRole: string | null; 
  locale: string; 
  onEditClick: () => void; 
  router: any;
}) => (
  <div className="flex flex-col items-center mt-4 space-y-4">
    <button onClick={onEditClick} className="btn btn-secondary w-full">
      Editar Dados de Perfil
    </button>
    {userRole !== 'seller' && userRole !== 'admin' && (
      <button
        className="btn btn-primary w-full"
        onClick={() => router.push(`/${locale}/profile/request-seller`)}
      >
        Solicitar conta de vendedor
      </button>
    )}
  </div>
);
