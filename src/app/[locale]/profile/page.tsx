'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from 'next-auth/react';
import EditProfile from '@/components/modals/EditProfile';

export default function UserProfile({ params: { locale } }: { params: { locale: string } }) {
  const router = useRouter();
  const [user, setUser] = useState<{
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
  } | null>(null);
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

        const userId = session.user.id;
        const apiEndpoint = `/api/profile?userId=${userId}`;
        const response = await fetch(apiEndpoint);

        if (!response.ok) {
          throw new Error('Falha ao buscar dados do usuário');
        }

        const userData = await response.json();
        if (userData.error) {
          throw new Error('Usuário não encontrado');
        }

        setUser(userData);
      } catch (err) {
        setError('Ocorreu um erro ao buscar dados do usuário.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [locale, router]);

  const handleSave = async (formData: Record<string, any>) => {
    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar dados do usuário');
      }

      const result = await response.json();
      if (result.error) {
        throw new Error(result.error);
      }

      setUser((prevUser) => ({ ...prevUser, ...result }));
      setIsModalOpen(false);

      const session = await getSession();
      if (session?.user) {
        const userId = session.user.id;
        const apiEndpoint = `/api/profile?userId=${userId}`;
        const response = await fetch(apiEndpoint);
        if (response.ok) {
          const updatedUserData = await response.json();
          setUser(updatedUserData);
        }
      }
    } catch (err) {
      setError('Ocorreu um erro ao atualizar dados do usuário.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="alert alert-warning shadow-lg">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="alert alert-warning shadow-lg">
          <span>Usuário não encontrado</span>
        </div>
      </div>
    );
  }

  const accountStatusInPortuguese = user.accountStatus === 'healthy' ? 'Saudável' : user.accountStatus;

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl rounded-lg border border-primary">
        <div className="card-body text-left">
          <div className="avatar flex justify-center mb-4">
            <div className="ring-primary ring-offset-base-100 w-24 rounded-full ring ring-offset-2">
              <img src={user.image} alt="Foto de Perfil" />
            </div>
          </div>
          <div className="mb-2">
            <strong>Username:</strong> {user.username}
          </div>
          <div className="mb-2">
            <strong>Nome:</strong> {user.name}
          </div>
          <div className="mb-2">
            <strong>Email:</strong> {user.email}
          </div>
          <div className="mb-2">
            <strong>Telefone:</strong> {user.phone || 'Não informado'}
          </div>
          <div className="mb-2">
            <strong>Data de Nascimento:</strong> {user.birthDate || 'Não informado'}
          </div>
          <div className="mb-2">
            <strong>Gênero:</strong> {user.gender || 'Não informado'}
          </div>
          <div className="mb-2">
            <strong>Endereço de Envio:</strong> {user.shippingAddress || 'Não informado'}
          </div>
          <div className="mb-2">
            <strong>Endereço de Faturamento:</strong> {user.billingAddress || 'Não informado'}
          </div>
          <div className="mb-2">
            <strong>Status da Conta:</strong> {accountStatusInPortuguese || 'Não informado'}
          </div>
          <div className="flex flex-col items-center mt-4 space-y-4">
            <button
              onClick={() => setIsModalOpen(true)}
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
        </div>
      </div>
      {isModalOpen && (
        <EditProfile user={user} onClose={() => setIsModalOpen(false)} onSave={handleSave} />
      )}
    </div>
  );
}
