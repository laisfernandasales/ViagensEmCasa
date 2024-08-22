import { NextRequest, NextResponse } from 'next/server';
import { firestore, realtimeDatabase } from '@/services/database/firebaseAdmin';
import { auth } from '@/services/auth/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const { requestId } = await req.json();
    if (!requestId) {
      return NextResponse.json({ error: 'Request ID não fornecido' }, { status: 400 });
    }

    const sellerRequestRef = firestore.collection('sellerRequests').doc(requestId);
    const sellerRequestDoc = await sellerRequestRef.get();
    if (!sellerRequestDoc.exists) {
      return NextResponse.json({ error: 'Solicitação não encontrada' }, { status: 404 });
    }

    const { userId } = sellerRequestDoc.data() || {};
    if (!userId) {
      return NextResponse.json({ error: 'User ID não encontrado na solicitação' }, { status: 400 });
    }

    const notificationsRef = firestore.collection('users').doc(userId).collection('notifications');
    const timestamp = Date.now();
    const newNotification = {
      title: 'Conta de Vendedor Aprovada',
      message: 'A sua conta foi aprovada para ser uma conta de vendedor. Pode começar a criar produtos e vender no mercado.',
      isRead: false,
      isNotified: false,
      timestamp,
    };

    await notificationsRef.add(newNotification);
    const notificationAlertRef = realtimeDatabase.ref(`notifications_alerts/${userId}`);
    await notificationAlertRef.set({
    timestamp,
    });

    await Promise.all([
      sellerRequestRef.update({ status: 'approved' }),
      firestore.collection('users').doc(userId).update({ role: 'seller' }),
    ]);

    return NextResponse.json({ message: 'Solicitação aprovada com sucesso, usuário atualizado para vendedor e notificação criada' }, { status: 200 });
  } catch (error) {
    console.error('Erro ao aprovar solicitação de vendedor:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ error: 'Erro ao aprovar solicitação de vendedor: ' + errorMessage }, { status: 500 });
  }
}
