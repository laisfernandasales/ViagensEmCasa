import { auth } from '@/services/auth/auth'; // Certifique-se de usar o caminho correto para o seu arquivo auth

export default async function UserProfile() {
  const session = await auth();

  if (!session?.user) return <div>You are not logged in</div>;

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold">UserProfile</h1>
        <p className="text-2xl mt-4">Welcome, {session.user.id}</p>
        <p className="text-xl mt-2">Email: {session.user.email}</p>
        <p className="text-xl mt-2">User ID: {session.user.id}</p>
      </div>
    </div>
  );
}
