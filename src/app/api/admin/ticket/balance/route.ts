  import { NextRequest, NextResponse } from 'next/server';
  import { firestore } from '@/services/database/firebaseAdmin';

  export async function GET(req: NextRequest) {
    try {
      // Recupera todos os documentos da coleção TicketSalesHistory
      const snapshot = await firestore.collection('Ticketsaleshistory').get();

      let totalBalance = 0;

      // Calcula o saldo total
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.totalPrice && !isNaN(data.totalPrice)) {
          totalBalance += parseFloat(data.totalPrice);
        }
      });

      // Retorna o saldo total
      return NextResponse.json({ totalBalance: totalBalance.toFixed(2) }, { status: 200 });
    } catch (error) {
      console.error('Erro ao calcular o saldo:', error);
      return NextResponse.json({ error: 'Erro ao calcular o saldo' }, { status: 500 });
    }
  }
