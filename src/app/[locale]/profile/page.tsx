import { auth } from '@/services/auth/auth'; // Certifique-se de usar o caminho correto para o seu arquivo auth

export default async function UserProfile() {
  const session = await auth();

  if (!session?.user) return <div className="flex items-center justify-center min-h-screen">
    <div className="alert alert-warning shadow-lg">
      <div>
        <span>You are not logged in</span>
      </div>
    </div>
  </div>;

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl rounded-lg border border-primary">
        <div className="card-body text-center">
          <div className="avatar flex justify-center mb-4">
            <div className="ring-primary ring-offset-base-100 w-24 rounded-full ring ring-offset-2">
              <img src={session.user.image} alt="Profile Picture" />
            </div>
          </div>
          <p className="text-2xl mt-4">Bem vindo, {session.user.name}</p>
          <p className="text-xl mt-2">Email: {session.user.email}</p>
          <p className="text-xl mt-2">User ID: {session.user.id}</p>
        </div>
      </div>
    </div>
  );
}
