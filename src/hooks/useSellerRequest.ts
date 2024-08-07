import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export const useSellerRequest = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitRequest = async (formData: FormData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/user-request-seller', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao enviar a solicitação');
      }

      const locale = pathname.split('/')[1];
      router.push(`/${locale}/profile`);
    } catch (err) {
      console.error('Error submitting seller request:', err);
      setError('Ocorreu um erro ao enviar sua solicitação. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return { submitRequest, loading, error };
};
