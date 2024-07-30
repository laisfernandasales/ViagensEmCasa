// app/api/marketplace/route.ts
import { NextResponse } from 'next/server';
import { firestore } from '@/services/database/firebaseAdmin';

export async function GET() {
  try {
    const productsSnapshot = await firestore.collection('products').get();
    const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
