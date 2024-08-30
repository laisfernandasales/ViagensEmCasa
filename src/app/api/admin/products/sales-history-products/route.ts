import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/services/database/firebaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
   
    const salesSnapshot = await firestore.collection('sales').get();

    const salesData = await Promise.all(
      salesSnapshot.docs.map(async (doc) => {
        const saleData = doc.data();

       
        const userDoc = await firestore.collection('users').doc(saleData.userId).get();
        const userData = userDoc.exists ? userDoc.data() : null;
        const username = userData?.username || 'Usuário desconhecido';
        const email = userData?.email || 'Email desconhecido';

       
        const products = saleData.items.map((item: any) => ({
          productName: item.productName,
          price: item.price,
          quantity: item.quantity,
          totalPrice: item.price * item.quantity,
        }));

     
        let purchaseDate = null;
        if (saleData.purchaseDate) {
          if (typeof saleData.purchaseDate.toDate === 'function') {
            purchaseDate = saleData.purchaseDate.toDate().toISOString();
          } else if (typeof saleData.purchaseDate === 'string') {
            purchaseDate = new Date(saleData.purchaseDate).toISOString();
          }
        }

        return {
          id: doc.id,
          username: username,
          email: email,
          products: products,
          totalPaid: saleData.totalPaid,
          purchaseDate: purchaseDate,
        };
      })
    );

    return NextResponse.json({ sales: salesData }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar o histórico de vendas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
