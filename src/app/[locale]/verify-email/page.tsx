import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

const VerifyEmail = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Wait for session to load

    // If the session is not available or email is not verified, redirect to the verify email page
    if (session && session.user.verifiedEmail === false) {
      router.push('/verify-email'); // Adjust the path as needed
    }
  }, [session, status, router]);

  return (
    <div>
      {/* You can add a loading spinner or other content here */}
      <p>Checking email verification status...</p>
    </div>
  );
};

export default VerifyEmail;