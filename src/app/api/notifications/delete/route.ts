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

    const { notificationId } = await req.json();
    if (!notificationId) {
      return NextResponse.json({ error: 'ID da notificação não fornecido' }, { status: 400 });
    }

    const notificationRef = firestore.collection('users').doc(userId).collection('notifications').doc(notificationId);

    await notificationRef.delete();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Erro ao apagar notificação:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
