import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/services/auth/auth';
import { firestore } from '@/services/database/firebaseAdmin';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const notificationsRef = firestore
      .collection('users')
      .doc(userId)
      .collection('notifications')
      .where('isRead', '==', false);

    const snapshot = await notificationsRef.get();

    if (snapshot.empty) {
      return NextResponse.json([], { status: 200 });
    }

    const unreadNotifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(unreadNotifications, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar notificações não lidas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
