import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/services/auth/auth';
import { firestore, realtimeDatabase } from '@/services/database/firebaseAdmin';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const notificationsRef = firestore.collection('users').doc(userId).collection('notifications');
    const snapshot = await notificationsRef.get();

    if (snapshot.empty) {
      return NextResponse.json([], { status: 200 });
    }

    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(notifications, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const { userId, title, message } = await req.json();

    if (!userId || !title || !message) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    const notificationsRef = firestore.collection('users').doc(userId).collection('notifications');
    const timestamp = Date.now(); 
    const newNotification = {
      title,
      message,
      isRead: false,
      timestamp,
    };
    const docRef = await notificationsRef.add(newNotification);


    const notificationAlertRef = realtimeDatabase.ref(`notifications_alerts/${userId}`);
    await notificationAlertRef.set({
      notificationId: docRef.id,
      timestamp, 
    });

    return NextResponse.json({ id: docRef.id, ...newNotification }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
