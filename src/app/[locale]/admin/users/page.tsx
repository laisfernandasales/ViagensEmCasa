'use client';

import React, { useEffect, useState } from 'react';
import { useSession, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  phone: string | null;
  birthDate: string | null;
  gender: string | null;
  accountStatus: string;
}

export default function AdminUsers() {
  const t = useTranslations('admin-users-page');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const checkAdminRole = async () => {
      const session = await getSession();
      if (!session) {
        router.push('/');
      }
    };

    checkAdminRole();
  }, [router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/admin/users')
        .then((res) => {
          if (!res.ok) throw new Error(t('Erro ao buscar usuários'));
          return res.json();
        })
        .then((data) => setUsers(data.users))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [status, t]);

  const handleToggleUserStatus = async (userId: string) => {
    if (!window.confirm(t('confirm_toggle_status'))) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(t('Erro ao alterar status do usuário', { userId }));
      }

      const data = await response.json();
      const newStatus = data.newStatus;

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, accountStatus: newStatus } : user
        )
      );
    } catch (error) {
      console.error(t('Erro ao alterar status do usuário'), error);
      setError(t('Ocorreu um erro ao alterar o status do usuário'));
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><span className="loading loading-spinner loading-lg"></span></div>;
  if (error) return <div className="flex items-center justify-center min-h-screen"><div className="alert alert-error"><span>{error}</span></div></div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-8">{t('Gestão de Usuários')}</h1>
      <div className="w-full max-w-4xl bg-base-100 shadow-xl rounded-lg">
        <table className="table w-full bg-base-100 shadow-xl rounded-lg">
          <thead>
            <tr>
              <th>{t('Nome de Usuário')}</th>
              <th>{t('Email')}</th>
              <th>{t('Role')}</th>
              <th>{t('Telefone')}</th>
              <th>{t('Data de Nascimento')}</th>
              <th>{t('Gênero')}</th>
              <th>{t('Status')}</th>
              <th>{t('Ações')}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.username || 'N/A'}</td>
                <td>{user.email || 'N/A'}</td>
                <td>{user.role || 'N/A'}</td>
                <td>{user.phone ?? 'N/A'}</td>
                <td>{user.birthDate ?? 'N/A'}</td>
                <td>{user.gender ?? 'N/A'}</td>
                <td>{user.accountStatus === 'healthy' ? t('Ativo') : t('Desabilitado')}</td>
                <td>
                  <button
                    onClick={() => handleToggleUserStatus(user.id)}
                    className={`btn btn-sm ${user.accountStatus === 'healthy' ? 'btn-error' : 'btn-primary'}`}
                  >
                    {user.accountStatus === 'healthy' ? t('Desabilitar') : t('Habilitar')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
