'use client';
import React, { useEffect, useState } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  phone: string | null;
  birthDate: string | null;
  gender: string | null;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/users')
      .then((res) => {
        if (!res.ok) throw new Error('Erro ao buscar usuários');
        return res.json();
      })
      .then((data) => setUsers(data.users))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleDeleteUsers = async () => {
    if (!window.confirm('Tem certeza que deseja deletar os usuários selecionados?')) return;
    try {
      const response = await fetch('/api/admin/disable-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: selectedUsers }),
      });
      if (!response.ok) throw new Error('Erro ao deletar usuários');
      setUsers((prev) => prev.filter((user) => !selectedUsers.includes(user.id)));
      setSelectedUsers([]);
    } catch {
      setError('Ocorreu um erro desconhecido ao deletar usuários.');
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-base-200"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
  if (error) return <div className="flex items-center justify-center min-h-screen bg-base-200"><div className="alert alert-error shadow-lg w-full max-w-md"><div><span className="text-lg font-bold">Erro:</span><span>{error}</span></div></div></div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-base-200">
      <h1 className="text-5xl font-bold mb-8 text-primary">Lista de Usuários</h1>
      <div className="w-full max-w-6xl bg-base-100 rounded-lg shadow-lg overflow-hidden">
        <table className="table w-full text-left text-sm">
          <thead className="bg-base-300 text-xs uppercase">
            <tr>
              <th className="px-6 py-3">
                <input
                  type="checkbox"
                  onChange={(e) => setSelectedUsers(e.target.checked ? users.map((user) => user.id) : [])}
                  checked={selectedUsers.length === users.length}
                />
              </th>
              <th className="px-6 py-3">Nome de Usuário</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Telefone</th>
              <th className="px-6 py-3">Data de Nascimento</th>
              <th className="px-6 py-3">Gênero</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="bg-base-100 border-b hover:bg-base-200">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    onChange={() => handleSelectUser(user.id)}
                    checked={selectedUsers.includes(user.id)}
                  />
                </td>
                <td className="px-6 py-4">{user.username || 'N/A'}</td>
                <td className="px-6 py-4">{user.email || 'N/A'}</td>
                <td className="px-6 py-4">{user.role || 'N/A'}</td>
                <td className="px-6 py-4">{user.phone || 'N/A'}</td>
                <td className="px-6 py-4">{user.birthDate || 'N/A'}</td>
                <td className="px-6 py-4">{user.gender || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="btn btn-error mt-6" onClick={handleDeleteUsers} disabled={!selectedUsers.length}>
        Deletar Usuários Selecionados
      </button>
    </div>
  );
}
