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
    console.log("User ID from session:", userId);

    const salesSnapshot = await firestore.collection('Ticketsaleshistory').get();

    console.log("Total documents found:", salesSnapshot.size);

    const userSales = salesSnapshot.docs
      .filter((doc) => {
        const data = doc.data();
        console.log("Document data:", data);
        return data.userId === userId;
      })
      .map((doc) => {
        const data = doc.data();

        let purchasedAtISO = null;
        if (data.purchasedAt instanceof Timestamp) {
          purchasedAtISO = data.purchasedAt.toDate().toISOString();
        } else if (data.purchasedAt instanceof Date) {
          purchasedAtISO = data.purchasedAt.toISOString();
        } else if (typeof data.purchasedAt === 'string') {
          purchasedAtISO = new Date(data.purchasedAt).toISOString();
        }

        return {
          id: doc.id,
          ticketName: data.ticketName || '',
          ticketQuantity: data.ticketQuantity || 0,
          totalPrice: data.totalPrice || 0,
          purchasedAt: purchasedAtISO,
          pdfUrl: data.pdfUrl || '', // Adiciona a URL do PDF ao objeto de resposta
        };
      });

    console.log("User sales:", userSales);

    return NextResponse.json({ userSales }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar o histórico de compras:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}