import { NextResponse } from 'next/server';
import { firestore } from '@/services/database/firebaseAdmin';

export async function GET() {
  try {
    const sellerRequestsRef = firestore.collection('sellerRequests');
    const snapshot = await sellerRequestsRef.get();

    const requests = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ requests }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar solicitações de vendedores:', error);
    return NextResponse.json({ error: 'Erro ao buscar solicitações de vendedores' }, { status: 500 });
  }
}
