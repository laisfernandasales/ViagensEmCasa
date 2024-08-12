'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from 'next-auth/react';

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

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;
  if (!user) return <UserNotFoundAlert />;

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-base-100 shadow-lg rounded-lg p-8 border border-base-content/20">
        <h2 className="text-4xl font-bold text-center text-primary mb-8">Perfil do Usuário</h2>
        <ProfileAvatar image={user.image} />
        <div className="flex flex-col space-y-6">
          {Object.entries(userDetails(user)).map(([label, value]) => (
            <div key={label}>
              <UserDetail label={label} value={value} />
              <div className="border-t border-dashed border-base-content/30 my-4"></div>
            </div>
          ))}
        </div>
        <UserActions 
          userRole={userRole} 
          locale={locale} 
          router={router} 
        />
      </div>
    </div>
  );
}

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <span className="loading loading-spinner loading-lg text-primary"></span>
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
  <div className="avatar flex justify-center mb-6">
    <div className="ring-primary ring-offset-base-100 w-32 h-32 rounded-full ring ring-offset-2">
      <img src={image} alt="Foto de Perfil" className="w-full h-full object-cover rounded-full"/>
    </div>
  </div>
);

const UserDetail = ({ label, value }: { label: string; value: string }) => (
  <div className="mb-2 flex justify-between items-center">
    <strong className="text-lg text-base-content">{label}:</strong> 
    <span className="text-base-content/80 text-base">{value}</span>
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

const UserActions = ({ userRole, locale, router }: { 
  userRole: string | null; 
  locale: string; 
  router: any;
}) => (
  <div className="flex flex-col items-center mt-8 space-y-4">
    <button 
      onClick={() => router.push(`/${locale}/profile/edit-profile`)} 
      className="btn btn-secondary w-full"
    >
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
