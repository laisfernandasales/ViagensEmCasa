'use client';
import React, { useEffect, useState } from 'react';

interface SellerRequest {
  id: string;
  companyName: string;
  businessAddress: string;
  phoneNumber: string;
  website?: string;
  nif: string;
  businessDescription: string;
  status: string;
  createdAt: string;
  pdfFileUrl?: string;
  userEmail: string;
  userName: string;
}

export default function Admin() {
  const [requests, setRequests] = useState<SellerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('/api/admin/all-seller-requests');
        if (!response.ok) throw new Error('Erro ao buscar solicitações');
        const { requests } = await response.json();
        setRequests(requests);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido');
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleApproval = async (requestId: string) => {
    if (!window.confirm('Tem certeza que deseja aprovar esta solicitação?')) return;
    try {
      const response = await fetch('/api/admin/request-approve-seller', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      });
      if (!response.ok) throw new Error('Erro ao aprovar solicitação');
      setRequests(prev => prev.map(r => (r.id === requestId ? { ...r, status: 'approved' } : r)));
    } catch {
      setError('Ocorreu um erro ao tentar aprovar a solicitação.');
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><span className="loading loading-spinner loading-lg"></span></div>;
  if (error) return <div className="flex items-center justify-center min-h-screen"><div className="alert alert-error"><span>{error}</span></div></div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-8">Solicitações de Vendedores</h1>
      <div className="w-full max-w-4xl">
        <table className="table w-full bg-base-100 shadow-xl rounded-lg">
          <thead>
            <tr>
              <th>Nome da Empresa</th>
              <th>Nome do Usuário</th>
              <th>Email do Usuário</th>
              <th>NIF</th>
              <th>Status</th>
              <th>PDF</th>
              <th>Aprovar</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(({ id, companyName, userName, userEmail, nif, status, pdfFileUrl }) => (
              <tr key={id}>
                <td>{companyName}</td>
                <td>{userName}</td>
                <td>{userEmail}</td>
                <td>{nif}</td>
                <td>{status}</td>
                <td>
                  {pdfFileUrl ? <a href={pdfFileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Visualizar PDF</a> : 'N/A'}
                </td>
                <td>
                  <input type="checkbox" onChange={() => handleApproval(id)} checked={status === 'approved'} disabled={status === 'approved'} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
