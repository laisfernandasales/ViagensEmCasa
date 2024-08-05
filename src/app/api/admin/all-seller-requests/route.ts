import { NextResponse } from 'next/server';
import { firestore } from '@/services/database/firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';

export async function GET() {
  try {
    const sellerRequestsRef = firestore.collection('sellerRequests');
    const snapshot = await sellerRequestsRef.get();

    const requests = snapshot.docs.map(doc => {
      const data = doc.data();
      
      // Convertendo qualquer campo Timestamp para Date
      if (data.createdAt instanceof Timestamp) {
        data.createdAt = data.createdAt.toDate();
      }
      
      return {
        id: doc.id,
        ...data,
      };
    });

    return NextResponse.json({ requests }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar solicitações de vendedores:', error);
    return NextResponse.json({ error: 'Erro ao buscar solicitações de vendedores' }, { status: 500 });
  }
}
