import { useState, useCallback } from 'react';
import { getSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { Session } from 'next-auth';

interface UseLogoutOptions {
  locale: string;
}

export const useLogout = ({ locale }: UseLogoutOptions) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false); 
  const router = useRouter();

  const fetchSession = useCallback(async () => {
    const session = await getSession();
    setSession(session);
    setLoading(false);

    if (session && !session.user?.verifiedEmail) {
      router.push(`/${locale}/profile/verify-email`);
    }
  }, [locale, router]);

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    try {
      await signOut({ redirect: false });
      setSession(null);

      setTimeout(() => {
        window.location.replace(`/${locale}`);
      }, 100);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }, [locale]);

  return {
    session,
    loading,
    loggingOut,
    handleLogout,
    fetchSession,
  };
};
