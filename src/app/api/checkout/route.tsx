import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/services/database/firebaseAdmin';
import { auth } from '@/services/auth/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const { name, nif, contactNumber, billingAddress, shippingAddress, paymentMethod, items } = await req.json();
    console.log('Received data:', { name, nif, contactNumber, billingAddress, shippingAddress, paymentMethod, items });

    const totalPaid = items.reduce((total: number, item: any) => total + item.price * item.quantity, 0);

    const salesRef = firestore.collection('sales').doc();
    await salesRef.set({
      userId: session.user.id,
      name,
      nif,
      contactNumber,
      billingAddress,
      shippingAddress,
      paymentMethod,
      items,
      totalPaid,
      createdAt: new Date(),
    });

    return NextResponse.json({ message: 'Compra realizada com sucesso!' }, { status: 200 });
  } catch (error) {
    console.error('Erro ao realizar a compra:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
