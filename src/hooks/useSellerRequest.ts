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
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar a solicitação');
      }

      // Se a solicitação foi bem-sucedida, redireciona o usuário para a página de perfil
      const locale = pathname.split('/')[1];
      router.push(`/${locale}/profile`);
    } catch (err) {
      setError('Ocorreu um erro ao enviar sua solicitação. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return { submitRequest, loading, error };
};
