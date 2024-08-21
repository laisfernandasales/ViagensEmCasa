'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from 'next-auth/react';

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
}

export default function NotificationsPage({ params: { locale } }: { params: { locale: string } }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionExists, setSessionExists] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const session = await getSession();
        if (!session?.user) {
          setSessionExists(false);
          setLoading(false);
          return;
        }

        setSessionExists(true);

        const response = await fetch(`/api/notifications`);
        if (!response.ok) throw new Error('Falha ao buscar notificações');

        const data = await response.json();
        if (data.error) throw new Error(data.error);

        setNotifications(data);
      } catch (err) {
        setError('Ocorreu um erro ao buscar as notificações.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [locale]);

  if (loading) return <LoadingSpinner />;

  if (!sessionExists) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-200">
        <div className="bg-base-100 p-8 rounded-lg shadow-lg max-w-md w-full text-center space-y-4">
          <h1 className="text-3xl font-bold text-primary">Sessão não encontrada</h1>
          <p className="text-base-content">Faça login para poder ver suas notificações.</p>
          <button onClick={() => router.push('/')} className="btn btn-primary w-full">
            Ir para Home
          </button>
        </div>
      </div>
    );
  }

  if (error) return <ErrorAlert message={error} />;

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-base-100 shadow-lg rounded-lg p-8 border border-base-content/20">
        <h2 className="text-4xl font-bold text-center text-primary mb-8">Suas Notificações</h2>
        <div className="flex flex-col space-y-6">
          {notifications.length === 0 ? (
            <div className="text-center text-base-content/70">Você não tem notificações.</div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))
          )}
        </div>
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

const NotificationItem = ({ notification }: { notification: Notification }) => (
  <div className="p-4 bg-base-100 border border-base-content/20 rounded-lg">
    <h3 className="text-xl font-bold text-primary">{notification.title}</h3>
    <p className="text-base-content mt-2">{notification.message}</p>
    <p className="text-sm text-base-content/60 mt-4">
      {new Date(notification.timestamp).toLocaleString()}
    </p>
  </div>
);
