import { useState, useRef, useEffect } from 'react';

const NotificationMenu = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);
  const notificationCount = 0; // Este número deve ser dinâmico baseado na lógica futura.

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
              // Aqui, mais tarde, você pode adicionar a lista de notificações
              <span className="text-info">Você tem {notificationCount} novas notificações</span>
            ) : (
              <span className="text-info">Não tem notificações</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationMenu;
