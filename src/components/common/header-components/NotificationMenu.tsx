import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ref, onValue } from 'firebase/database';
import { getSession } from 'next-auth/react';
import { realtimeDatabase } from '@/services/database/firebase';
import { useLocale } from 'next-intl';

const NotificationMenu = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const locale = useLocale();

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

  const fetchUnreadNotifications = async () => {
    try {
      const response = await fetch('/api/notifications/unnotifiedCount');
      if (!response.ok) {
        throw new Error('Erro ao buscar contagem de notificações não lidas');
      }
      const { unnotifiedCount } = await response.json();
      setNotificationCount(unnotifiedCount);
    } catch (error) {
      console.error('Erro ao buscar contagem de notificações não lidas:', error);
    }
  };

  useEffect(() => {
    const setupRealtimeListener = async () => {
      const session = await getSession();
      const userId = session?.user?.id;
  
      if (userId) {
        const notificationRef = ref(realtimeDatabase, `notifications_alerts/${userId}/timestamp`);
        const unsubscribe = onValue(notificationRef, (snapshot) => {
          if (snapshot.exists()) {
            fetchUnreadNotifications();
          }
        });
  
        return unsubscribe;
      }
    };
  
    const unsubscribeListener = setupRealtimeListener();
  
    return () => {
      if (unsubscribeListener instanceof Function) {
        unsubscribeListener();
      }
    };
  }, []);

  const handleViewNotifications = () => {
    router.push(`/${locale}/profile/notifications`);
  };

  const getNotificationMessage = () => {
    if (notificationCount === 0) {
      return 'Não tem notificações';
    } else if (notificationCount === 1) {
      return 'Você tem 1 nova notificação';
    } else {
      return `Você tem ${notificationCount} novas notificações`;
    }
  };

  return (
    <div className="dropdown dropdown-end" ref={notificationDropdownRef}>
      <button
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
      </button>
      {dropdownOpen && (
        <div className="card card-compact dropdown-content bg-base-100 z-[1] mt-3 w-52 shadow">
          <div className="card-body">
            <span className="text-lg font-bold text-base-content">Notificações</span>
            <span className="text-info">{getNotificationMessage()}</span>
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
