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
  const t = useTranslations('AdminUsersPage');
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
          if (!res.ok) throw new Error(t('fetchError'));
          return res.json();
        })
        .then((data) => setUsers(data.users))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [status, t]);

  const handleToggleUserStatus = async (userId: string) => {
    if (!window.confirm(t('confirmToggleStatus'))) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(t('toggleStatusError', { userId }));
      }

      const data = await response.json();
      const newStatus = data.newStatus;

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, accountStatus: newStatus } : user
        )
      );
    } catch (error) {
      console.error(t('toggleStatusError'), error);
      setError(t('toggleStatusAttemptError'));
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><span className="loading loading-spinner loading-lg"></span></div>;
  if (error) return <div className="flex items-center justify-center min-h-screen"><div className="alert alert-error"><span>{error}</span></div></div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-8">{t('manageUsers')}</h1>
      <div className="w-full max-w-4xl bg-base-100 shadow-xl rounded-lg">
        <table className="table w-full bg-base-100 shadow-xl rounded-lg">
          <thead>
            <tr>
              <th>{t('username')}</th>
              <th>{t('email')}</th>
              <th>{t('role')}</th>
              <th>{t('phone')}</th>
              <th>{t('birthDate')}</th>
              <th>{t('gender')}</th>
              <th>{t('status')}</th>
              <th>{t('actions')}</th>
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
                <td>{user.accountStatus === 'healthy' ? t('active') : t('disabled')}</td>
                <td>
                  <button
                    onClick={() => handleToggleUserStatus(user.id)}
                    className={`btn btn-sm ${user.accountStatus === 'healthy' ? 'btn-error' : 'btn-primary'}`}
                  >
                    {user.accountStatus === 'healthy' ? t('disable') : t('enable')}
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
