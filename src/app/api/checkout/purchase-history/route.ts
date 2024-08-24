import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/services/database/firebaseAdmin';
import { auth } from '@/services/auth/auth';
import { Timestamp } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const userId = session.user.id;
    const salesSnapshot = await firestore.collection('sales').get();

    const userSales = salesSnapshot.docs
      .filter((doc) => doc.data().userId === userId)
      .map((doc) => {
        const data = doc.data();

        let createdAtISO = null;
        if (data.createdAt instanceof Timestamp) {
          createdAtISO = data.createdAt.toDate().toISOString();
        } else if (data.createdAt instanceof Date) {
          createdAtISO = data.createdAt.toISOString();
        } else if (typeof data.createdAt === 'string') {
          createdAtISO = new Date(data.createdAt).toISOString();
        }

        return {
          id: doc.id,
          ...data,
          createdAt: createdAtISO,
        };
      });

    return NextResponse.json({ userSales }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar o histórico de compras:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
