import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ref, onValue } from 'firebase/database';
import { getSession } from 'next-auth/react';
import { realtimeDatabase } from '@/services/database/firebase';
import { useLocale, useTranslations } from 'next-intl';

const NotificationMenu = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('NotificationMenu');

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target as Node)) {
      setDropdownOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  const fetchUnreadNotifications = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/unnotifiedCount');
      if (!response.ok) {
        throw new Error(t('fetchError'));
      }
      const { unnotifiedCount } = await response.json();
      setNotificationCount(unnotifiedCount);
    } catch (error) {
      console.error(t('fetchErrorLog'), error);
    }
  }, [t]);

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
  }, [fetchUnreadNotifications]);

  const handleViewNotifications = async () => {
    try {
      const response = await fetch('/api/notifications/unnotifiedCount', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(t('markReadError'));
      }

      setNotificationCount(0);

      router.push(`/${locale}/profile/notifications`);
    } catch (error) {
      console.error(t('markReadErrorLog'), error);
    }
  };

  const getNotificationMessage = () => {
    if (notificationCount === 0) {
      return t('noNotifications');
    } else if (notificationCount === 1) {
      return t('oneNotification');
    } else {
      return t('multipleNotifications', { count: notificationCount });
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
            <span className="text-lg font-bold text-base-content">{t('notificationsTitle')}</span>
            <span className="text-info">{getNotificationMessage()}</span>
            <button className="btn btn-primary mt-3" onClick={handleViewNotifications}>
              {t('viewNotifications')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationMenu;
