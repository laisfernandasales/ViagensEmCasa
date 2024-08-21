import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from 'next-auth/react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { realtimeDatabase } from '@/services/database/firebase';  // Certifique-se de que o caminho está correto

const NotificationMenu = ({ locale }: { locale: string }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleClickOutside = (event: MouseEvent) => {
    if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target as Node)) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      try {
        const response = await fetch('/api/notifications/unread');
        if (!response.ok) {
          throw new Error('Erro ao buscar notificações não lidas');
        }
        const unreadNotifications = await response.json();
        setNotificationCount(unreadNotifications.length);
      } catch (error) {
        console.error('Erro ao buscar notificações não lidas:', error);
      }
    };

    fetchUnreadNotifications();

    const setupRealtimeListener = async () => {
      const session = await getSession();
      const userId = session?.user?.id;

      if (userId) {
        const notificationRef = ref(realtimeDatabase, `notifications_alerts/${userId}`);

        const unsubscribe = onValue(notificationRef, (snapshot) => {
          if (snapshot.exists()) {
            // Atualiza o contador de notificações com base nas mudanças no Realtime Database
            setNotificationCount((prevCount) => prevCount + 1);
          }
        });

        // Limpeza da escuta em tempo real ao desmontar o componente
        return () => unsubscribe();
      }
    };

    setupRealtimeListener();
  }, []);

  const handleViewNotifications = () => {
    router.push(`/${locale}/profile/notifications`);
  };

  return (
    <div className="dropdown dropdown-end" ref={notificationDropdownRef}>
      <div
        tabIndex={0}
        role="button"
        className="btn btn-ghost btn-circle"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <div className="indicator">
          <span className="icon-[mdi--bell] h-5 w-5 text-base-content"></span>
          {notificationCount > 0 && (
            <span className="badge badge-sm indicator-item bg-primary text-white">
              {notificationCount}
            </span>
          )}
        </div>
      </div>
      {dropdownOpen && (
        <div
          tabIndex={0}
          className="card card-compact dropdown-content bg-base-100 z-[1] mt-3 w-52 shadow"
        >
          <div className="card-body">
            <span className="text-lg font-bold text-base-content">Notificações</span>
            {notificationCount > 0 ? (
              <span className="text-info">Você tem {notificationCount} novas notificações</span>
            ) : (
              <span className="text-info">Não tem notificações</span>
            )}
            <button className="btn btn-primary mt-3" onClick={handleViewNotifications}>
              Ver Notificações
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationMenu;
