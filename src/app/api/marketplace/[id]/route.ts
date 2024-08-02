import { NextResponse } from 'next/server';
import { firestore } from '@/services/database/firebaseAdmin';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productId = params.id;

   
    const productDoc = await firestore.collection('products').doc(productId).get();

    if (!productDoc.exists) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

   
    const product = { id: productDoc.id, ...productDoc.data() };

    
    return NextResponse.json({ product }, { status: 200 });
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}
