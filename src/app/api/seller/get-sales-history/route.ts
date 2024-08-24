import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/services/database/firebaseAdmin';
import { auth } from '@/services/auth/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const userId = session.user.id;
    const salesSnapshot = await firestore.collection('sales').get();

    let itemsSold: Record<string, { productName: string; totalQuantity: number; versionId: string; price: number }> = {};
    let totalRevenue = 0;

    salesSnapshot.forEach((doc) => {
      const saleData = doc.data();
      saleData.items.forEach((item: any) => {
        if (item.userId === userId) {
          const key = `${item.id}-${item.versionId}`;
          const itemTotalRevenue = item.quantity * item.price;

          if (itemsSold[key]) {
            itemsSold[key].totalQuantity += item.quantity;
            totalRevenue += itemTotalRevenue;
          } else {
            itemsSold[key] = {
              productName: item.productName,
              totalQuantity: item.quantity,
              versionId: item.versionId,
              price: item.price,
            };
            totalRevenue += itemTotalRevenue;
          }
        }
      });
    });

    const salesHistory = Object.values(itemsSold).map(item => ({
      ...item,
      totalRevenue: item.totalQuantity * item.price,
    }));

    return NextResponse.json({ salesHistory, totalRevenue }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar o histórico de vendas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
