import { NextResponse } from 'next/server';
import { firestore } from '@/services/database/firebaseAdmin';

export async function GET() {
  try {
    const productsSnapshot = await firestore.collection('products').where('enabled', '==', true).get();
    const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const randomProducts = products.sort(() => 0.5 - Math.random()).slice(0, 5);

    return NextResponse.json({ products: randomProducts }, { status: 200 });
  } catch (error) {
    console.error('Error fetching highlighted products:', error);
    return NextResponse.json({ error: 'Failed to fetch highlighted products' }, { status: 500 });
  }
}
