'use client';

import React, { useEffect, useState } from 'react';
import { useSession, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

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

export default function AdminRequestSellers() {
  const t = useTranslations('AdminRequestSellersPage');
  const [requests, setRequests] = useState<SellerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const checkAdminRole = async () => {
      const session = await getSession();
      if (!session || session.user?.role !== 'admin') {
        router.push('/');
      }
    };
    
    checkAdminRole();
  }, [router]);

  useEffect(() => {
    if (status === 'authenticated') {
      const fetchRequests = async () => {
        try {
          const response = await fetch('/api/admin/sellers');
          if (!response.ok) throw new Error(t('fetchError'));
          const { requests } = await response.json();
          setRequests(requests);
        } catch (err) {
          setError(err instanceof Error ? err.message : t('unknownError'));
        } finally {
          setLoading(false);
        }
      };
      fetchRequests();
    }
  }, [status, t]);

  const handleApproval = async (requestId: string) => {
    if (!window.confirm(t('confirmApproval'))) return;

    try {
      const response = await fetch(`/api/admin/sellers/${requestId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      });
      if (!response.ok) throw new Error(t('approvalError'));
      setRequests(prev => prev.map(r => (r.id === requestId ? { ...r, status: 'approved' } : r)));
    } catch {
      setError(t('approvalAttemptError'));
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><span className="loading loading-spinner loading-lg"></span></div>;
  if (error) return <div className="flex items-center justify-center min-h-screen"><div className="alert alert-error"><span>{error}</span></div></div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-8">{t('manageRequests')}</h1>
      <div className="w-full max-w-4xl">
        <table className="table w-full bg-base-100 shadow-xl rounded-lg">
          <thead>
            <tr>
              <th>{t('companyName')}</th>
              <th>{t('userName')}</th>
              <th>{t('userEmail')}</th>
              <th>{t('nif')}</th>
              <th>{t('status')}</th>
              <th>{t('pdf')}</th>
              <th>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(({ id, companyName, userName, userEmail, nif, status, pdfFileUrl }) => (
              <tr key={id}>
                <td>{companyName}</td>
                <td>{userName}</td>
                <td>{userEmail}</td>
                <td>{nif}</td>
                <td>{status === 'approved' ? t('approved') : t('pending')}</td>
                <td>
                  {pdfFileUrl ? <a href={pdfFileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">{t('viewPdf')}</a> : 'N/A'}
                </td>
                <td>
                  {status === 'pending' ? (
                    <button
                      onClick={() => handleApproval(id)}
                      className="btn btn-sm btn-success"
                    >
                      {t('approve')}
                    </button>
                  ) : (
                    <span className="btn btn-sm btn-disabled">{t('approved')}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
