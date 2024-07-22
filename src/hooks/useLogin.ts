import { signIn } from "next-auth/react";
import { useState } from "react";

export const useLogin = (handleCloseModal: () => void, onLoginSuccess?: () => void) => {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null); 
    const formData = new FormData(e.currentTarget);

    const result = await signIn('credentials', {
      redirect: false,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    });

    if (result?.error) {
      setError('Credenciais erradas. Tente novamente.');
    } else {
      if (onLoginSuccess) {
        onLoginSuccess();
      }
      handleCloseModal();
    }
  };

  return { error, handleSubmit };
};
