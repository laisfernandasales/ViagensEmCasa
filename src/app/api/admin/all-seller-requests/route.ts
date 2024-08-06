import { NextResponse } from 'next/server';
import { firestore } from '@/services/database/firebaseAdmin';

export async function GET() {
  try {
    const sellerRequestsRef = firestore.collection('sellerRequests');
    const snapshot = await sellerRequestsRef.get();

    // Array para armazenar as solicitações de vendedores com dados adicionais do usuário
    const requests = await Promise.all(snapshot.docs.map(async (doc) => {
      const data = doc.data();
      const userId = data.userId; // Supondo que o userId esteja armazenado em cada solicitação

      // Buscar dados do usuário
      const userDoc = await firestore.collection('users').doc(userId).get();
      const userData = userDoc.exists ? userDoc.data() : {};

      return {
        id: doc.id,
        ...data,
        userEmail: userData?.email || 'Email não encontrado',
        userName: userData?.username || 'Username não encontrado',
      };
    }));

    return NextResponse.json({ requests }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar solicitações de vendedores:', error);
    return NextResponse.json({ error: 'Erro ao buscar solicitações de vendedores' }, { status: 500 });
  }
}
