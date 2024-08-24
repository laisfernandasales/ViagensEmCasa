'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useLocale } from 'next-intl';

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  isRead: boolean;
}

export default function NotificationsPage() {
  const router = useRouter();
  const locale = useLocale();
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUnread, setShowUnread] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.user) {
      setLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      try {
        const response = await fetch(
          showUnread ? `/api/notifications/get-all-unread` : `/api/notifications/get-all`
        );
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
  }, [locale, showUnread, session, status]);

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications/markread', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId }),
      });
      setNotifications((prev) =>
        prev.filter((n) => n.id !== notificationId)
      );
    } catch (err) {
      console.error('Erro ao marcar notificação como lida:', err);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await fetch('/api/notifications/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId }),
      });
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (err) {
      console.error('Erro ao apagar notificação:', err);
    }
  };

  const deleteAllNotifications = async () => {
    try {
      await fetch('/api/notifications/deleteAll', {
        method: 'POST',
      });
      setNotifications([]);
    } catch (err) {
      console.error('Erro ao apagar todas as notificações:', err);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!session?.user) {
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
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setShowUnread(false)}
            className={`btn ${!showUnread ? 'btn-primary' : 'btn-outline'}`}
          >
            Todas as Notificações
          </button>
          <button
            onClick={() => setShowUnread(true)}
            className={`btn ${showUnread ? 'btn-primary' : 'btn-outline'} ml-2`}
          >
            Notificações Não Lidas
          </button>
        </div>
        <div className="flex flex-col space-y-6">
          {notifications.length === 0 ? (
            <div className="text-center text-base-content/70">
              {showUnread ? 'Você não tem notificações novas.' : 'Você não tem notificações.'}
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                markAsRead={markAsRead}
                deleteNotification={deleteNotification}
              />
            ))
          )}
          {notifications.length > 0 && (
            <button onClick={deleteAllNotifications} className="btn btn-danger mt-4">
              Apagar Todas as Notificações
            </button>
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

const NotificationItem = ({
  notification,
  markAsRead,
  deleteNotification,
}: {
  notification: Notification;
  markAsRead: (notificationId: string) => void;
  deleteNotification: (notificationId: string) => void;
}) => (
  <div className="p-4 bg-base-100 border border-base-content/20 rounded-lg">
    <div>
      <h3 className="text-xl font-bold text-primary">{notification.title}</h3>
      <p className="text-base-content mt-2">{notification.message}</p>
    </div>
    <div className="flex justify-between items-center mt-4">
      <span className="text-sm text-base-content/60">
        {new Date(notification.timestamp).toLocaleString()}
      </span>
      <div className="flex space-x-2">
        {!notification.isRead && (
          <button onClick={() => markAsRead(notification.id)} className="btn btn-primary btn-sm">
            Marcar como Lida
          </button>
        )}
        <button onClick={() => deleteNotification(notification.id)} className="btn btn-danger btn-sm">
          Apagar
        </button>
      </div>
    </div>
  </div>
);
