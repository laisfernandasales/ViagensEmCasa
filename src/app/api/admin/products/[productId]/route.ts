import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/services/database/firebaseAdmin';

export async function POST(req: NextRequest, { params }: { params: { productId: string } }) {
  const { productId } = params;

  try {
    const { enabled } = await req.json(); // Obter o estado desejado (true ou false) do corpo da requisição
    const productRef = firestore.collection('products').doc(productId);

    await productRef.update({ enabled }); // Atualiza o campo `enabled` no Firestore

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error updating product status:', error);
    return NextResponse.json({ error: 'Failed to update product status' }, { status: 500 });
  }
}
