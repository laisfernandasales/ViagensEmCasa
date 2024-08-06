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
  userEmail: string; // Email of the user
  userName: string; // Username of the user
}

export default function Admin() {
  const [requests, setRequests] = useState<SellerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('/api/admin/all-seller-requests');
        if (!response.ok) {
          throw new Error('Erro ao buscar solicitações');
        }

        const data = await response.json();
        setRequests(data.requests);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Ocorreu um erro desconhecido');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleApproval = async (requestId: string) => {
    try {
      const confirmApproval = window.confirm('Tem certeza que deseja aprovar esta solicitação?');
      if (!confirmApproval) return;

      const response = await fetch(`/api/admin/request-approve-seller`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestId }),
      });

      if (!response.ok) {
        throw new Error('Erro ao aprovar solicitação');
      }

      setRequests(prevRequests =>
        prevRequests.map(request =>
          request.id === requestId ? { ...request, status: 'approved' } : request
        )
      );
    } catch (err) {
      setError('Ocorreu um erro ao tentar aprovar a solicitação.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-8">Solicitações de Vendedores</h1>
      <div className="w-full max-w-4xl">
        <table className="table w-full bg-base-100 shadow-xl rounded-lg">
          <thead>
            <tr>
              <th>Nome da Empresa</th>
              <th>Nome do Usuário</th> {/* Display user's name */}
              <th>Email do Usuário</th> {/* Display user's email */}
              <th>NIF</th>
              <th>Status</th>
              <th>PDF</th>
              <th>Aprovar</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(request => (
              <tr key={request.id}>
                <td>{request.companyName}</td>
                <td>{request.userName}</td> {/* Display user's name */}
                <td>{request.userEmail}</td> {/* Display user's email */}
                <td>{request.nif}</td>
                <td>{request.status}</td>
                <td>
                  {request.pdfFileUrl ? (
                    <a
                      href={request.pdfFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      Visualizar PDF
                    </a>
                  ) : (
                    'N/A'
                  )}
                </td>
                <td>
                  <input
                    type="checkbox"
                    onChange={() => handleApproval(request.id)}
                    checked={request.status === 'approved'}
                    disabled={request.status === 'approved'}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
