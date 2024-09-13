import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/services/database/firebaseAdmin';

export async function GET(req: NextRequest) {
  try {
    const snapshot = await firestore.collection('Ticketsaleshistory').get();

    const balances: { [ticketName: string]: number } = {};

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.totalPrice && !isNaN(data.totalPrice) && data.ticketName) {
        const ticketName = data.ticketName;
        if (!balances[ticketName]) {
          balances[ticketName] = 0;
        }
        balances[ticketName] += parseFloat(data.totalPrice);
      }
    });

    // Convert balances to a more readable format
    const formattedBalances = Object.keys(balances).map(ticketName => ({
      ticketName,
      totalBalance: balances[ticketName].toFixed(2)
    }));

    return NextResponse.json({ balances: formattedBalances }, { status: 200 });
  } catch (error) {
    console.error('Erro ao calcular o saldo:', error);
    return NextResponse.json({ error: 'Erro ao calcular o saldo' }, { status: 500 });
  }
}