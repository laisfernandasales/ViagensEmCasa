import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/services/auth/auth';
import { firestore } from '@/services/database/firebaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const notificationsRef = firestore.collection('users').doc(userId).collection('notifications');
    const snapshot = await notificationsRef.get();

    const batch = firestore.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Erro ao apagar todas as notificações:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
