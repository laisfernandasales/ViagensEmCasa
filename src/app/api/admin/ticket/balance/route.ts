  import { NextRequest, NextResponse } from 'next/server';
  import { firestore } from '@/services/database/firebaseAdmin';

  export async function GET(req: NextRequest) {
    try {
      const snapshot = await firestore.collection('Ticketsaleshistory').get();

      let totalBalance = 0;

      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.totalPrice && !isNaN(data.totalPrice)) {
          totalBalance += parseFloat(data.totalPrice);
        }
      });

      return NextResponse.json({ totalBalance: totalBalance.toFixed(2) }, { status: 200 });
    } catch (error) {
      console.error('Erro ao calcular o saldo:', error);
      return NextResponse.json({ error: 'Erro ao calcular o saldo' }, { status: 500 });
    }
  }
